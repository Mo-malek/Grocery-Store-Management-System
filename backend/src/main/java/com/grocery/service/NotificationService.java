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
        try {
            saveAppNotification(user, request);
            List<FcmToken> tokens = tokenRepository.findByUser(user);
            for (FcmToken token : tokens) {
                sendToToken(token.getToken(), request);
            }
        } catch (Exception e) {
            log.error("Failed to send notification to user: {}", user.getUsername(), e);
        }
    }

    public void sendToRole(String role, NotificationRequest request) {
        try {
            List<FcmToken> tokens = tokenRepository.findByUserRole(role);
            for (FcmToken token : tokens) {
                User user = token.getUser();
                saveAppNotification(user, request);
                sendToToken(token.getToken(), request);
            }
        } catch (Exception e) {
            log.error("Failed to send notification to role: {}", role, e);
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
}
