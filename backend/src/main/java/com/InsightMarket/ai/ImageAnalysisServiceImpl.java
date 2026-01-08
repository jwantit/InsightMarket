package com.InsightMarket.ai;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.Base64;

@Slf4j
@Service
@RequiredArgsConstructor
public class ImageAnalysisServiceImpl implements ImageAnalysisService {

    private final PythonRagClient pythonRagClient;

    @Override
    public JsonNode analyzeImage(Long brandId, MultipartFile imageFile, String provider, String traceId) {
        try {
            // 이미지 파일 검증
            if (imageFile == null || imageFile.isEmpty()) {
                throw new IllegalArgumentException("이미지 파일이 필요합니다.");
            }

            // ContentType 검증 (이미지 파일인지 확인)
            String contentType = imageFile.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                throw new IllegalArgumentException("이미지 파일만 업로드 가능합니다. 현재 타입: " + contentType);
            }

            // 파일 크기 제한 (예: 10MB)
            long maxFileSize = 10 * 1024 * 1024; // 10MB
            if (imageFile.getSize() > maxFileSize) {
                throw new IllegalArgumentException("이미지 파일 크기는 10MB 이하여야 합니다. 현재 크기: " + imageFile.getSize() + " bytes");
            }

            // MultipartFile을 Base64로 변환
            byte[] imageBytes = imageFile.getBytes();
            String base64Image = Base64.getEncoder().encodeToString(imageBytes);

            log.info("[ImageAnalysisServiceImpl] analyzeImage start traceId={} brandId={} imageSize={} bytes contentType={} provider={}",
                    traceId, brandId, imageBytes.length, contentType, provider);

            // Python API 호출
            JsonNode response = pythonRagClient.analyzeImage(base64Image, brandId, provider, traceId);

            log.info("[ImageAnalysisServiceImpl] analyzeImage end traceId={} success={}",
                    traceId, response != null && response.has("extractedText"));

            return response;

        } catch (IllegalArgumentException e) {
            log.error("[ImageAnalysisServiceImpl] analyzeImage validation error traceId={} error={}", traceId, e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("[ImageAnalysisServiceImpl] analyzeImage error traceId={}", traceId, e);
            throw new RuntimeException("이미지 분석 중 오류가 발생했습니다: " + e.getMessage(), e);
        }
    }
}

