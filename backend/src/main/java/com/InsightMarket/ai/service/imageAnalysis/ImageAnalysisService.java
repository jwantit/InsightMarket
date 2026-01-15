package com.InsightMarket.ai.service.imageAnalysis;

import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.web.multipart.MultipartFile;

public interface ImageAnalysisService {
    JsonNode analyzeImage(Long brandId, MultipartFile imageFile, String provider, String traceId);
}

