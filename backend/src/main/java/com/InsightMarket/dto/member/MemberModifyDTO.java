package com.InsightMarket.dto.member;

import lombok.Data;

@Data
public class MemberModifyDTO {

    private String email;

    private String password;

    private String name;

    private Long requestedCompanyId; // 소셜 로그인 사용자의 회사 선택
}