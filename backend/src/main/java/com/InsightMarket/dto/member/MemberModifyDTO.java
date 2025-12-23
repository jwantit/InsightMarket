package com.InsightMarket.dto.member;

import lombok.Data;

@Data
public class MemberModifyDTO {

    private String email;

    private String password;

    private String name;
}