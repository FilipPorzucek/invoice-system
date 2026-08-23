package pl.cdv.api.services;

import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import pl.cdv.api.dto.AuthResponse;
import pl.cdv.api.dto.LoginRequest;
import pl.cdv.api.dto.RegisterRequest;
import pl.cdv.api.entity.Role;
import pl.cdv.api.entity.User;
import pl.cdv.api.repository.RoleRepository;
import pl.cdv.api.repository.UserRepository;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthResponse register(RegisterRequest request) {
        String[] nameParts = request.getName().split(" ", 2);
        String firstName = nameParts[0];
        String lastName = nameParts.length > 1 ? nameParts[1] : "";

        Role userRole = roleRepository.findByName("EMPLOYEE")
                .orElseThrow(() -> new RuntimeException("Błąd: Nie znaleziono domyślnej roli w bazie."));

        User user = new User();
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword())); // Hasło ZASZYFROWANE!
        user.setDateOfBirth(request.getDateOfBirth());
        user.setRole(userRole);
        user.setIsActive(true);
        user.setCreatedAt(LocalDateTime.now());

        userRepository.save(user);

        String jwtToken = jwtService.generateToken(user);

        return new AuthResponse(
                jwtToken,
                request.getName(),
                user.getEmail(),
                user.getRole().getName(),
                user.getDateOfBirth() != null ? user.getDateOfBirth().toString() : ""
        );
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow();

        String jwtToken = jwtService.generateToken(user);

        return new AuthResponse(
                jwtToken,
                user.getFirstName() + " " + user.getLastName(),
                user.getEmail(),
                user.getRole().getName(),
                user.getDateOfBirth() != null ? user.getDateOfBirth().toString() : ""
        );
    }
}