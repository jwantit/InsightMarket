package com.InsightMarket.security.filter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.log4j.Log4j2;
import org.slf4j.MDC;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.UUID;

@Log4j2
public class TraceIdFilter extends OncePerRequestFilter {

    // ============================================================
    // [기능] TraceId 생성/전파 필터
    // - 요청 헤더 X-Trace-Id 우선 사용
    // - 없으면 t- + uuid(12) 생성
    // - 응답 헤더 X-Trace-Id로 내려줌
    // - MDC에 traceId 저장 (로그 추적)
    // ============================================================

    private static final String HEADER = "X-Trace-Id";
    private static final String MDC_KEY = "traceId";

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        String traceId = request.getHeader(HEADER);
        if (traceId == null || traceId.isBlank()) {
            traceId = "t-" + UUID.randomUUID().toString().replace("-", "").substring(0, 12);
        }

        MDC.put(MDC_KEY, traceId);
        response.setHeader(HEADER, traceId);

        long start = System.currentTimeMillis();
        log.info("[TraceIdFilter] start traceId={} {} {}", traceId, request.getMethod(), request.getRequestURI());

        try {
            filterChain.doFilter(request, response);
        } finally {
            long elapsedMs = System.currentTimeMillis() - start;
            log.info("[TraceIdFilter] end traceId={} elapsedMs={}", traceId, elapsedMs);
            MDC.remove(MDC_KEY);
        }
    }
}
