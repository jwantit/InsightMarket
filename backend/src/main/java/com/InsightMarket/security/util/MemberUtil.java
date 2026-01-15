package com.InsightMarket.security.util;

import com.InsightMarket.common.exception.ApiException;
import com.InsightMarket.common.exception.ErrorCode;
import com.InsightMarket.domain.member.Member;
import com.InsightMarket.dto.member.MemberDTO;
import com.InsightMarket.repository.member.MemberRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Log4j2
@Component
@RequiredArgsConstructor
public class MemberUtil {

    private final MemberRepository memberRepository;

    public Member getCurrentMember() {
        MemberDTO dto = getCurrentMemberDTO();
        return memberRepository.findByEmail(dto.getEmail())
                .orElseThrow(() -> new ApiException(ErrorCode.MEMBER_NOT_FOUND));
    }

    public MemberDTO getCurrentMemberDTO() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof MemberDTO memberDTO) {
            return memberDTO;
        }
        throw new ApiException(ErrorCode.AUTH_REQUIRED);
    }
}
