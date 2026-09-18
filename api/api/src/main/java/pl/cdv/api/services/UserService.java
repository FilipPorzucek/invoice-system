package pl.cdv.api.services;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import pl.cdv.api.dto.CreateUserRequest;
import pl.cdv.api.dto.UpdateUserRequest;
import pl.cdv.api.dto.UserDto;
import pl.cdv.api.entity.Role;
import pl.cdv.api.entity.User;
import pl.cdv.api.repository.RoleRepository;
import pl.cdv.api.repository.UserRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RequiredArgsConstructor
@Service
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final RoleRepository roleRepository;

    public List<UserDto> getAllUsers(){
        return userRepository.findAll().stream()
                .map(user -> new UserDto(
                        user.getUserId(),
                        user.getFirstName(),
                        user.getEmail(),
                        user.getRole().getName(),
                        user.getIsActive(),
                        user.getDateOfBirth()
                ))
                .collect(Collectors.toList());
    }


    @Transactional
    public void createUser(CreateUserRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Użytkownik o podanym adresie email już istnieje!");
        }

        Role role = roleRepository.findByName(request.getRole())
                .orElseThrow(() -> new RuntimeException("Nie znaleziono roli: " + request.getRole()));

        User user = new User();
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole(role);
        user.setDateOfBirth(request.getDateOfBirth());
        user.setIsActive(true);
        user.setCreatedAt(LocalDateTime.now());

        userRepository.save(user);
    }

    @Transactional
    public void updateUser(Long id, UpdateUserRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Nie znaleziono użytkownika o ID: " + id));

        if (!user.getEmail().equalsIgnoreCase(request.getEmail()) &&
                userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Adres email jest już zajęty przez innego użytkownika!");
        }

        Role role = roleRepository.findByName(request.getRole())
                .orElseThrow(() -> new RuntimeException("Nie znaleziono roli: " + request.getRole()));

        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(request.getEmail());
        user.setRole(role);
        user.setDateOfBirth(request.getDateOfBirth());

        userRepository.save(user);
    }



}
