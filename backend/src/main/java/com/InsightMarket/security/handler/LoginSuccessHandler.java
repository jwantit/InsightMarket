package com.InsightMarket.security.handler;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.Map;

import com.InsightMarket.domain.member.SystemRole;
import org.springframework.security.authentication.AuthenticationServiceException;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;

import com.google.gson.Gson;
import com.InsightMarket.dto.member.MemberDTO;
import com.InsightMarket.security.util.JWTUtil;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.log4j.Log4j2;

@Log4j2
public class LoginSuccessHandler implements AuthenticationSuccessHandler{

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication)
            throws IOException, ServletException{
        log.info("--------------LoginSuccessHandler-----------------");
        log.info(authentication);
        log.info("-------------------------------");

        MemberDTO memberDTO = (MemberDTO)authentication.getPrincipal();

        // 승인 안 된 일반 USER 차단
        if (!memberDTO.isApproved() && memberDTO.getRoleNames().contains("USER")) {

            throw new AuthenticationServiceException("NOT_APPROVED");
        }

        // 승인된 경우만 JWT 발급
        Map<String, Object> claims  = memberDTO.getClaims();

        String accessToken = JWTUtil.generateToken(claims, 60);
        String refreshToken = JWTUtil.generateToken(claims,60*24);


        claims.put("accessToken", accessToken);
        claims.put("refreshToken", refreshToken);

        Gson gson = new Gson();

        String jsonStr = gson.toJson(claims);

        response.setContentType("application/json; charset=UTF-8");
        PrintWriter printWriter = response.getWriter();
        printWriter.println(jsonStr);
        printWriter.close();
    }
}