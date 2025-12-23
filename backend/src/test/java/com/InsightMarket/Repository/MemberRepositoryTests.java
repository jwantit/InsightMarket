package com.InsightMarket.Repository;

import lombok.extern.log4j.Log4j2;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.InsightMarket.domain.member.Member;
import com.InsightMarket.repository.member.MemberRepository;
import com.InsightMarket.domain.member.SystemRole;

@SpringBootTest
@Log4j2
public class MemberRepositoryTests {

    @Autowired
    private MemberRepository memberRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Test
    public void testInsertMember(){

        for (int i = 0; i < 10 ; i++) {

            Member member = Member.builder()
                    .email("user"+i+"@aaa.com")
                    .password(passwordEncoder.encode("1111"))
                    .name("USER"+i)
                    .systemRole(SystemRole.USER)
                    .build();

            if(i >= 5){
                member.changeSystemRole(SystemRole.COMPANY_ADMIN);
            }

            if(i >=8){
                member.changeSystemRole(SystemRole.ADMIN);
            }
            memberRepository.save(member);
        }
    }

    @Test
    public void testRead() {

        String email = "user9@aaa.com";

        Member withCompanyMember = memberRepository.findWithCompanyByEmail(email)
                .orElseThrow(() ->
                        new UsernameNotFoundException("Not Found: " + email) // new APILoginFailHandler() 가 호출됨
                );

        Member onlyMember = memberRepository.findByEmail(email)
                .orElseThrow(() ->
                        new UsernameNotFoundException("Not Found: " + email) // new APILoginFailHandler() 가 호출됨
                );


        log.info("-----------------");
        log.info(withCompanyMember);
        log.info(onlyMember);
    }
}