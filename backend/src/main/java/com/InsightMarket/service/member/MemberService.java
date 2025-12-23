package com.InsightMarket.service.member;

import org.springframework.transaction.annotation.Transactional;

import com.InsightMarket.domain.member.Member;
import com.InsightMarket.dto.member.MemberDTO;
import com.InsightMarket.dto.member.MemberModifyDTO;

@Transactional
public interface MemberService {

    MemberDTO getKakaoMember(String accessToken);

    void modifyMember(MemberModifyDTO memberModifyDTO);

    default MemberDTO entityToDTO(Member member) {

        MemberDTO dto = new MemberDTO(
                member.getEmail(),
                member.getPassword(),
                member.getName(),
                member.isSocial(),
                member.getSystemRole().name());
        return dto;
    }
}