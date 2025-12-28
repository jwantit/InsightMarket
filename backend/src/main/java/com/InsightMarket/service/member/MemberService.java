package com.InsightMarket.service.member;

import com.InsightMarket.domain.member.SystemRole;
import com.InsightMarket.dto.member.*;
import org.springframework.transaction.annotation.Transactional;

import com.InsightMarket.domain.member.Member;

import java.util.List;

@Transactional
public interface MemberService {

    void join(MemberJoinRequestDTO dto);

    void approve(Long targetMemberId, MemberDTO currentUser);

    List<MemberResponseDTO> getPendingMembers(MemberDTO memberDTO);

    MemberDTO getKakaoMember(String accessToken);

    void modifyMember(MemberModifyDTO memberModifyDTO);

    List<AdminMemberResponseDTO> getCompanyMembers(MemberDTO requester, String keyword, Boolean expired, String role);

    void changeSystemRole(MemberDTO requester, Long targetMemberId, SystemRole nextRole);

    void changeExpired(MemberDTO requester, Long targetMemberId, boolean isExpired);

    default MemberDTO entityToDTO(Member member) {

        MemberDTO dto = new MemberDTO(
                member.getEmail(),
                member.getPassword(),
                member.getName(),
                member.isSocial(),
                member.isApproved(),
                member.getSystemRole().name());
        return dto;
    }

    // DTO -> Entity 수동 매핑
    default Member dtoToEntity(MemberDTO dto) {
        return Member.builder()
                .email(dto.getEmail())
                .name(dto.getName())
                .isSocial(dto.isSocial())
                .isApproved(dto.isApproved())
                .systemRole(SystemRole.valueOf(dto.getRoleNames().get(0)))
                .build();
    }
}