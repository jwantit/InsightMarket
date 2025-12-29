package com.InsightMarket.controller.util;

import com.InsightMarket.domain.member.Member;
import com.InsightMarket.repository.member.MemberRepository;
import com.InsightMarket.security.util.JWTUtil;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.Map;

/**
 * 컨트롤러에서 공통으로 사용하는 유틸리티 메서드
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class ControllerUtil {

    private final MemberRepository memberRepository;

    /**
     * JWT 토큰에서 현재 사용자 정보를 가져옵니다.
     * @param request HttpServletRequest
     * @return 현재 로그인한 Member 엔티티
     * @throws IllegalStateException 인증 토큰이 없거나 유효하지 않은 경우
     */
    public Member getCurrentMember(HttpServletRequest request) {
        String authHeaderStr = request.getHeader("Authorization");
        if (authHeaderStr == null || !authHeaderStr.startsWith("Bearer ")) {
            throw new IllegalStateException("인증 토큰이 없습니다.");
        }
        try {
            String accessToken = authHeaderStr.substring(7);
            Map<String, Object> claims = JWTUtil.validateToken(accessToken);
            String email = (String) claims.get("email");
            return memberRepository.findByEmail(email)
                    .orElseThrow(() -> new IllegalStateException("사용자를 찾을 수 없습니다: " + email));
        } catch (Exception e) {
            log.error("JWT 토큰 파싱 실패", e);
            throw new IllegalStateException("인증 토큰 처리 중 오류가 발생했습니다.", e);
        }
    }
}

