package com.InsightMarket.service.member;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Optional;

import com.InsightMarket.common.exception.ApiException;
import com.InsightMarket.common.exception.ErrorCode;
import com.InsightMarket.domain.company.Company;
import com.InsightMarket.dto.brand.BrandRequestDTO;
import com.InsightMarket.dto.member.*;
import com.InsightMarket.repository.company.CompanyRepository;
import com.InsightMarket.service.brand.BrandService;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.*;
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
    private final BrandService brandService;

    @Transactional
    @Override
    public void join(MemberJoinRequestDTO dto) {

        //이메일 중복 체크
        if (memberRepository.existsByEmail(dto.getEmail())) {
            throw new ApiException(ErrorCode.MEMBER_EMAIL_DUPLICATED);
        }

        Company company = null;
        SystemRole role;

        if (dto.getJoinType() == JoinType.NEW_COMPANY) {

            // 새로운 회사 생성
            company = Company.builder()
                    .name(dto.getCompanyName())
                    .businessNumber(dto.getBusinessNumber())
                    .build();

            //사업자번호 예외 (중복 유니크)-----------------------
            try {
                companyRepository.save(company);
            }catch (DataIntegrityViolationException e){
                throw new ApiException(ErrorCode.DUPLICATE_BUSINESS_NUMBER);
            }//---------------------------------------------------
            
            
            // 새 회사 생성자는 COMPANY_ADMIN
            role = SystemRole.COMPANY_ADMIN;

        } else if (dto.getJoinType() == JoinType.JOIN_COMPANY) {
            // 기존 회사 가입
            company = companyRepository.findById(dto.getRequestedCompanyId())
                    .orElseThrow(() -> new ApiException(ErrorCode.COMPANY_NOT_FOUND));

            if (!company.getBusinessNumber().equals(dto.getBusinessNumber())) {
                // 번호가 다르면 가입 거부
                throw new ApiException(ErrorCode.INVALID_BUSINESS_NUMBER);
            }


            // 일반 회원은 USER
            role = SystemRole.USER;

        } else {
            throw new ApiException(ErrorCode.INVALID_JOIN_TYPE);
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



        //public class BrandRequestDTO {
        //    private String name;
        //    private String description;
        //    private List<String> keywords; // 브랜드 키워드
        //    private List<CompetitorDTO> competitors; // 경쟁사 + 키워드
        try {
            //회원가입시 브랜드 등록-------------------------------------------
            Member memberData = memberRepository.save(member);
            if (dto.getJoinType() == JoinType.NEW_COMPANY && dto.getBrands() != null){

                for (BrandRequestDTO brandRequestDTO : dto.getBrands()){
                    brandService.createBrand(brandRequestDTO, memberData, company);
                }
            }
        } catch (DataIntegrityViolationException e) {
            throw new ApiException(ErrorCode.MEMBER_EMAIL_DUPLICATED);
        }
    }

    @Transactional
    @Override
    public void approve(Long targetMemberId, MemberDTO currentUser) {

        //approver : 현재 승인 유저
        Member approver = memberRepository
                .findWithCompanyByEmail(currentUser.getEmail())
                .orElseThrow(() -> new ApiException(ErrorCode.MEMBER_NOT_FOUND));

        //승인할 타겟 회원 조회
        Member target = memberRepository
                .findById(targetMemberId)
                .orElseThrow(() -> new ApiException(ErrorCode.TARGET_MEMBER_NOT_FOUND));

        if (target.isApproved()) {
            throw new ApiException(ErrorCode.MEMBER_ALREADY_APPROVED);
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
                throw new ApiException(ErrorCode.NO_APPROVAL_TARGET);
            }

            if (!target.getRequestedCompany().equals(approver.getCompany())) {
                throw new ApiException(ErrorCode.DIFFERENT_COMPANY_ACCESS);
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
                .orElseThrow(() -> new ApiException(ErrorCode.MEMBER_NOT_FOUND));

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

        throw new ApiException(ErrorCode.ACCESS_DENIED);
    }

    @Override
    public MemberDTO getKakaoMember(String accessToken) {

        String email = getEmailFromKakaoAccessToken(accessToken);

        log.info("email: " + email);

        Optional<Member> result = memberRepository.findByEmail(email);

        // 기존의 회원
        if (result.isPresent()) {
            return entityToDTO(result.get());
        }

        // 회원이 아니었다면
        // 닉네임은 '소셜회원'으로
        // 패스워드는 임의로 생성
        Member socialMember = makeSocialMember(email);
        memberRepository.save(socialMember);

        return entityToDTO(socialMember);
    }

    @Override
    public void modifyMember(MemberModifyDTO memberModifyDTO) {

        Member member = memberRepository.findByEmail(memberModifyDTO.getEmail())
                .orElseThrow(() -> new ApiException(ErrorCode.MEMBER_NOT_FOUND));

        member.changePassword(passwordEncoder.encode(memberModifyDTO.getPassword()));
        member.changeIsSocial(false);
        member.changeName(memberModifyDTO.getName());

        memberRepository.save(member);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AdminMemberResponseDTO> getCompanyMembers(MemberDTO requesterDTO, String keyword, Boolean expired, String role) {
        Member requester = getRequester(requesterDTO);
        checkAdmin(requester);

        // role 문자열 -> enum 변환(옵션)
        SystemRole roleEnum = null;
        if (role != null && !role.isBlank()) {
            try {
                roleEnum = SystemRole.valueOf(role.trim());
            } catch (Exception e) {
                throw new ApiException(ErrorCode.INVALID_REQUEST);
            }
        }

        List<Member> members;

        // ADMIN은 전체
        if (requester.getSystemRole() == SystemRole.ADMIN) {
            members = memberRepository.searchMembers(keyword, expired, roleEnum);
        } else {
            members = memberRepository.searchMembersByCompany(requester.getCompany().getId(), keyword, expired, roleEnum);
        }

        return members.stream().map(m -> AdminMemberResponseDTO.builder()
                .memberId(m.getId())
                .name(m.getName())
                .email(m.getEmail())
                .role(m.getSystemRole())
                .isApproved(m.isApproved())
                .isExpired(m.isExpired())
                .isSocial(m.isSocial())
                .build()
        ).toList();
    }

    @Override
    public void changeSystemRole(MemberDTO requesterDTO, Long targetMemberId, SystemRole nextRole) {
        Member requester = getRequester(requesterDTO);
        checkAdmin(requester);

        Member target = memberRepository.findById(targetMemberId)
                .orElseThrow(() -> new ApiException(ErrorCode.TARGET_MEMBER_NOT_FOUND));

        checkSameCompanyOrAdmin(requester, target);

        if (requester.getId().equals(target.getId())) {
            throw new ApiException(ErrorCode.SELF_ROLE_CHANGE_FORBIDDEN);
        }

        target.changeSystemRole(nextRole);
    }

    @Override
    @Transactional
    public void changeExpired(MemberDTO requesterDTO, Long targetMemberId, boolean isExpired) {
        Member requester = getRequester(requesterDTO);
        checkAdmin(requester);

        Member target = memberRepository.findById(targetMemberId)
                .orElseThrow(() -> new ApiException(ErrorCode.TARGET_MEMBER_NOT_FOUND));

        checkSameCompanyOrAdmin(requester, target);

        if (requester.getId().equals(target.getId())) {
            throw new ApiException(ErrorCode.SELF_EXPIRE_FORBIDDEN);
        }

        target.changeIsExpired(isExpired);
    }

    private String getEmailFromKakaoAccessToken(String accessToken) {

        String kakaoGetUserURL = "https://kapi.kakao.com/v2/user/me";

        if (accessToken == null) {
            throw new ApiException(ErrorCode.INVALID_ACCESS_TOKEN);
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

    private Member getRequester(MemberDTO requesterDTO) {
        return memberRepository.findByEmail(requesterDTO.getEmail())
                .orElseThrow(() -> new ApiException(ErrorCode.MEMBER_NOT_FOUND));
    }

    private void checkAdmin(Member requester) {
        if (requester.getSystemRole() != SystemRole.ADMIN &&
                requester.getSystemRole() != SystemRole.COMPANY_ADMIN) {
            throw new ApiException(ErrorCode.ACCESS_DENIED);
        }
    }

    private void checkSameCompanyOrAdmin(Member requester, Member target) {
        if (requester.getSystemRole() == SystemRole.ADMIN) return;
        if (requester.getCompany() == null || target.getCompany() == null) {
            throw new ApiException(ErrorCode.COMPANY_NOT_FOUND);
        }
        if (!requester.getCompany().getId().equals(target.getCompany().getId())) {
            throw new ApiException(ErrorCode.DIFFERENT_COMPANY_ACCESS);
        }
    }
}
