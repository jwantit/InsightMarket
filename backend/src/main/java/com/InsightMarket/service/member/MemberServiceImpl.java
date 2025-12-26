package com.InsightMarket.service.member;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Optional;

import com.InsightMarket.domain.company.Company;
import com.InsightMarket.dto.member.*;
import com.InsightMarket.repository.company.CompanyRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponents;
import org.springframework.web.util.UriComponentsBuilder;

import com.InsightMarket.domain.member.Member;
import com.InsightMarket.domain.member.SystemRole;
import com.InsightMarket.repository.member.MemberRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

@Service
@RequiredArgsConstructor
@Log4j2
public class MemberServiceImpl implements MemberService {

    private final MemberRepository memberRepository;
    private final CompanyRepository companyRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    @Override
    public void join(MemberJoinRequestDTO dto) {

        //이메일 중복 체크
        if (memberRepository.existsByEmail(dto.getEmail())) {
            throw new IllegalArgumentException("이미 존재하는 이메일입니다.");
        }

        Company company = null;
        SystemRole role;

        if (dto.getJoinType() == JoinType.NEW_COMPANY) {
            // 새로운 회사 생성
            company = Company.builder()
                    .name(dto.getCompanyName())
                    .build();
            companyRepository.save(company);

            // 새 회사 생성자는 COMPANY_ADMIN
            role = SystemRole.COMPANY_ADMIN;

        } else if (dto.getJoinType() == JoinType.JOIN_COMPANY) {
            // 기존 회사 가입
            company = companyRepository.findById(dto.getRequestedCompanyId())
                    .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회사입니다."));

            // 일반 회원은 USER
            role = SystemRole.USER;

        } else {
            throw new IllegalArgumentException("올바르지 않은 가입 유형입니다.");
        }

        Member member = Member.builder()
                .name(dto.getName())
                .email(dto.getEmail())
                .password(passwordEncoder.encode(dto.getPassword()))
                .systemRole(role) // USER / COMPANY_ADMIN
                .requestedCompany(dto.getJoinType() == JoinType.JOIN_COMPANY ? company : null) // JOIN_COMPANY만 요청회사
                .company(role == SystemRole.COMPANY_ADMIN ? company : null) // COMPANY_ADMIN이면 바로 자기 회사 채움
                .isSocial(false)
                .isApproved(role == SystemRole.COMPANY_ADMIN) // COMPANY_ADMIN이면 바로 승인
                .isExpired(false)
                .build();

        try {
            memberRepository.save(member);
        } catch (DataIntegrityViolationException e) {
            throw new IllegalArgumentException("이미 존재하는 이메일입니다.");
        }
    }

    @Transactional
    @Override
    public void approve(Long targetMemberId, MemberDTO currentUser) {

        //approver : 현재 승인 유저
        Member approver = memberRepository
                .findWithCompanyByEmail(currentUser.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("회원이 존재하지 않습니다."));

        //승인할 타겟 회원 조회
        Member target = memberRepository
                .findById(targetMemberId)
                .orElseThrow(() -> new IllegalArgumentException("승인할 회원이 존재하지 않습니다."));

        if (target.isApproved()) {
            throw new IllegalStateException("이미 승인된 회원입니다.");
        }

        SystemRole role = approver.getSystemRole();

        // ADMIN: 무조건 승인 가능
        if (role == SystemRole.ADMIN) {
            target.changeIsApproved(true);
            target.changeCompany(target.getRequestedCompany());
            target.clearRequestedCompany();
            return;
        }

        // COMPANY_ADMIN: 회사 일치해야 승인 가능
        if (role == SystemRole.COMPANY_ADMIN) {

            // NEW_COMPANY 가입자는 승인 요청 없음 -> 건너뛰기 가능
            if (target.getRequestedCompany() == null) {
                throw new IllegalStateException("승인할 대상이 없습니다.");
            }

            if (!target.getRequestedCompany().equals(approver.getCompany())) {
                throw new AccessDeniedException("다른 회사의 회원은 승인할 수 없습니다.");
            }

            target.changeIsApproved(true);
            target.changeCompany(target.getRequestedCompany());
            target.clearRequestedCompany();
            return;
        }


    }

    @Override
    public List<MemberResponseDTO> getPendingMembers(MemberDTO memberDTO) {

        // 이메일로 DB Member 조회
        Member admin = memberRepository
                .findWithCompanyByEmail(memberDTO.getEmail())
                .orElseThrow();

        // ADMIN : 전체 승인대기 멤버 조회
        if (admin.getSystemRole() == SystemRole.ADMIN) {
            return memberRepository.findByIsApprovedFalse()
                    .stream().map(MemberResponseDTO::from).toList();
        }

        // COMPANY_ADMIN → 자기 회사만
        if (admin.getSystemRole() == SystemRole.COMPANY_ADMIN) {
            return memberRepository
                    .findByIsApprovedFalseAndRequestedCompany(admin.getCompany())
                    .stream().map(MemberResponseDTO::from).toList();
        }

        throw new AccessDeniedException("조회 권한이 없습니다.");
    }

    @Override
    public MemberDTO getKakaoMember(String accessToken) {

        String email = getEmailFromKakaoAccessToken(accessToken);

        log.info("email: " + email);

        Optional<Member> result = memberRepository.findByEmail(email);

        // 기존의 회원
        if (result.isPresent()) {
            MemberDTO memberDTO = entityToDTO(result.get());

            return memberDTO;
        }

        // 회원이 아니었다면
        // 닉네임은 '소셜회원'으로
        // 패스워드는 임의로 생성
        Member socialMember = makeSocialMember(email);
        memberRepository.save(socialMember);

        MemberDTO memberDTO = entityToDTO(socialMember);

        return memberDTO;
    }

    @Override
    public void modifyMember(MemberModifyDTO memberModifyDTO) {

        Optional<Member> result = memberRepository.findByEmail(memberModifyDTO.getEmail());

        Member member = result.orElseThrow();

        member.changePassword(passwordEncoder.encode(memberModifyDTO.getPassword()));
        member.changeIsSocial(false);
        member.changeName(memberModifyDTO.getName());

        memberRepository.save(member);
    }

    private String getEmailFromKakaoAccessToken(String accessToken) {

        String kakaoGetUserURL = "https://kapi.kakao.com/v2/user/me";

        if (accessToken == null) {
            throw new RuntimeException("Access Token is null");
        }
        RestTemplate restTemplate = new RestTemplate();

        HttpHeaders headers = new HttpHeaders();
        headers.add("Authorization", "Bearer " + accessToken);
        headers.add("Content-Type", "application/x-www-form-urlencoded");
        HttpEntity<String> entity = new HttpEntity<>(headers);

        UriComponents uriBuilder = UriComponentsBuilder.fromHttpUrl(kakaoGetUserURL).build();

        ResponseEntity<LinkedHashMap> response = restTemplate.exchange(
                uriBuilder.toString(),
                HttpMethod.GET,
                entity,
                LinkedHashMap.class);

        log.info(response);

        LinkedHashMap<String, LinkedHashMap> bodyMap = response.getBody();

        log.info("------------------------------");
        log.info(bodyMap);

        LinkedHashMap<String, String> kakaoAccount = bodyMap.get("kakao_account");

        log.info("kakaoAccount: " + kakaoAccount);

        return kakaoAccount.get("email");
    }

    private Member makeSocialMember(String email) {

        String tempPassword = makeTempPassword();

        log.info("tempPassword: " + tempPassword);

        String name = "소셜회원";

        Member member = Member.builder()
                .email(email)
                .password(passwordEncoder.encode(tempPassword))
                .name(name)
                .isSocial(true)
                .systemRole(SystemRole.USER)
                .build();

        return member;
    }

    private String makeTempPassword() {

        // 멀티스레드 환경에서 여러 스레드가 공유된 자원(객체, 함수, 변수 등)
        // 동시에 접근하는 것을 조절하고 조율하는 방법
        StringBuffer buffer = new StringBuffer();

        for (int i = 0; i < 10; i++) {
            buffer.append((char) ((int) (Math.random() * 55) + 65));
        }
        return buffer.toString();
    }
}