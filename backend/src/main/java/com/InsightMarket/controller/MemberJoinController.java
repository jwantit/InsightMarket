package com.InsightMarket.controller;

import com.InsightMarket.domain.member.Member;
import com.InsightMarket.dto.member.MemberApproveRequestDTO;
import com.InsightMarket.dto.member.MemberDTO;
import com.InsightMarket.dto.member.MemberJoinRequestDTO;
import com.InsightMarket.dto.member.MemberJoinResponseDTO;
import com.InsightMarket.dto.member.MemberResponseDTO;
import com.InsightMarket.repository.member.MemberRepository;
import com.InsightMarket.service.member.MemberService;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import lombok.RequiredArgsConstructor;

import java.util.List;

@RestController
@RequiredArgsConstructor
@Log4j2
@RequestMapping("/member")
public class MemberJoinController {

    private final MemberService memberService;
    private final MemberRepository memberRepository;

    //회원 가입
    @PostMapping(value = "/join", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<MemberJoinResponseDTO> join(
            @RequestPart("request") MemberJoinRequestDTO request,
            @RequestPart(value = "brandImageFile", required = false) MultipartFile brandImageFile) {
        MemberJoinResponseDTO response = memberService.join(request, brandImageFile);
        return ResponseEntity.ok(response);
    }

    //가입 승인
    @PreAuthorize("hasAnyRole('ADMIN','COMPANY_ADMIN')")
    @PostMapping("/approve")
    public ResponseEntity<?> approve(@RequestBody MemberApproveRequestDTO request, @AuthenticationPrincipal MemberDTO memberDTO) {
        log.info("Post approve----");
        log.info(request.getMemberId());
        log.info(memberDTO);
        memberService.approve(request.getMemberId(), memberDTO);
        return ResponseEntity.ok().build();
    }

    //승인 대기 목록 조회
    @PreAuthorize("hasAnyRole('ADMIN','COMPANY_ADMIN')")
    @GetMapping("/pending")
    public ResponseEntity<List<MemberResponseDTO>> pending(@AuthenticationPrincipal MemberDTO memberDTO) {
        return ResponseEntity.ok(memberService.getPendingMembers(memberDTO));
    }

    //현재 로그인한 사용자 정보 조회
    @GetMapping("/current")
    public ResponseEntity<MemberResponseDTO> getCurrentMember(@AuthenticationPrincipal MemberDTO memberDTO) {
        if (memberDTO == null) {
            throw new IllegalStateException("인증되지 않은 사용자입니다.");
        }
        log.info("현재 사용자 조회: {}", memberDTO.getEmail());
        Member member = memberRepository.findByEmail(memberDTO.getEmail())
                .orElseThrow(() -> new IllegalStateException("사용자를 찾을 수 없습니다: " + memberDTO.getEmail()));
        return ResponseEntity.ok(MemberResponseDTO.from(member));
    }
}