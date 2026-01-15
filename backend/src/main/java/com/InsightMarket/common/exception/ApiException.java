package com.InsightMarket.common.exception;

import lombok.Getter;

@Getter
public class ApiException extends RuntimeException {

    private final ErrorCode errorCode;

    public ApiException(ErrorCode errorCode) {
        super(errorCode.getMessage()); // 로그용
        this.errorCode = errorCode;
    }
}