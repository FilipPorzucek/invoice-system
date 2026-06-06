package pl.cdv.api.entity;


import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "Users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Long userId;

    @ManyToOne(fetch = FetchType.LAZY)//FetchType.LAZY ozancza ze spring nie bedzie pobieral roli usera dopoki wyraznie o nie nie poprosimy
    @JoinColumn(name="role_id",nullable = false)
    private Role role;

    @Column(name="first_name", nullable = false)
    private String firstName;


    @Column(name="last_name", nullable = false)
    private String lastName;

    @Column(name="email", nullable = false, unique = true)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "deleted_on")
    private LocalDateTime deletedOn;



}
