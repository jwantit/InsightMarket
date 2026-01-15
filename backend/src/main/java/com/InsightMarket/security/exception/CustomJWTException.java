package com.InsightMarket.security.exception;

public class CustomJWTException extends RuntimeException{

    public CustomJWTException(String msg){
        super(msg);
    }

}