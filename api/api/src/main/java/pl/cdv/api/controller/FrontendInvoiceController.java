package pl.cdv.api.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import pl.cdv.api.dto.InvoiceDto;
import pl.cdv.api.services.InvoiceService;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("api/invoices")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class FrontendInvoiceController {
    private final InvoiceService invoiceService;

    @GetMapping("/new")
    public List<InvoiceDto> getNewInvoices(Principal principal){
        System.out.println("Pobieram nowe faktury");
        return invoiceService.getAllNewInvoices(principal.getName());
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<String> approveInvoice(@PathVariable Long id,@RequestBody InvoiceDto dto){
        invoiceService.updateAndApproceInvoice(id,dto);
        return ResponseEntity.ok("Faktura została poprawiona");
    }

    @PostMapping("/upload")
    public ResponseEntity<Long> uploadInvoiceFile(@RequestParam("file") MultipartFile file,Principal principal) {
        System.out.println("Odebrano plik faktury do analizy OCR: " + file.getOriginalFilename());
        Long newInvoiceId = invoiceService.initInvoiceUpload(file, principal.getName());
        return ResponseEntity.ok(newInvoiceId);
    }

    @GetMapping("/{id}")
    public ResponseEntity<InvoiceDto> getInvoiceById(@PathVariable Long id) {
        InvoiceDto dto = invoiceService.getInvoiceById(id);
        return ResponseEntity.ok(dto);
    }
}
