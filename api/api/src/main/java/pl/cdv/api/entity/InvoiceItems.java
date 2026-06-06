package pl.cdv.api.entity;


import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name = "Invoice_items")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class InvoiceItems {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "item_id")
    private Long itemId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "invoice_id",nullable = false)
    private Invoice invoice;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "quantity", nullable = false)
    private Integer quantity;

    @Column(name = "net_price")
    private BigDecimal netPrice;

    @Column(name = "tax_rate")
    private BigDecimal taxRate;

}
