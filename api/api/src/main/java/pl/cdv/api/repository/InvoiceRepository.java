package pl.cdv.api.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pl.cdv.api.entity.Invoice;

import java.util.List;

public interface InvoiceRepository extends JpaRepository<Invoice, Long> {

    List<Invoice> findByStatus_StatusId(Long statusId);
}
