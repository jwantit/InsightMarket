package com.InsightMarket.security.filter;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.Map;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import com.google.gson.Gson;
import com.InsightMarket.dto.member.MemberDTO;
import com.InsightMarket.security.util.JWTUtil;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.log4j.Log4j2;

@Log4j2
public class JWTCheckFilter extends OncePerRequestFilter {

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {

        // Preflight요청은 체크하지 않음
        // 브라우저 CORS 통과용
        /*
         * OPTIONS /api/products -> 이게 Prefilght. 실제 데이터 요청(GET, POST) 전에 “이 요청을 보내도
         * 되나요?”라고 서버에 확인
         * Origin: http://localhost:3000
         * Access-Control-Request-Method: GET
         * Access-Control-Request-Headers: Authorization
         */
        if (request.getMethod().equals("OPTIONS")) {
            return true;
        }

        String path = request.getRequestURI();

        log.info("check uri......................." + path);

        // /member/login 와 /member/join 경로의 호출은 체크하지 않음
        // “JWTCheckFilter는 ‘로그인 이후 영역’만 담당한다”
        // "/member/login" 는 JWT를 발급받기 위한 경로이기 때문에 스킵
        // "/member/approve" 는 filter 적용해야함
        if (path.equals("/member/login") || path.equals("/member/join") || path.equals("/member/kakao")) {
            return true;
        }

        // 회사 목록 조회는 JWT 없이 허용
        if (path.startsWith("/api/company/list")) return true;

        // 파일 다운로드는 JWT 없이 허용 (img 태그의 src 요청이나 window.open에는 Authorization 헤더가 없음)
        if (path.startsWith("/api/files/")) {
            // 썸네일 또는 일반 파일 다운로드 모두 허용
            if (path.endsWith("/thumbnail") || path.matches("/api/files/\\d+")) {
                return true;
            }
        }

        return false;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {

        log.info("------------------------JWTCheckFilter------------------");

        String accessToken = null;

        // 1. Authorization 헤더에서 JWT 추출 (기존 방식, 일반 API용)
        String authHeaderStr = request.getHeader("Authorization");
        if (authHeaderStr != null && authHeaderStr.startsWith("Bearer ")) {
            accessToken = authHeaderStr.substring(7);
            log.info("JWT found in Authorization header");
        }

        // 2. Authorization 헤더가 없으면 쿠키에서 JWT 추출 (SSE용)
        if (accessToken == null) {
            jakarta.servlet.http.Cookie[] cookies = request.getCookies();
            if (cookies != null) {
                for (jakarta.servlet.http.Cookie cookie : cookies) {
                    if ("accessToken".equals(cookie.getName())) {
                        accessToken = cookie.getValue();
                        log.info("JWT found in cookie");
                        break;
                    }
                }
            }
        }

        // 3. 쿠키에도 없으면 쿼리 파라미터에서 추출 (SSE용, 보안상 권장하지 않지만 EventSource 제약으로 인해 필요)
        if (accessToken == null) {
            accessToken = request.getParameter("token");
            if (accessToken != null) {
                log.info("JWT found in query parameter");
            }
        }

        // JWT가 없으면 에러 응답
        if (accessToken == null) {
            log.error("JWT not found in Authorization header, cookie, or query parameter");
            Gson gson = new Gson();
            String msg = gson.toJson(Map.of("error", "ERROR_ACCESS_TOKEN"));
            response.setContentType("application/json");
            PrintWriter printWriter = response.getWriter();
            printWriter.println(msg);
            printWriter.close();
            return;
        }

        try {
            Map<String, Object> claims = JWTUtil.validateToken(accessToken);

            log.info("JWT claims: " + claims);

            // filterChain.doFilter(request, response);

            String email = (String) claims.get("email");
            String name = (String) claims.get("name");
            Boolean isSocial = (Boolean) claims.get("isSocial");
            Boolean isApproved = (Boolean) claims.get("isApproved");
            String role = (String) claims.get("role");

            // MemberDTO는 UserDetails 구현체
            // JWT에 들어 있던 사용자 정보를 Security가 이해할 수 있는 사용자 객체로 변환
            MemberDTO memberDTO = new MemberDTO(email, "", name, isSocial.booleanValue(), isApproved.booleanValue(), role);

            log.info("-----------------------------------");
            log.info(memberDTO);
            log.info(memberDTO.getAuthorities());

            // Authentication 객체를 만들고
            UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(memberDTO, null, memberDTO.getAuthorities());

            // SecurityContextHolder에 넣어서 “인증된 사용자”로 만들어줌
            SecurityContextHolder.getContext().setAuthentication(authenticationToken);

            filterChain.doFilter(request, response);

        } catch (Exception e) {
            // 여기서 직접 response를 만들어서 끝냄
            log.error("JWT Check Error..............");
            log.error(e.getMessage());

            Gson gson = new Gson();
            String msg = gson.toJson(Map.of("error", "ERROR_ACCESS_TOKEN"));

            response.setContentType("application/json");
            PrintWriter printWriter = response.getWriter();
            printWriter.println(msg);
            printWriter.close();

        }
    }

}