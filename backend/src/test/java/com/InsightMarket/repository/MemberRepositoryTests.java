package com.InsightMarket.repository;

import com.InsightMarket.domain.company.Company;
import com.InsightMarket.repository.company.CompanyRepository;
import lombok.extern.log4j.Log4j2;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.InsightMarket.domain.member.Member;
import com.InsightMarket.repository.member.MemberRepository;
import com.InsightMarket.domain.member.SystemRole;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@Log4j2
public class MemberRepositoryTests {

    @Autowired
    private MemberRepository memberRepository;

    @Autowired
    private CompanyRepository companyRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Test
    public void testInsertMember() {

        Company companyA = companyRepository.findById(1L).orElseThrow();
        Company companyB = companyRepository.findById(2L).orElseThrow();

        for (int i = 0; i < 10; i++) {

            SystemRole role = SystemRole.USER;
            boolean approved = false;
            Company requestedCompany = companyA;

            // 5~7 : COMPANY_ADMIN (회사 A)
            if (i >= 5 && i < 8) {
                role = SystemRole.COMPANY_ADMIN;
                approved = true;
            }

            // 8~9 : ADMIN (운영자)
            if (i >= 8) {
                role = SystemRole.ADMIN;
                approved = true;
                requestedCompany = null;
            }

            Member member = Member.builder()
                    .email("user" + i + "@aaa.com")
                    .password(passwordEncoder.encode("1111"))
                    .name("USER" + i)
                    .systemRole(role)
                    .isApproved(approved)
                    .isExpired(false)
                    .isSocial(false)
                    .requestedCompany(requestedCompany)
                    .company(approved ? requestedCompany : null)
                    .build();

            memberRepository.save(member);
        }
    }

    @Transactional
    @Test
    public void testRead() {

        String email = "user7@aaa.com";

        Member withCompany = memberRepository.findWithCompanyByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException(email));

        Member onlyMember = memberRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException(email));

        log.info("----- with company -----");
        log.info(withCompany);
        log.info(withCompany.getCompany());

        log.info("----- only member -----");
        log.info(onlyMember);
    }
}