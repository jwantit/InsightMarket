package com.InsightMarket.ai.service.trends;

import com.InsightMarket.ai.dto.trends.PythonTrendResponseDTO;
import com.InsightMarket.domain.brand.Brand;
import com.InsightMarket.domain.trends.BrandTrend;
import com.InsightMarket.repository.brand.BrandRepository;
import com.InsightMarket.repository.trends.BrandTrendRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class TrendsDbServiceImpl implements TrendsDbService {

    private final BrandTrendRepository brandTrendRepository;
    private final BrandRepository brandRepository;
    private final ObjectMapper objectMapper;
    
    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    @Override
    @Transactional
    public void saveTrendData(Long brandId, PythonTrendResponseDTO data) {
        try {
            Brand brand = brandRepository.findById(brandId)
                    .orElseThrow(() -> new IllegalArgumentException("Brand not found: " + brandId));

            // data 객체를 JSON 문자열로 변환
            String dataJson = objectMapper.writeValueAsString(data.getData());

            // collectedAt 문자열을 LocalDateTime으로 변환
            LocalDateTime collectedAt = LocalDateTime.parse(data.getCollectedAt(), DATE_TIME_FORMATTER);

            BrandTrend brandTrend = BrandTrend.builder()
                    .brand(brand)
                    .keyword(data.getKeyword())
                    .collectedAt(collectedAt)
                    .dataJson(dataJson)
                    .build();

            brandTrendRepository.save(brandTrend);
            log.info("브랜드 {} 트렌드 데이터 DB 저장 성공", brandId);
        } catch (JsonProcessingException e) {
            log.error("브랜드 {} 트렌드 데이터 JSON 변환 실패: {}", brandId, e.getMessage());
            throw new RuntimeException("Failed to convert trend data to JSON", e);
        } catch (Exception e) {
            log.error("브랜드 {} 트렌드 데이터 DB 저장 실패: {}", brandId, e.getMessage());
            throw new RuntimeException("Failed to save trend data to DB", e);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public PythonTrendResponseDTO getTrendData(Long brandId) {
        try {
            Optional<BrandTrend> brandTrendOpt = brandTrendRepository.findTopByBrandIdOrderByCollectedAtDesc(brandId);
            
            if (brandTrendOpt.isEmpty()) {
                log.warn("Brand {} 에 대한 트렌드 데이터가 DB에 없습니다.", brandId);
                return null;
            }

            BrandTrend brandTrend = brandTrendOpt.get();
            
            // JSON 문자열을 TrendData로 변환
            PythonTrendResponseDTO.TrendData trendData = objectMapper.readValue(
                    brandTrend.getDataJson(),
                    PythonTrendResponseDTO.TrendData.class
            );

            // PythonTrendResponseDTO로 조립
            return PythonTrendResponseDTO.builder()
                    .keyword(brandTrend.getKeyword())
                    .brandId(brandId)
                    .collectedAt(brandTrend.getCollectedAt().format(DATE_TIME_FORMATTER))
                    .data(trendData)
                    .build();
        } catch (JsonProcessingException e) {
            log.error("브랜드 {} 트렌드 데이터 JSON 파싱 실패: {}", brandId, e.getMessage());
            throw new RuntimeException("Failed to parse trend data from JSON", e);
        } catch (Exception e) {
            log.error("브랜드 {} 트렌드 데이터 DB 조회 실패: {}", brandId, e.getMessage());
            throw new RuntimeException("Failed to get trend data from DB", e);
        }
    }
}
