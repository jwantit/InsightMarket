package com.InsightMarket.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@RestController
@RequiredArgsConstructor
public class PaymentTestController {

    // 우리가 PortOneConfig에서 만든 그 '무전기'를 가져옵니다.
    private final WebClient portOneWebClient;

    @GetMapping("/test/payment/{paymentId}")
    public Mono<String> testGetPayment(@PathVariable String paymentId) {
        return portOneWebClient.get()
                .uri("/payments/" + paymentId) // 포트원 서버 주소 뒤에 붙을 상세 주소
                .retrieve()
                .bodyToMono(String.class) // 응답 결과를 문자열(JSON)로 받기
                .onErrorResume(e -> Mono.just("에러 발생: " + e.getMessage()));
    }
}