package pl.cdv.api.dto;

import lombok.Data;

@Data
public class SupplierDto {
    private String nip;
    private String name;
    private String address;
    private String bankAccountNumber;
}
