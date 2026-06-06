package pl.cdv.api.entity;


import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name="Invoice_statuses")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class InvoiceStatus {

    @Id
    @GeneratedValue(strategy= GenerationType.IDENTITY)
    @Column(name="status_id")
    private Long statusId;

    @Column(name="name",nullable = false)
    private String name;
}
