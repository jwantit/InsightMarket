package com.InsightMarket.service;


import com.InsightMarket.ai.locationchatbot.dto.LocationRequestDTO;
import com.InsightMarket.ai.locationchatbot.dto.comparison.LocationComparisonResponseDTO;
import com.InsightMarket.ai.locationchatbot.dto.llm.LocationLLmResponseDTO;
import com.InsightMarket.ai.locationchatbot.service.LocationService;
import com.InsightMarket.ai.locationchatbot.service.LocationServiceImpl;
import com.fasterxml.jackson.databind.SerializationFeature;
import lombok.ToString;
import lombok.extern.log4j.Log4j2;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.core.io.ClassPathResource;
import org.springframework.test.annotation.Commit;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;


@SpringBootTest
@Log4j2
@ToString
public class LocationServiceImplTests {

    @Autowired
    private LocationService locationService;
    @Autowired
    private LocationServiceImpl locationServiceImpl;



    @Autowired
    private com.fasterxml.jackson.databind.ObjectMapper objectMapper;
    @Test
    @Transactional
    @Commit
    public void locationServiceTest() throws Exception {
        // 1. 테스트용 더미 데이터 설정
        LocationRequestDTO request = new LocationRequestDTO();
        request.setLatitude(37.498086);
        request.setLongitude(127.027582);
        request.setRadius(300L);
        request.setCategory("cafe");

        // 2. 서비스 호출
        LocationComparisonResponseDTO response = locationService.getOneLocation(request);

        // 3. JSON 형태로 예쁘게 출력하기 (Pretty Print)
        objectMapper.enable(SerializationFeature.INDENT_OUTPUT);
        String jsonResponse = objectMapper.writeValueAsString(response);

        System.out.println("======= [테스트 결과 JSON] =======");
        System.out.println(jsonResponse);
        System.out.println("=================================");

        // 4. 기본 검증
        assertNotNull(response);
        if (response.getFoundCount() > 0) {
            assertNotNull(response.getBestPlaceId());
        }
    }

    @Test
    @Transactional
    @Commit
    void jsonLoadTest() throws Exception {
        ClassPathResource resource =
                new ClassPathResource("data/placesData.json");

        String json = new String(
                resource.getInputStream().readAllBytes(),
                StandardCharsets.UTF_8
        );

        System.out.println(json);
    }

//    @Test
//    @Transactional
//    @Commit
//    void jsonLoadTestss() throws Exception {
//        // 1. 카테고리 파라미터를 전달하며 서비스 호출
//        String category = "restaurant";
//        LocationAllDocumentDTO result = locationService.loadFromJson();
//
//        // 2. 결과 검증
//        Assertions.assertThat(result).isNotNull();
//
//        // 3. JSON으로 예쁘게 출력 (객체를 String으로 변환)
//        String prettyJson = objectMapper.writerWithDefaultPrettyPrinter()
//                .writeValueAsString(result);
//
//        System.out.println("======= [필터링된 JSON 결과] =======");
//        System.out.println(prettyJson);
//        System.out.println("개수: " + result.getDocuments().size());
//    }

    @Test
    @Transactional
    @Commit
    void getLLM() throws Exception {
        String worstPlaceId = "kakao:111";
        String placeId = "kakao:112";
        Long re = 300L;

        LocationRequestDTO locationRequestDTO = LocationRequestDTO.builder()
                .placeId(placeId)
                .radius(re)
                .worstPlaceId(worstPlaceId).build();
        LocationLLmResponseDTO locationLLmResponseDTO = locationService.getConsulting(locationRequestDTO);

        log.info(locationLLmResponseDTO);
    }
    }



