package pl.cdv.api.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pl.cdv.api.entity.InvoiceItems;

public interface InvoiceItemRepository extends JpaRepository<InvoiceItems,Long> {
}
