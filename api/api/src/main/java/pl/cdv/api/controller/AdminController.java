package pl.cdv.api.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pl.cdv.api.dto.CreateUserRequest;
import pl.cdv.api.dto.UserDto;
import pl.cdv.api.services.UserService;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UserService userService;

    @GetMapping("/users")
    public ResponseEntity<List<UserDto>> getAllUsers(){
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @PostMapping("/users")
    public ResponseEntity<Void> createUser(@RequestBody CreateUserRequest request) {
        userService.createUser(request);
        return ResponseEntity.ok().build();
    }
}
