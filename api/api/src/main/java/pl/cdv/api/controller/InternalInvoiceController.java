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

    @PostMapping
    public ResponseEntity<String> receiveInvoiceFromOcr(@RequestBody InvoiceDto dto){
        System.out.println("Otrzymano zadanie post");
        invoiceService.processInvoiceFromOcr(dto);
        return ResponseEntity.ok("Zapisano fakture w bazie danych");
    }

}
