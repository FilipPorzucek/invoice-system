package pl.cdv.api.services;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import pl.cdv.api.dto.UserDto;
import pl.cdv.api.entity.User;
import pl.cdv.api.repository.UserRepository;

import java.util.List;
import java.util.stream.Collectors;

@RequiredArgsConstructor
@Service
public class UserService {
    private final UserRepository userRepository;

    public List<UserDto> getAllUsers(){
        return userRepository.findAll().stream()
                .map(user -> new UserDto(
                        user.getUserId(),
                        user.getFirstName(),
                        user.getEmail(),
                        user.getRole().getName(),
                        user.getIsActive()
                ))
                .collect(Collectors.toList());
    }




}
