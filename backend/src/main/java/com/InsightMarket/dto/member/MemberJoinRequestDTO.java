package com.InsightMarket.dto.member;

import com.InsightMarket.dto.brand.BrandRequestDTO;
import lombok.Getter;
import lombok.ToString;

import java.util.List;

@Getter
@ToString
public class MemberJoinRequestDTO {
    private String name;
    private String email;
    private String password;

    // 프론트에서 보내는 가입 유형
    private JoinType joinType; // NEW_COMPANY or JOIN_COMPANY

    private Long requestedCompanyId;  // JOIN_COMPANY 시 필요
    private String companyName;       // NEW_COMPANY 시 필요

    //회원가입시 브랜드 등록
    private List<BrandRequestDTO> brands;

    private String businessNumber;

}
