package com.InsightMarket.ai.locationchatbot.service;


import com.InsightMarket.ai.locationchatbot.dto.Insight.LocationInsightResponseDTO;
import com.InsightMarket.ai.locationchatbot.dto.LocationRequestDTO;
import com.InsightMarket.ai.locationchatbot.dto.comparison.LocationComparisonResponseDTO;
import com.InsightMarket.ai.locationchatbot.dto.comparison.PlacesDTO;
import com.InsightMarket.ai.locationchatbot.dto.llm.LocationLLmResponseDTO;
import com.InsightMarket.ai.locationchatbot.dto.result.LocationAllDocumentDTO;
import com.InsightMarket.ai.locationchatbot.dto.result.LocationDocumentRowDTO;
import com.InsightMarket.ai.locationchatbot.dto.result.TrafficSeriesDTO;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LocationServiceImpl implements LocationService {

    private final ObjectMapper objectMapper;

    @Override
    public LocationComparisonResponseDTO getOneLocation(LocationRequestDTO locationRequestDTO) {

        //JSON
        LocationAllDocumentDTO categoryfilteredData = loadFromJson(locationRequestDTO);

        if (categoryfilteredData == null || categoryfilteredData.getDocuments() == null || categoryfilteredData.getDocuments().isEmpty()) {
            return null;
        }

        //사용자가 보낸 위도 경도----------------------------------------------------------------
        double userLat = locationRequestDTO.getLatitude();
        double userLon = locationRequestDTO.getLongitude();
        double userRadius = locationRequestDTO.getRadius();

        //LocationDocumentRowDTO 거리 필터링--------------------------------------------
        List<LocationDocumentRowDTO> finalStores = categoryfilteredData.getDocuments().stream()
                .filter(doc -> {
                    double dataLat = doc.getY();
                    double dataLon = doc.getX();

                    double distance = calculateDistance(userLat, userLon, dataLat, dataLon);
                    doc.setDistance(distance);
                    return distance <= userRadius;
                }).collect(Collectors.toList());
        //-----------------------------------------------------------------------------

        int storeCount = finalStores.size();

        //베스트 워스트 찾기
        // salesIndex가 가장 큰 객체 찾기
        LocationDocumentRowDTO maxSalesStore = finalStores.stream()
                .max(Comparator.comparingInt(LocationDocumentRowDTO::getSalesIndex))
                .orElse(null); // 리스트가 비어있으면 null

        // salesIndex가 가장 작은 객체 찾기
        LocationDocumentRowDTO minSalesStore = finalStores.stream()
                .min(Comparator.comparingInt(LocationDocumentRowDTO::getSalesIndex))
                .orElse(null);

        PlacesDTO b = null;
        PlacesDTO w = null;

        if (maxSalesStore != null && minSalesStore != null) {
            b = PlacesDTO.builder()
                    .rank("Best")
                    .placeId(maxSalesStore.getPlaceId())
                    .placeName(maxSalesStore.getPlaceName())
                    .salesIndex(maxSalesStore.getSalesIndex()) // 타입 변환 주의 (int -> Long)
                    .desc(maxSalesStore.getDesc())
                    .build();

            w = PlacesDTO.builder()
                    .rank("Worst")
                    .placeId(minSalesStore.getPlaceId())
                    .placeName(minSalesStore.getPlaceName())
                    .salesIndex(minSalesStore.getSalesIndex())
                    .desc(minSalesStore.getDesc())
                    .build();
        }

        List<PlacesDTO> summaryList = new ArrayList<>();
        if (b != null) summaryList.add(b);
        if (w != null) summaryList.add(w);


        return LocationComparisonResponseDTO.builder()
                .radius(locationRequestDTO.getRadius())
                .foundCount(storeCount)
                .bestPlaceId(maxSalesStore.getPlaceId())
                .worstPlaceId(minSalesStore.getPlaceId())
                .places(summaryList)
                .build();
    }

    //거리계산 로직
    private double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        double R = 6371; // 지구 반지름 (km)
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);

        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                        Math.sin(dLon / 2) * Math.sin(dLon / 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c * 1000; // 최종 단위를 미터(m)로 반환
    }


//인사이트----------------------------------------------------------------------------------------------
    @Override
    public LocationInsightResponseDTO getInsightLocation(LocationRequestDTO locationRequestDTO) {

        LocationAllDocumentDTO categoryfilteredData = loadFromJson(locationRequestDTO);

        if (categoryfilteredData == null || categoryfilteredData.getDocuments() == null || categoryfilteredData.getDocuments().isEmpty()) {
            return null;
        }
        LocationDocumentRowDTO target = categoryfilteredData.getDocuments().get(0);
        List<TrafficSeriesDTO> seriesData = target.getPlaceInsights().getTrafficSeries();

        LocationInsightResponseDTO locationInsightResponseDTO = LocationInsightResponseDTO.builder()
                .placeId(target.getPlaceId())
                .placeName(target.getPlaceName())
                .trafficPeak(target.getPlaceInsights().getTrafficPeak())
                .mainAgeGroup(target.getPlaceInsights().getMainAgeGroup())
                .saturation(target.getPlaceInsights().getSaturation())
                .trafficSeries(seriesData)
                .build();

        return locationInsightResponseDTO;
    }

    @Override
    public LocationLLmResponseDTO getConsulting(LocationRequestDTO locationRequestDTO) {

        LocationAllDocumentDTO categoryfilteredData = loadFromJson(locationRequestDTO);



        return null;
    }

    //공통로직---------------------------------------------------------------------------------------
    public LocationAllDocumentDTO loadFromJson(LocationRequestDTO locationRequestDTO) {
        try {
            ClassPathResource resource = new ClassPathResource("data/placesData.json");
            LocationAllDocumentDTO dto = objectMapper.readValue(
                    resource.getInputStream(),
                    LocationAllDocumentDTO.class
            );

            if (dto == null || dto.getDocuments() == null) {
                return null;
            }

            List<LocationDocumentRowDTO> allDocs = dto.getDocuments();
            List<LocationDocumentRowDTO> filteredList;

            String placeId = locationRequestDTO.getPlaceId();
            String worstId = locationRequestDTO.getWorstPlaceId();

            Set<String> targetIds = Set.of(placeId, worstId);


            if (placeId != null && !placeId.isEmpty()) {
                filteredList = allDocs.stream()
                        .filter(doc -> placeId.equals(doc.getPlaceId()))
                        .collect(Collectors.toList());
            } else if (targetIds != null && !targetIds.isEmpty()) {
                filteredList = allDocs.stream()
                        .filter(doc -> targetIds.contains(doc.getPlaceId()))
                        .collect(Collectors.toList());
            } else {
                String finalCategory = mapCategoryName(locationRequestDTO.getCategory());
                filteredList = allDocs.stream()
                        .filter(doc -> finalCategory != null && finalCategory.equals(doc.getCategoryGroupName()))
                        .collect(Collectors.toList());
            }

            // 3. 필터링된 결과 세팅 및 반환
            dto.setDocuments(filteredList);
            return dto;

        } catch (Exception e) {
            throw new RuntimeException("데이터 처리 실패", e);
        }
    }


    private String mapCategoryName(String category) {
        if (category == null) return null;
        return switch (category.toLowerCase()) {
            case "cafe" -> "카페";
            case "restaurant" -> "레스토랑";
            default -> null;
        };
    }
//----------------------------------------------------------------------------------------------------
}