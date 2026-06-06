package pl.cdv.api.services;


import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import pl.cdv.api.dto.InvoiceDto;
import pl.cdv.api.dto.InvoiceItemDto;
import pl.cdv.api.dto.SupplierDto;
import pl.cdv.api.entity.Invoice;
import pl.cdv.api.entity.InvoiceItems;
import pl.cdv.api.entity.InvoiceStatus;
import pl.cdv.api.entity.Suppliers;
import pl.cdv.api.repository.*;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final SupplierRepository supplierRepository;
    private final InvoiceItemRepository invoiceItemRepository;
    private final UserRepository userRepository;
    private final InvoiceStatusRepository invoiceStatusRepository;

    @Transactional
    public void processInvoiceFromOcr(InvoiceDto dto){
        System.out.println("Otrzymano fakture od: "+dto.getSupplier().getNip());

        Suppliers supplier=supplierRepository.findByNip(dto.getSupplier().getNip())
                .orElseGet(()->{
                    Suppliers newSupplier=new Suppliers();
                    newSupplier.setNip(dto.getSupplier().getNip());
                    newSupplier.setName(dto.getSupplier().getName());
                    newSupplier.setAddress(dto.getSupplier().getAddress());
                    newSupplier.setBankAccountNumber(dto.getSupplier().getBankAccountNumber());
                    return supplierRepository.save(newSupplier);
                });


        Invoice invoice=new Invoice();
        invoice.setInvoiceNumber(dto.getInvoiceNumber());
        invoice.setGrossAmount(dto.getGrossAmount());
        invoice.setNetAmount(dto.getNetAmount());
        invoice.setFilePath(dto.getMinioFilePath());
        invoice.setSuppliers(supplier);
        invoice.setCurrency(dto.getCurrency() != null ? dto.getCurrency() : "PLN");
        invoice.setIssueDate(dto.getIssueDate());


        invoice.setStatus(invoiceStatusRepository.findById(1L).orElseThrow(() -> new RuntimeException("Brak statusu w bazie!")));
        invoice.setUploadedBy(userRepository.findById(1L).orElseThrow(() -> new RuntimeException("Brak usera w bazie!")));



        Invoice savedInvoice=invoiceRepository.save(invoice);

        if (dto.getItems()!=null&&!dto.getItems().isEmpty()){
            for (InvoiceItemDto invoiceItemDto :dto.getItems()){
                InvoiceItems item=new InvoiceItems();
                item.setName(invoiceItemDto.getName());
                item.setQuantity(invoiceItemDto.getQuantity());
                item.setNetPrice(invoiceItemDto.getNetPrice());
                item.setTaxRate(invoiceItemDto.getTaxRate());

                item.setInvoice(savedInvoice);


                invoiceItemRepository.save(item);

            }
        }

        System.out.println("Pomyslnie zapisano fakture"+savedInvoice.getInvoiceNumber());

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
        InvoiceStatus status=invoiceStatusRepository.findByName("U_KSIEGOWEGO")
                .orElseThrow(() -> new RuntimeException("Brak statusu U_KSIEGOWEGO w bazie!"));
        invoice.setStatus(status);
    }



}
