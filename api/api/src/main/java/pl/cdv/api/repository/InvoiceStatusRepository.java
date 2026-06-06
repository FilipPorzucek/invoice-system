package pl.cdv.api.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pl.cdv.api.entity.InvoiceStatus;

import java.util.Optional;

public interface InvoiceStatusRepository extends JpaRepository<InvoiceStatus,Long> {
    Optional<InvoiceStatus> findByName(String name);
}
