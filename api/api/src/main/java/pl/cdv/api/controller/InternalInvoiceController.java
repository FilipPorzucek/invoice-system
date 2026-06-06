package pl.cdv.api.controller;


import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import pl.cdv.api.dto.InvoiceDto;
import pl.cdv.api.services.InvoiceService;

@RestController
@RequestMapping("/api/internal/invoices")
@RequiredArgsConstructor
public class InternalInvoiceController {

    private final InvoiceService invoiceService;

    @PostMapping
    public ResponseEntity<String> receiveInvoiceFromOcr(@RequestBody InvoiceDto dto){
        System.out.println("Otrzymano zadanie post");

        invoiceService.processInvoiceFromOcr(dto);

        return ResponseEntity.ok("Zapisano fakture w bazie danych");
    }

}
