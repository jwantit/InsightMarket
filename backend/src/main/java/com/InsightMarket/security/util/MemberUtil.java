package com.InsightMarket.security.util;

import com.InsightMarket.domain.member.Member;
import com.InsightMarket.dto.member.MemberDTO;
import lombok.extern.log4j.Log4j2;
import org.modelmapper.ModelMapper;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Log4j2
@Component
public class MemberUtil {

    private final ModelMapper modelMapper;

    public MemberUtil(ModelMapper modelMapper) {
        this.modelMapper = modelMapper;
    }

    //현재 인증된 회원 정보(Entity)
    public Member getCurrentMember() {

        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        log.info("Principal: " + principal);

        if (principal instanceof MemberDTO memberDTO) {
            return modelMapper.map(memberDTO, Member.class);
        }
        else if (principal instanceof UsernamePasswordAuthenticationToken auth
           && auth.getPrincipal() instanceof MemberDTO memberDTO2) {
        return modelMapper.map(memberDTO2, Member.class);
    }

        throw new IllegalStateException("로그인 정보가 존재하지 않습니다.");
    }

    //현재 인증된 회원 정보(DTO)
    public MemberDTO getCurrentMemberDTO() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        if (principal instanceof MemberDTO memberDTO) {
            return memberDTO;
        }

        throw new IllegalStateException("로그인 정보가 존재하지 않습니다.");
    }
}
