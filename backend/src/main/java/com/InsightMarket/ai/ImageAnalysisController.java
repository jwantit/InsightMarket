package com.InsightMarket.ai;

import com.fasterxml.jackson.databind.JsonNode;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/{brandId}/ai/image")
public class ImageAnalysisController {

    private final ImageAnalysisService imageAnalysisService;

    @PostMapping(value = "/analyze", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<JsonNode> analyzeImage(
            @PathVariable Long brandId,
            @RequestPart("image") MultipartFile imageFile,
            @RequestParam(value = "provider", required = false) String provider,
            HttpServletRequest httpRequest
    ) {
        // TraceIdFilter에서 설정한 attribute에서 traceId 읽기
        String traceId = (String) httpRequest.getAttribute("X-Trace-Id");
        if (traceId == null || traceId.isBlank()) {
            traceId = "unknown"; // fallback
        }

        log.info("[ImageAnalysisController] POST /api/{}/ai/image/analyze traceId={} brandId={} imageSize={} bytes contentType={} provider={}",
                brandId, traceId, brandId, imageFile != null ? imageFile.getSize() : 0, 
                imageFile != null ? imageFile.getContentType() : null, provider);

        JsonNode res = imageAnalysisService.analyzeImage(brandId, imageFile, provider, traceId);

        return ResponseEntity.ok(res);
    }
}

