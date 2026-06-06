package pl.cdv.api.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name="Suppliers")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Suppliers {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "supplier_id")
    private Long supplierId;

    @Column(name = "nip", nullable = false, unique = true) // NIP musi być unikalny
    private String nip;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "address")
    private String address;

    @Column(name = "bank_account_number")
    private String bankAccountNumber;
}
