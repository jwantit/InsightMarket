package com.InsightMarket.controller;

import com.InsightMarket.dto.member.MemberApproveRequestDTO;
import com.InsightMarket.dto.member.MemberDTO;
import com.InsightMarket.dto.member.MemberJoinRequestDTO;
import com.InsightMarket.dto.member.MemberResponseDTO;
import com.InsightMarket.repository.member.MemberRepository;
import com.InsightMarket.service.member.MemberService;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
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
    @PostMapping("/join")
    public ResponseEntity<?> join(@RequestBody MemberJoinRequestDTO request) {
        memberService.join(request);
        return ResponseEntity.ok().build();
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
}