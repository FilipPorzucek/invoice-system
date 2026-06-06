package pl.cdv.api.dto;

import lombok.Data;


import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
public class InvoiceDto {
    private String invoiceNumber;
    private BigDecimal grossAmount;
    private BigDecimal netAmount;
    private String minioFilePath;
    private String currency;
    private LocalDate issueDate;
    private String status;
    private SupplierDto supplier;

    private List<InvoiceItemDto> items;
}
