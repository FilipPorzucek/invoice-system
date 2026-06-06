package pl.cdv.api.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pl.cdv.api.dto.InvoiceDto;
import pl.cdv.api.services.InvoiceService;

import java.util.List;

@RestController
@RequestMapping("api/invoices")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class FrontendInvoiceController {
    private final InvoiceService invoiceService;

    @GetMapping("/new")
    public List<InvoiceDto> getNewInvoices(){
        System.out.println("Pobieram nowe faktury");
        return invoiceService.getAllNewInvoices();
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<String> approveInvoice(@PathVariable Long id,@RequestBody InvoiceDto dto){
        invoiceService.updateAndApproceInvoice(id,dto);
        return ResponseEntity.ok("Faktura została poprawiona");
    }
}
