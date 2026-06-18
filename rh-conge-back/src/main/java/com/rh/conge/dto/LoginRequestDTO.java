package com.rh.conge.dto;

import lombok.Data;

@Data
public class LoginRequestDTO {
    private String email;
    private String password;
}