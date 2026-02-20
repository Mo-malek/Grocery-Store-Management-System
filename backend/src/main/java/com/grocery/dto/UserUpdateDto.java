package com.grocery.dto;

import lombok.Data;

@Data
public class UserUpdateDto {
    private String fullName;
    private String username;
    private String role;
    private Boolean active;
}
