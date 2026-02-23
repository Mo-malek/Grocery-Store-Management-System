package com.grocery.controller;

import com.grocery.dto.FcmTokenRequest;
import com.grocery.entity.User;
import com.grocery.repository.UserRepository;
import com.grocery.service.NotificationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@lombok.extern.slf4j.Slf4j
public class NotificationController {

    private final NotificationService notificationService;
    private final UserRepository userRepository;

    @PostMapping("/subscribe")
    public ResponseEntity<Void> subscribe(@Valid @RequestBody FcmTokenRequest request, Authentication authentication) {
        String username = authentication.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        notificationService.saveToken(user, request.getToken(), request.getDeviceType());
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/unsubscribe")
    public ResponseEntity<Void> unsubscribe(@RequestParam String token) {
        log.info("Unsubscribe request received for token: {}", token);
        notificationService.removeToken(token);
        return ResponseEntity.ok().build();
    }

    @GetMapping
    public ResponseEntity<java.util.List<com.grocery.dto.AppNotificationDto>> getNotifications(
            Authentication authentication) {
        String username = authentication.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        java.util.List<com.grocery.dto.AppNotificationDto> notifications = notificationService
                .getUserNotifications(user);
        return ResponseEntity.ok(notifications);
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Long> getUnreadCount(Authentication authentication) {
        String username = authentication.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return ResponseEntity.ok(notificationService.getUnreadCount(user));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long id, Authentication authentication) {
        String username = authentication.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        notificationService.markAsRead(id, user);
        return ResponseEntity.ok().build();
    }
}
