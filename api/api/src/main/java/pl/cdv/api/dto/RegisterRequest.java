package pl.cdv.api.dto;

import java.time.LocalDate;

public class RegisterRequest {
    private String name;
    private String email;
    private String password;
    private LocalDate dateOfBirth;
}
