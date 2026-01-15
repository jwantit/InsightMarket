package com.InsightMarket.ai.dto.locationchatbot.result;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class LocationAllDocumentDTO {
    List<LocationDocumentRowDTO> documents;
}
