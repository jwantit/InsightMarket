package com.InsightMarket.dto.member;

import com.InsightMarket.domain.member.SystemRole;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AdminMemberResponseDTO {
    private Long memberId;
    private String name;
    private String email;
    private SystemRole role;
    private boolean isApproved; // 조회만
    private boolean isExpired;
    private boolean isSocial;
}
