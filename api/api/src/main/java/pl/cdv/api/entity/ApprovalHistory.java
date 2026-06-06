package pl.cdv.api.entity;


import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "Approval_history")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApprovalHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "approval_id")
    private Long approval_id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "invoice_id",nullable = false)
    private Invoice invoice;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id",nullable = false)
    private User user;

    @Column(name = "action", nullable = false)
    private String action; // np. "ZAAKCEPTOWANO", "ODRZUCONO"

    @Column(name = "comment", length = 1000)
    private String comment; // Opcjonalny powód odrzucenia

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

}
