package pl.cdv.api.services;


import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;
import pl.cdv.api.dto.InvoiceDto;
import pl.cdv.api.dto.InvoiceItemDto;
import pl.cdv.api.dto.SupplierDto;
import pl.cdv.api.entity.Invoice;
import pl.cdv.api.entity.InvoiceItems;
import pl.cdv.api.entity.InvoiceStatus;
import pl.cdv.api.entity.Suppliers;
import pl.cdv.api.repository.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final SupplierRepository supplierRepository;
    private final InvoiceItemRepository invoiceItemRepository;
    private final UserRepository userRepository;
    private final InvoiceStatusRepository invoiceStatusRepository;

    @Transactional
    public void updateInvoiceFromOcrWebhook(Long invoiceId,InvoiceDto dto){
        System.out.println("Otrzymano dane OCR z Pythona dla faktury ID: " + invoiceId);

        Invoice invoice=invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new RuntimeException("Nie znaleziono faktury o ID: " + invoiceId));


        if (dto.getSupplier() != null) {
            Suppliers supplier = supplierRepository.findByNip(dto.getSupplier().getNip())
                    .orElseGet(() -> {
                        Suppliers newSupplier = new Suppliers();
                        newSupplier.setNip(dto.getSupplier().getNip());
                        newSupplier.setName(dto.getSupplier().getName());
                        newSupplier.setAddress(dto.getSupplier().getAddress());
                        newSupplier.setBankAccountNumber(dto.getSupplier().getBankAccountNumber());
                        return supplierRepository.save(newSupplier);
                    });
            invoice.setSuppliers(supplier);
        }


        invoice.setInvoiceNumber(dto.getInvoiceNumber());
        invoice.setGrossAmount(dto.getGrossAmount());
        invoice.setNetAmount(dto.getNetAmount());
        invoice.setCurrency(dto.getCurrency() != null ? dto.getCurrency() : "PLN");
        invoice.setIssueDate(dto.getIssueDate());


        if (dto.getItems() != null && !dto.getItems().isEmpty()) {
            for (InvoiceItemDto invoiceItemDto : dto.getItems()) {
                InvoiceItems item = new InvoiceItems();
                item.setName(invoiceItemDto.getName());
                item.setQuantity(invoiceItemDto.getQuantity());
                item.setNetPrice(invoiceItemDto.getNetPrice());
                item.setTaxRate(invoiceItemDto.getTaxRate());

                item.setInvoice(invoice);
                invoiceItemRepository.save(item);
            }
        }

        System.out.println("Pomyślnie zaktualizowano fakturę ID: " + invoiceId + " o dane z OCR!");

    }

    @Transactional(readOnly = true)
    public List<InvoiceDto> getAllNewInvoices(){
        List<Invoice> invoices =invoiceRepository.findAll();
        return invoices.stream().map(invoice -> {
            InvoiceDto dto=new InvoiceDto();
            dto.setInvoiceNumber(invoice.getInvoiceNumber());
            dto.setGrossAmount(invoice.getGrossAmount());
            dto.setNetAmount(invoice.getNetAmount());
            dto.setMinioFilePath(invoice.getFilePath());
            dto.setIssueDate(invoice.getIssueDate());
            dto.setCurrency(invoice.getCurrency());
            if(invoice.getStatus()!=null){
                dto.setStatus(invoice.getStatus().getName());
            }

            if (invoice.getSuppliers() != null) {
                SupplierDto supplierDto = new SupplierDto();
                supplierDto.setNip(invoice.getSuppliers().getNip());
                supplierDto.setName(invoice.getSuppliers().getName());
                supplierDto.setAddress(invoice.getSuppliers().getAddress());
                supplierDto.setBankAccountNumber(invoice.getSuppliers().getBankAccountNumber());

                dto.setSupplier(supplierDto);
            }

            if (invoice.getItems() != null && !invoice.getItems().isEmpty()) {
                List<InvoiceItemDto> itemDtos = new ArrayList<>();

                for (InvoiceItems item : invoice.getItems()) {
                    InvoiceItemDto itemDto = new InvoiceItemDto();
                    itemDto.setName(item.getName());
                    itemDto.setQuantity(item.getQuantity());
                    itemDto.setNetPrice(item.getNetPrice());
                    itemDto.setTaxRate(item.getTaxRate());

                    itemDtos.add(itemDto);
                }
                dto.setItems(itemDtos);
            }

            return dto;
        }).toList();
    }

    @Transactional
    public void updateAndApproceInvoice(Long invoiceId,InvoiceDto dto){
        Invoice invoice=invoiceRepository.findById(invoiceId)
                .orElseThrow(()->new RuntimeException("Nie znaleziono faktury o ID: " + invoiceId));

        invoice.setInvoiceNumber(dto.getInvoiceNumber());
        invoice.setGrossAmount(dto.getGrossAmount());
        invoice.setNetAmount(dto.getNetAmount());
        invoice.setIssueDate(dto.getIssueDate());
        invoice.setCurrency(dto.getCurrency());

        if(dto.getSupplier()!=null && invoice.getSuppliers()!=null){
            Suppliers supplier=invoice.getSuppliers();
            supplier.setName(dto.getSupplier().getName());
            supplier.setNip(dto.getSupplier().getNip());
            supplier.setAddress(dto.getSupplier().getAddress());
            supplier.setBankAccountNumber(dto.getSupplier().getBankAccountNumber());
        }

        if(dto.getItems()!=null){
            invoice.getItems().clear();

            for (InvoiceItemDto itemDto : dto.getItems()) {
                InvoiceItems newItem = new InvoiceItems();
                newItem.setName(itemDto.getName());
                newItem.setQuantity(itemDto.getQuantity());
                newItem.setNetPrice(itemDto.getNetPrice());
                newItem.setTaxRate(itemDto.getTaxRate());

                newItem.setInvoice(invoice);
                invoice.getItems().add(newItem);
            }
        }
        InvoiceStatus status = invoiceStatusRepository.findByName("PENDING_ACCOUNTANT")
                .orElseThrow(() -> new RuntimeException("Brak statusu PENDING_ACCOUNTANT w bazie!"));
        invoice.setStatus(status);
    }


    @Transactional
    public Long initInvoiceUpload(MultipartFile file) {
        String minioPath = "faktury/2026/" + file.getOriginalFilename();

        Invoice invoice = new Invoice();
        invoice.setFilePath(minioPath);
        invoice.setStatus(invoiceStatusRepository.findById(5L)
                .orElseThrow(() -> new RuntimeException("Brak statusu NEW w bazie!")));
        invoice.setUploadedBy(userRepository.findById(1L)
                .orElseThrow(() -> new RuntimeException("Brak usera w bazie!")));
        Invoice savedInvoice = invoiceRepository.save(invoice);
        sendToPythonOcrService(savedInvoice.getInvoiceId(), minioPath);
        return savedInvoice.getInvoiceId();
    }

    private void sendToPythonOcrService(Long invoiceId, String minioPath) {
        System.out.println("Wysyłam powiadomienie do OCR Pythona dla faktury ID: " + invoiceId);

        RestTemplate restTemplate=new RestTemplate();

        Map<String, Object> requestBody=new HashMap<>();
        requestBody.put("invoiceId",invoiceId);
        requestBody.put("minioPath",minioPath);

        try {
            String pythonApiUrl = "ADRES PYTHON";

            ResponseEntity<String> response = restTemplate.postForEntity(pythonApiUrl, requestBody, String.class);
            System.out.println("Python przyjął zadanie. Status: " + response.getStatusCode());
        } catch (Exception e) {
            System.err.println("Błąd połączenia z modułem Pythona: " + e.getMessage());
        }
    }

    @Transactional(readOnly = true)
    public InvoiceDto getInvoiceById(Long id) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Nie znaleziono faktury o ID: " + id));

        InvoiceDto dto = new InvoiceDto();
        dto.setInvoiceNumber(invoice.getInvoiceNumber());
        dto.setGrossAmount(invoice.getGrossAmount());
        dto.setNetAmount(invoice.getNetAmount());
        dto.setMinioFilePath(invoice.getFilePath());
        dto.setIssueDate(invoice.getIssueDate());
        dto.setCurrency(invoice.getCurrency());

        if(invoice.getStatus() != null){
            dto.setStatus(invoice.getStatus().getName());
        }

        if (invoice.getSuppliers() != null) {
            SupplierDto supplierDto = new SupplierDto();
            supplierDto.setNip(invoice.getSuppliers().getNip());
            supplierDto.setName(invoice.getSuppliers().getName());
            supplierDto.setAddress(invoice.getSuppliers().getAddress());
            supplierDto.setBankAccountNumber(invoice.getSuppliers().getBankAccountNumber());
            dto.setSupplier(supplierDto);
        }
        if (invoice.getItems() != null && !invoice.getItems().isEmpty()) {
            List<InvoiceItemDto> itemDtos = new ArrayList<>();
            for (InvoiceItems item : invoice.getItems()) {
                InvoiceItemDto itemDto = new InvoiceItemDto();
                itemDto.setName(item.getName());
                itemDto.setQuantity(item.getQuantity());
                itemDto.setNetPrice(item.getNetPrice());
                itemDto.setTaxRate(item.getTaxRate());
                itemDtos.add(itemDto);
            }
            dto.setItems(itemDtos);
        }
        return dto;
    }


}
