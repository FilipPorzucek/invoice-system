package pl.cdv.api.dto;

import lombok.Data;

import java.time.LocalDate;

@Data
public class UpdateUserRequest {
    private String firstName;
    private String lastName;
    private String email;
    private String role;
    private LocalDate dateOfBirth;
}
