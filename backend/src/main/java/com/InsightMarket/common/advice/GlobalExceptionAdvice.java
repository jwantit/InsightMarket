package com.InsightMarket.common.advice;

import java.time.LocalDateTime;
import java.util.NoSuchElementException;

import com.InsightMarket.common.exception.ApiException;
import com.InsightMarket.common.exception.ErrorCode;
import com.InsightMarket.common.exception.ErrorResponse;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.InsightMarket.security.exception.CustomJWTException;

//RestControllerAdvice : Spring에서 전역(Global) 예외 처리 + 공통 로직을 REST API 방식(JSON) 으로 처리하기 위한 어노테이션
//컨트롤러 전반에서 발생하는 예외를 한 곳에서 잡아서 JSON 응답으로 반환하는 장치
@RestControllerAdvice
@Log4j2
public class GlobalExceptionAdvice {

    // =====서비스 단 ApiException 처리 =====
    @ExceptionHandler(ApiException.class)
    protected ResponseEntity<ErrorResponse> handleApiException(ApiException e) {

        ErrorCode errorCode = e.getErrorCode();
        log.error("API Exception: {}", errorCode.name(), e);

        return ResponseEntity
                .status(errorCode.getStatus())
                .body(ErrorResponse.of(errorCode));
    }

    // ===== NoSuchElementException 일반 예외 처리 =====
    @ExceptionHandler(NoSuchElementException.class)
    protected ResponseEntity<ErrorResponse> handleNoSuchElement(NoSuchElementException e) {
        log.warn("NoSuchElementException: {}", e.getMessage());

        ErrorResponse response = ErrorResponse.builder()
                .code("NOT_FOUND")
                .message(e.getMessage())
                .timestamp(LocalDateTime.now())
                .build();

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    protected ResponseEntity<ErrorResponse> handleIllegalArgument(IllegalArgumentException e) {
        log.error("IllegalArgumentException: {}", e.getMessage(), e);

        ErrorResponse response = ErrorResponse.builder()
                .code("BAD_REQUEST")
                .message(e.getMessage())
                .timestamp(LocalDateTime.now())
                .build();

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    @ExceptionHandler(IllegalStateException.class)
    protected ResponseEntity<ErrorResponse> handleIllegalState(IllegalStateException e) {
        log.error("IllegalStateException: {}", e.getMessage(), e);

        ErrorResponse response = ErrorResponse.builder()
                .code("BAD_REQUEST")
                .message(e.getMessage())
                .timestamp(LocalDateTime.now())
                .build();

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    // ===== Validation 예외 처리 =====
    @ExceptionHandler(MethodArgumentNotValidException.class)
    protected ResponseEntity<ErrorResponse> handleValidationException(MethodArgumentNotValidException e) {
        log.error("ValidationException: {}", e.getMessage(), e);

        ErrorResponse response = ErrorResponse.builder()
                .code("VALIDATION_ERROR")
                .message(e.getMessage())
                .timestamp(LocalDateTime.now())
                .build();

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    // ===== JWT 관련 예외 처리 =====
    @ExceptionHandler(CustomJWTException.class)
    protected ResponseEntity<ErrorResponse> handleJWTException(CustomJWTException e) {
        log.error("JWT Exception: {}", e.getMessage(), e);

        ErrorResponse response = ErrorResponse.builder()
                .code("INVALID_TOKEN")
                .message(e.getMessage())
                .timestamp(LocalDateTime.now())
                .build();

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
    }

    // ===== 그 외 모든 예외 =====
    @ExceptionHandler(Exception.class)
    protected ResponseEntity<ErrorResponse> handleAll(Exception e) {
        log.error("Unhandled Exception: {}", e.getMessage(), e);

        ErrorResponse response = ErrorResponse.builder()
                .code("INTERNAL_SERVER_ERROR")
                .message("서버 오류가 발생했습니다.")
                .timestamp(LocalDateTime.now())
                .build();

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }
}