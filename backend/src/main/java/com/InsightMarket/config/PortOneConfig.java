package com.InsightMarket.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.beans.factory.annotation.Value;

@Configuration
public class PortOneConfig {

    @Value("${portone.api.secret}")
    private String apiSecret;

    @Bean
    public WebClient portOneWebClient() {
        return WebClient.builder()
                .baseUrl("https://api.portone.io")
                // V2 방식은 헤더에 "PortOne " + 시크릿을 넣어야 합니다.
                .defaultHeader("Authorization", "PortOne " + apiSecret)
                .defaultHeader("Content-Type", "application/json")
                .build();
    }
}