package com.grocery.config;

import com.grocery.entity.User;
import com.grocery.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@RequiredArgsConstructor
public class DataSeeder {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Bean
    public CommandLineRunner initData() {
        return args -> {
            if (userRepository.count() == 0) {
                User admin = User.builder()
                        .username("admin")
                        .password(passwordEncoder.encode("password"))
                        .role("ROLE_MANAGER")
                        .fullName("مدير النظام")
                        .active(true)
                        .build();
                userRepository.save(admin);
                System.out.println(">>>  user created (admin / password)");
            }
        };
    }
}
