package com.InsightMarket.security.filter;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;
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

        return false;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {

        log.info("------------------------JWTCheckFilter------------------");

        String authHeaderStr = request.getHeader("Authorization");

        try {
            // Bearer accestoken...
            String accessToken = authHeaderStr.substring(7);
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