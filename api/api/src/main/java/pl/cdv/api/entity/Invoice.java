package pl.cdv.api.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "Invoices")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Invoice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "invoice_id")
    private Long invoiceId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "uploaded_by",nullable = false)
    private User uploadedBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "status_id",nullable = false)
    private InvoiceStatus status;


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supplier_id")
    private Suppliers suppliers;

    @OneToMany(mappedBy = "invoice", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<InvoiceItems> items = new ArrayList<>();

    @Column(name = "file_path",nullable = false)
    private String filePath;

    @Column(name = "currency",length = 3)
    private String currency="PLN";

    @Column(name = "invoice_number")
    private String invoiceNumber;

    @Column(name = "gross_amount")
    private BigDecimal grossAmount;

    @Column(name = "net_amount")
    private BigDecimal netAmount;

    @Column(name = "issue_date")
    private LocalDate issueDate;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

}
