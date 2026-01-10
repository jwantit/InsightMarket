package com.InsightMarket.ai.dto.locationchatbot.llm;

import com.InsightMarket.ai.dto.locationchatbot.result.LocationAllDocumentDTO;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class LocationLLmRequestDTO {
    private List<LocationAllDocumentDTO> stores;
    private String consulting;
}
