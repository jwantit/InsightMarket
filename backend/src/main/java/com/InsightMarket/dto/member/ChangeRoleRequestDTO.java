package com.InsightMarket.dto.member;

import com.InsightMarket.domain.member.SystemRole;
import lombok.Getter;

@Getter
public class ChangeRoleRequestDTO {
    private SystemRole role;
}
