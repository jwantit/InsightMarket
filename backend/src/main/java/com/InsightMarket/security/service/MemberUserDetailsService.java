package com.InsightMarket.security.service;

import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import com.InsightMarket.domain.member.Member;
import com.InsightMarket.dto.member.MemberDTO;
import com.InsightMarket.repository.member.MemberRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

@Service
@Log4j2
@RequiredArgsConstructor
// 로그인 시 입력한 아이디로 DB에서 유저 정보와 권한을 가져오는 클래스
public class MemberUserDetailsService implements UserDetailsService {

    private final MemberRepository memberRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {

        log.info("----------------loadUserByUsername-----------------------------");

        Member member = memberRepository.findWithCompanyByEmail(username)
                .orElseThrow(() ->
                        new UsernameNotFoundException("Not Found: " + username) // new APILoginFailHandler() 가 호출됨
                );

        MemberDTO memberDTO = new MemberDTO(
                member.getEmail(),
                member.getPassword(),
                member.getName(),
                member.isSocial(),
                member.getSystemRole().name());

        log.info(memberDTO);

        return memberDTO;

    }

}