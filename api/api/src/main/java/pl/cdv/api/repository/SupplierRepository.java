package pl.cdv.api.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pl.cdv.api.entity.Suppliers;

import java.util.Optional;

public interface SupplierRepository extends JpaRepository<Suppliers, Long> {
    Optional<Suppliers> findByNip(String nip);
}
