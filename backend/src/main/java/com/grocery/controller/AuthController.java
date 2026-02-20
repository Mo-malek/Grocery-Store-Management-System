package com.grocery.controller;

import com.grocery.config.JwtUtils;
import com.grocery.dto.AuthRequest;
import com.grocery.dto.AuthResponse;
import com.grocery.dto.RegisterRequest;
import com.grocery.entity.User;
import com.grocery.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;
    private final JwtUtils jwtUtils;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody AuthRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword()));

        final UserDetails userDetails = userDetailsService.loadUserByUsername(request.getUsername());
        final String jwt = jwtUtils.generateToken(userDetails);

        User user = userRepository.findByUsername(request.getUsername()).orElseThrow();

        return ResponseEntity.ok(AuthResponse.builder()
                .token(jwt)
                .username(user.getUsername())
                .role(user.getRole())
                .build());
    }

    @PostMapping("/register")
    public ResponseEntity<String> register(@Valid @RequestBody RegisterRequest request) {
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            return ResponseEntity.badRequest().body("اسم المستخدم موجود بالفعل");
        }

        User user = User.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .role("ROLE_CUSTOMER")
                .active(true)
                .build();

        userRepository.save(user);
        return ResponseEntity.ok("تم إنشاء الحساب بنجاح");
    }

    @PostMapping("/register-initial")
    public ResponseEntity<String> registerInitial(@RequestBody User user) {
        if (userRepository.count() > 0) {
            return ResponseEntity.badRequest().body("Initial user already exists");
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        // Keep roles consistent across the app (MANAGER / CASHIER / CUSTOMER).
        user.setRole("ROLE_MANAGER");
        user.setActive(true);
        userRepository.save(user);
        return ResponseEntity.ok("Initial user created");
    }
}
