package pl.cdv.api.controller;


import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pl.cdv.api.dto.InvoiceDto;
import pl.cdv.api.services.InvoiceService;

@RestController
@RequestMapping("/api/internal/invoices")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class InternalInvoiceController {

    private final InvoiceService invoiceService;

    @PostMapping("/{invoiceId}")
    public ResponseEntity<String> receiveInvoiceFromOcr(
            @PathVariable Long invoiceId,
            @RequestBody InvoiceDto dto) {

        System.out.println("Otrzymano zadanie POST z Pythona dla faktury ID: " + invoiceId);

        invoiceService.updateInvoiceFromOcrWebhook(invoiceId, dto);

        return ResponseEntity.ok("Zaktualizowano fakturę w bazie danych o dane z OCR");
    }
}
