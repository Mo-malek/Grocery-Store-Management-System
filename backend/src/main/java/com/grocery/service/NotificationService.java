package com.grocery.service;

import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.FirebaseMessagingException;
import com.google.firebase.messaging.Message;
import com.google.firebase.messaging.Notification;
import com.grocery.dto.NotificationRequest;
import com.grocery.dto.AppNotificationDto;
import com.grocery.entity.FcmToken;
import com.grocery.entity.User;
import com.grocery.entity.AppNotification;
import com.grocery.repository.FcmTokenRepository;
import com.grocery.repository.AppNotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final FcmTokenRepository tokenRepository;
    private final AppNotificationRepository appNotificationRepository;

    public void saveToken(User user, String tokenStr, String deviceType) {
        Optional<FcmToken> existingToken = tokenRepository.findByToken(tokenStr);
        if (existingToken.isPresent()) {
            FcmToken token = existingToken.get();
            if (!token.getUser().getId().equals(user.getId())) {
                token.setUser(user);
                token.setLastUpdated(LocalDateTime.now());
                tokenRepository.save(token);
            }
            return;
        }

        FcmToken newToken = FcmToken.builder()
                .user(user)
                .token(tokenStr)
                .deviceType(deviceType)
                .build();
        tokenRepository.save(newToken);
        log.info("Saved new FCM token for user: {}", user.getUsername());
    }

    public void removeToken(String tokenStr) {
        tokenRepository.deleteByToken(tokenStr);
        log.info("Removed FCM token");
    }

    public void sendToUser(User user, NotificationRequest request) {
        if (user == null)
            return;
        sendToUsers(java.util.Collections.singletonList(user), request);
    }

    public void sendToRole(String role, NotificationRequest request) {
        sendToRoles(java.util.Collections.singletonList(role), request);
    }

    public void sendToRoles(java.util.Collection<String> roles, NotificationRequest request) {
        try {
            java.util.Set<User> targetUsers = new java.util.HashSet<>();
            for (String role : roles) {
                List<FcmToken> tokens = tokenRepository.findByUserRole(role);
                for (FcmToken token : tokens) {
                    if (token.getUser() != null) {
                        targetUsers.add(token.getUser());
                    }
                }
            }
            sendToUsers(targetUsers, request);
        } catch (Exception e) {
            log.error("Failed to send notification to roles: {}", roles, e);
        }
    }

    public void sendToAll(NotificationRequest request) {
        try {
            List<FcmToken> allTokens = tokenRepository.findAll();
            java.util.Set<User> allUsers = allTokens.stream()
                    .map(FcmToken::getUser)
                    .filter(java.util.Objects::nonNull)
                    .collect(java.util.stream.Collectors.toSet());
            sendToUsers(allUsers, request);
        } catch (Exception e) {
            log.error("Failed to broadcast notification", e);
        }
    }

    public void sendToUsers(java.util.Collection<User> users, NotificationRequest request) {
        if (users == null || users.isEmpty())
            return;

        for (User user : users) {
            try {
                // 1. Save ONE notification entry in database for the user history
                saveAppNotification(user, request);

                // 2. Send to all active tokens (devices) of THIS user
                List<FcmToken> tokens = tokenRepository.findByUser(user);
                for (FcmToken token : tokens) {
                    sendToToken(token.getToken(), request);
                }
            } catch (Exception e) {
                log.error("Failed to send notification to user ID: {}", user.getId(), e);
            }
        }
    }

    private void saveAppNotification(User user, NotificationRequest request) {
        AppNotification notification = AppNotification.builder()
                .user(user)
                .title(request.getTitle())
                .body(request.getBody())
                .type(request.getData() != null ? request.getData().getOrDefault("type", "SYSTEM") : "SYSTEM")
                .relatedEntityId(request.getData() != null ? request.getData().get("orderId") : null)
                .build();
        appNotificationRepository.save(notification);
    }

    public void sendToToken(String tokenStr, NotificationRequest request) {
        try {
            Notification notification = Notification.builder()
                    .setTitle(request.getTitle())
                    .setBody(request.getBody())
                    .setImage(request.getImage())
                    .build();

            Message.Builder messageBuilder = Message.builder()
                    .setToken(tokenStr)
                    .setNotification(notification);

            if (request.getData() != null) {
                messageBuilder.putAllData(request.getData());
            }

            String response = FirebaseMessaging.getInstance().send(messageBuilder.build());
            log.info("Successfully sent message: {}", response);
        } catch (FirebaseMessagingException e) {
            log.error("Failed to send Firebase message", e);
            if (e.getMessagingErrorCode() != null) {
                switch (e.getMessagingErrorCode()) {
                    case INVALID_ARGUMENT:
                    case UNREGISTERED:
                        log.info("Removing invalid/unregistered token: {}", tokenStr);
                        removeToken(tokenStr);
                        break;
                    default:
                        break;
                }
            }
        }
    }

    public List<AppNotificationDto> getUserNotifications(User user) {
        return appNotificationRepository.findByUserOrderByCreatedAtDesc(user).stream()
                .map(AppNotificationDto::fromEntity)
                .collect(Collectors.toList());
    }

    public long getUnreadCount(User user) {
        return appNotificationRepository.countByUserAndIsReadFalse(user);
    }

    public void markAsRead(Long notificationId, User user) {
        AppNotification notification = appNotificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        if (!notification.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Not authorized to read this notification");
        }

        notification.setRead(true);
        appNotificationRepository.save(notification);
    }

    public void markAllAsRead(User user) {
        List<AppNotification> unread = appNotificationRepository.findByUserAndIsReadFalseOrderByCreatedAtDesc(user);
        for (AppNotification n : unread) {
            n.setRead(true);
        }
        appNotificationRepository.saveAll(unread);
    }
}
