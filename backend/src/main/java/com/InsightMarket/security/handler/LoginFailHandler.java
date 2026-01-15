package com.InsightMarket.security.handler;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.Map;

import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.AuthenticationFailureHandler;

import com.google.gson.Gson;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.log4j.Log4j2;

@Log4j2
public class LoginFailHandler implements AuthenticationFailureHandler {

    @Override
    public void onAuthenticationFailure(HttpServletRequest request,
                                        HttpServletResponse response,
                                        AuthenticationException exception)
            throws IOException {
        log.info("Login fail...." + exception);

        String errorCode = "BAD_CREDENTIALS";
        int status = HttpServletResponse.SC_UNAUTHORIZED;

        if ("NOT_APPROVED".equals(exception.getMessage())) {
            errorCode = "NOT_APPROVED";
            status = HttpServletResponse.SC_FORBIDDEN;
        }

        response.setStatus(status);
        response.setContentType("application/json;charset=UTF-8");

        Gson gson = new Gson();
        Map<String, String> body = Map.of(
                "error", errorCode
        );

        response.getWriter().write(gson.toJson(body));
    }
}