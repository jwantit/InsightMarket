package com.InsightMarket.dto.member;

import com.InsightMarket.domain.member.Member;
import lombok.*;

@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class MemberResponseDTO {

    private Long memberId;
    private String email;
    private String name;
    private String role;
    private boolean isApproved;
    private Long requestedCompanyId;
    private String requestedCompanyName;

    public static MemberResponseDTO from(Member member) {
        return MemberResponseDTO.builder()
                .memberId(member.getId())
                .email(member.getEmail())
                .name(member.getName())
                .role(member.getSystemRole().name())
                .isApproved(member.isApproved())
                .requestedCompanyId(
                        member.getRequestedCompany() != null
                                ? member.getRequestedCompany().getId()
                                : null
                )
                .requestedCompanyName(
                        member.getRequestedCompany() != null
                                ? member.getRequestedCompany().getName()
                                : null
                )
                .build();
    }
}
