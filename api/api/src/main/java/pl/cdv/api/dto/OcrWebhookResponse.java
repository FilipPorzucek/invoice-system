package pl.cdv.api.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class OcrWebhookResponse {

    @JsonProperty("task_id")
    private Long taskId;

    private String status;
    private OcrData data;

    @Data
    public static class OcrData {
        @JsonProperty("invoice_number")
        private String invoiceNumber;

        @JsonProperty("issue_date")
        private String issueDate;

        private OcrCompany seller;
        private OcrCompany buyer;
        private OcrSummary summary;

        @JsonProperty("line_items")
        private List<OcrLineItem> lineItems;
    }

    @Data
    public static class OcrCompany {
        private String name;
        private String address;

        @JsonProperty("vat_id")
        private String vatId;
    }

    @Data
    public static class OcrSummary {
        @JsonProperty("total_net")
        private BigDecimal totalNet;

        @JsonProperty("total_vat")
        private BigDecimal totalVat;

        @JsonProperty("total_due")
        private BigDecimal totalDue;

        private String currency;
    }
    @Data
    public static class OcrLineItem {
        private String description;
        private Double quantity;

        @JsonProperty("net_value")
        private Double netValue;

        @JsonProperty("var_rate")
        private Double varRate;
    }

}
