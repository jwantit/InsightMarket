package com.InsightMarket.ai.controller;

import com.InsightMarket.ai.dto.locationchatbot.Insight.LocationInsightResponseDTO;
import com.InsightMarket.ai.dto.locationchatbot.LocationRequestDTO;
import com.InsightMarket.ai.dto.locationchatbot.comparison.LocationComparisonResponseDTO;
import com.InsightMarket.ai.dto.locationchatbot.llm.LocationLLmResponseDTO;
import com.InsightMarket.ai.service.location.LocationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@Log4j2
@RequestMapping("/api/location")
public class LocationController {

    private final LocationService locationService;

    @GetMapping("/best_worst")
    public ResponseEntity<LocationComparisonResponseDTO> bestWorst(LocationRequestDTO locationRequestDTO){

        log.info("Best/worst" + locationRequestDTO);
        LocationComparisonResponseDTO result =  locationService.getOneLocation(locationRequestDTO);

        return ResponseEntity.ok(result);
    }
    @GetMapping("/Insight")
    public ResponseEntity<LocationInsightResponseDTO> Insight(LocationRequestDTO locationRequestDTO){

        log.info("Insight" + locationRequestDTO);
        LocationInsightResponseDTO result =  locationService.getInsightLocation(locationRequestDTO);

        return ResponseEntity.ok(result);
    }

    @GetMapping("/llm")
    public ResponseEntity<LocationLLmResponseDTO> llm(LocationRequestDTO locationRequestDTO){

        log.info("Insight" + locationRequestDTO);
        LocationLLmResponseDTO result =  locationService.getConsulting(locationRequestDTO);

        return ResponseEntity.ok(result);
    }
}

