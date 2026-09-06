package pl.cdv.api.services;


import io.minio.GetObjectArgs;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;
import pl.cdv.api.dto.InvoiceDto;
import pl.cdv.api.dto.InvoiceItemDto;
import pl.cdv.api.dto.OcrWebhookResponse;
import pl.cdv.api.dto.SupplierDto;
import pl.cdv.api.entity.*;
import pl.cdv.api.repository.*;

import java.io.InputStream;
import java.math.BigDecimal;
import java.time.LocalDate;
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
    private final MinioClient minioClient;

    @Transactional
    public void updateInvoiceFromOcrWebhook(Long invoiceId,OcrWebhookResponse payload){
        System.out.println("Otrzymano dane OCR z Pythona dla faktury ID: " + invoiceId);

        Invoice invoice=invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new RuntimeException("Nie znaleziono faktury o ID: " + invoiceId));

        OcrWebhookResponse.OcrData ocrData=payload.getData();

        if (ocrData != null) {
            invoice.setInvoiceNumber(ocrData.getInvoiceNumber());

            if (ocrData.getIssueDate() != null) {
                try {
                    invoice.setIssueDate(LocalDate.parse(ocrData.getIssueDate()));
                } catch (Exception e) {
                    System.err.println("Nie udało się sparsować daty z OCR: " + ocrData.getIssueDate());
                }
            }

            if (ocrData.getSummary() != null) {
                invoice.setNetAmount(ocrData.getSummary().getTotalNet());
                invoice.setGrossAmount(ocrData.getSummary().getTotalDue());
                invoice.setCurrency(ocrData.getSummary().getCurrency());
            }

            if (ocrData.getSeller() != null && ocrData.getSeller().getVatId() != null) {
                String nip = ocrData.getSeller().getVatId();

                Suppliers supplier = supplierRepository.findByNip(nip)
                        .orElseGet(() -> {
                            Suppliers newSupplier = new Suppliers();
                            newSupplier.setNip(nip);
                            newSupplier.setName(ocrData.getSeller().getName());
                            newSupplier.setAddress(ocrData.getSeller().getAddress());
                            return supplierRepository.save(newSupplier);
                        });

                invoice.setSuppliers(supplier);
            }

            if (ocrData.getLineItems() != null && !ocrData.getLineItems().isEmpty()) {

                if (invoice.getItems() != null) {
                    invoice.getItems().clear();
                }

                for (OcrWebhookResponse.OcrLineItem ocrItem : ocrData.getLineItems()) {
                    InvoiceItems newItem = new InvoiceItems();
                    newItem.setInvoice(invoice);
                    newItem.setName(ocrItem.getDescription());

                    int quantity = (ocrItem.getQuantity() != null && ocrItem.getQuantity() > 0)
                            ? ocrItem.getQuantity().intValue() : 1;
                    newItem.setQuantity(quantity);

                    BigDecimal finalNetPrice = ocrItem.getNetPrice();

                    if (finalNetPrice == null) {
                        if (ocrItem.getNetValue() != null) {
                            finalNetPrice = ocrItem.getNetValue().divide(BigDecimal.valueOf(quantity), 2, java.math.RoundingMode.HALF_UP);
                        } else if (ocrData.getSummary() != null && ocrData.getSummary().getTotalNet() != null) {
                            finalNetPrice = ocrData.getSummary().getTotalNet().divide(BigDecimal.valueOf(quantity), 2, java.math.RoundingMode.HALF_UP);
                        } else {
                            finalNetPrice = BigDecimal.ZERO;
                        }
                    }

                    newItem.setNetPrice(finalNetPrice);

                    BigDecimal finalTaxRate = ocrItem.getVatRate();
                    if (finalTaxRate == null) {
                        finalTaxRate = BigDecimal.ZERO;
                    }
                    newItem.setTaxRate(finalTaxRate);

                    invoice.getItems().add(newItem);
                }
            }
        }

        invoiceRepository.save(invoice);
    }

    @Transactional(readOnly = true)
    public List<InvoiceDto> getAllNewInvoices(String email){

        User user=userRepository.findByEmail(email)
                .orElseThrow(()->new RuntimeException("Nie znaleziono uzytkownika"));

        List<Invoice> invoices =invoiceRepository.findByUploadedBy(user);
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

        if (dto.getSupplier() != null) {
            String nip = dto.getSupplier().getNip();
            Suppliers supplier = supplierRepository.findByNip(nip)
                    .orElseGet(Suppliers::new);

            supplier.setNip(nip);
            supplier.setName(dto.getSupplier().getName());
            supplier.setAddress(dto.getSupplier().getAddress());
            supplier.setBankAccountNumber(dto.getSupplier().getBankAccountNumber());
            supplierRepository.save(supplier);
            invoice.setSuppliers(supplier);
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
    public Long initInvoiceUpload(MultipartFile file,String email) {
        String minioPath = "faktury/2026/" + file.getOriginalFilename();

        try{
            minioClient.putObject(
                    PutObjectArgs.builder()
                            .bucket("invoices")
                            .object(minioPath)
                            .stream(file.getInputStream(), file.getSize(), -1)
                            .contentType(file.getContentType())
                            .build()
            );
            System.out.println("Zapisano plik w MinIO!");
        }catch(Exception e) {
        throw new RuntimeException("Błąd zapisu pliku w MinIO", e);
    }

        User user=userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Brak usera w bazie"));
        Invoice invoice = new Invoice();
        invoice.setFilePath(minioPath);
        invoice.setStatus(invoiceStatusRepository.findById(5L)
                .orElseThrow(() -> new RuntimeException("Brak statusu NEW w bazie!")));
        invoice.setUploadedBy(user);
        Invoice savedInvoice = invoiceRepository.save(invoice);
        sendToPythonOcrService(savedInvoice.getInvoiceId(), minioPath);
        return savedInvoice.getInvoiceId();
    }

    private void sendToPythonOcrService(Long invoiceId, String minioPath) {

        RestTemplate restTemplate = new RestTemplate();

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("task_id", invoiceId.toString());
        requestBody.put("file_path", minioPath);
        requestBody.put("webhook_url", "http://host.docker.internal:8081/api/internal/invoices/" + invoiceId);

        try {
            String pythonApiUrl = "http://localhost:8000/api/v1/process_invoice";

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
        dto.setId(invoice.getInvoiceId());
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

    @Transactional(readOnly = true)
    public List<InvoiceDto> getInvoicesByStatus(String statusName) {
        InvoiceStatus status = invoiceStatusRepository.findByName(statusName)
                .orElseThrow(() -> new RuntimeException("Nie znaleziono statusu: " + statusName));

        List<Invoice> invoices = invoiceRepository.findByStatus(status);

        return invoices.stream().map(invoice -> {
            InvoiceDto dto = new InvoiceDto();
            dto.setId(invoice.getInvoiceId());
            dto.setInvoiceNumber(invoice.getInvoiceNumber());
            dto.setGrossAmount(invoice.getGrossAmount());
            dto.setNetAmount(invoice.getNetAmount());
            dto.setMinioFilePath(invoice.getFilePath());
            dto.setIssueDate(invoice.getIssueDate());
            dto.setCurrency(invoice.getCurrency());

            if (invoice.getStatus() != null) {
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

    @Transactional(readOnly = true)
    public byte[] getInvoiceFile(Long invoiceId) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new RuntimeException("Nie znaleziono faktury o ID: " + invoiceId));

        String filePath = invoice.getFilePath();
        if (filePath == null || filePath.isEmpty()) {
            throw new RuntimeException("Faktura nie ma przypisanego pliku.");
        }

        try {
            InputStream stream = minioClient.getObject(
                    GetObjectArgs.builder()
                            .bucket("invoices")
                            .object(filePath)
                            .build()
            );
            return stream.readAllBytes();
        } catch (Exception e) {
            throw new RuntimeException("Błąd podczas pobierania pliku z MinIO", e);
        }

    }

}
