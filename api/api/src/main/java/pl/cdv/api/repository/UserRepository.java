package pl.cdv.api.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pl.cdv.api.entity.User;

public interface UserRepository extends JpaRepository<User,Long> {
}
