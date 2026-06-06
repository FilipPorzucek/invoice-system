package pl.cdv.api.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class InvoiceItemDto {
    private String name;
    private Integer quantity;
    private BigDecimal netPrice;
    private BigDecimal taxRate;
}
