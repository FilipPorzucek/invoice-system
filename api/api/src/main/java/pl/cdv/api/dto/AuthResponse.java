package pl.cdv.api.dto;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AuthResponse {
    private String access_token;
    private String name;
    private String email;
    private String role;
    private String dateOfBirth;
}
