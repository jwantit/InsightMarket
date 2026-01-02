package com.InsightMarket.common.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum ErrorCode {

    // ===== 공통 =====
    ROLE_INVALID(HttpStatus.BAD_REQUEST, "유효하지 않은 권한입니다."),
    INVALID_REQUEST(HttpStatus.BAD_REQUEST, "잘못된 요청입니다."),
    INTERNAL_SERVER_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "서버 오류가 발생했습니다."),

    // ===== Project =====
    PROJECT_NOT_FOUND(HttpStatus.NOT_FOUND, "프로젝트를 찾을 수 없습니다."),
    PROJECT_DATE_INVALID(HttpStatus.BAD_REQUEST, "종료일은 시작일 이후여야 합니다."),

    // ===== Brand =====
    BRAND_NOT_FOUND(HttpStatus.NOT_FOUND, "브랜드를 찾을 수 없습니다."),

    // ===== Keyword =====
    KEYWORD_NOT_FOUND(HttpStatus.NOT_FOUND, "키워드를 찾을 수 없습니다."),

    // ===== Competitor =====
    COMPETITOR_NOT_FOUND(HttpStatus.NOT_FOUND, "존재하지 않는 경쟁사입니다."),

    // ===== Cart / Project - Solution =====
    SOLUTION_NOT_IN_PROJECT(HttpStatus.BAD_REQUEST, "해당 프로젝트에 속한 솔루션이 아닙니다."),

    // ===== Payment / Order =====
    MEMBER_NOT_FOUND(HttpStatus.NOT_FOUND, "사용자를 찾을 수 없습니다."),
    ORDER_NOT_FOUND(HttpStatus.NOT_FOUND, "존재하지 않는 주문입니다."),
    SOLUTION_NOT_FOUND(HttpStatus.NOT_FOUND, "존재하지 않는 상품입니다."),
    PAYMENT_AMOUNT_MISMATCH(HttpStatus.BAD_REQUEST, "결제 금액이 일치하지 않습니다."),
    PAYMENT_NOT_COMPLETED(HttpStatus.BAD_REQUEST, "결제가 완료되지 않은 상태입니다."),

    // ===== Member =====
    MEMBER_EMAIL_DUPLICATED(HttpStatus.CONFLICT, "이미 존재하는 이메일입니다."),
    TARGET_MEMBER_NOT_FOUND(HttpStatus.NOT_FOUND, "대상 회원이 존재하지 않습니다."),
    INVALID_JOIN_TYPE(HttpStatus.BAD_REQUEST, "올바르지 않은 가입 유형입니다."),
    MEMBER_ALREADY_APPROVED(HttpStatus.BAD_REQUEST, "이미 승인된 회원입니다."),
    NO_APPROVAL_TARGET(HttpStatus.BAD_REQUEST, "승인할 대상이 없습니다."),
    INVALID_BUSINESS_NUMBER(HttpStatus.BAD_REQUEST, "사업자 등록 번호가 해당 기업 정보와 일치하지 않습니다."),

    // ===== Brand Member =====
    BRAND_MEMBER_NOT_FOUND(HttpStatus.NOT_FOUND, "브랜드 멤버가 아닙니다."),
    BRAND_MEMBER_ALREADY_EXISTS(HttpStatus.CONFLICT, "이미 해당 브랜드에 포함된 멤버입니다."),

    // ===== Company =====
    COMPANY_NOT_FOUND(HttpStatus.NOT_FOUND, "존재하지 않는 회사입니다."),

    // ===== Auth / Permission =====
    AUTH_REQUIRED(HttpStatus.UNAUTHORIZED, "로그인이 필요합니다."),
    ACCESS_DENIED(HttpStatus.FORBIDDEN, "접근 권한이 없습니다."),

    DIFFERENT_COMPANY_ACCESS(HttpStatus.FORBIDDEN, "다른 회사의 회원은 관리할 수 없습니다."),
    SELF_ROLE_CHANGE_FORBIDDEN(HttpStatus.BAD_REQUEST, "본인 권한은 변경할 수 없습니다."),
    SELF_EXPIRE_FORBIDDEN(HttpStatus.BAD_REQUEST, "본인 계정은 탈퇴 처리할 수 없습니다."),

    // ===== Social / OAuth =====
    INVALID_ACCESS_TOKEN(HttpStatus.UNAUTHORIZED, "유효하지 않은 Access Token입니다."),

    // ===== Community / Board =====
    BOARD_NOT_FOUND(HttpStatus.NOT_FOUND, "게시글을 찾을 수 없습니다."),
    COMMENT_NOT_FOUND(HttpStatus.NOT_FOUND, "댓글을 찾을 수 없습니다.");

    private final HttpStatus status;
    private final String message;

    ErrorCode(HttpStatus status, String message) {
        this.status = status;
        this.message = message;
    }
}