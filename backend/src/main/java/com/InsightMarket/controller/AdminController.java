package com.InsightMarket.controller;

import com.InsightMarket.dto.member.*;
import com.InsightMarket.service.member.MemberService;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Log4j2
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin")
@PreAuthorize("hasAnyRole('ADMIN','COMPANY_ADMIN')")
public class AdminController {

    private final MemberService memberService;
    
    //가입 승인 대기 목록
    @GetMapping("/approvals")
    public List<MemberResponseDTO> pending(
            @AuthenticationPrincipal MemberDTO memberDTO
    ) {
        return memberService.getPendingMembers(memberDTO);
    }

    //가입 승인 처리
    @PostMapping("/approvals/{memberId}")
    public void approve(
            @PathVariable Long memberId,
            @AuthenticationPrincipal MemberDTO memberDTO
    ) {
        log.info("Approve memberId={}", memberId);
        memberService.approve(memberId, memberDTO);
    }

    // 회사 멤버 목록/검색
    @GetMapping("/members")
    public List<AdminMemberResponseDTO> members(
            @AuthenticationPrincipal MemberDTO memberDTO,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Boolean expired,
            @RequestParam(required = false) String role
    ) {
        return memberService.getCompanyMembers(memberDTO, keyword, expired, role);
    }

    // role 변경
    @PutMapping("/members/{memberId}/role")
    public void changeRole(
            @PathVariable Long memberId,
            @RequestBody ChangeRoleRequestDTO request,
            @AuthenticationPrincipal MemberDTO memberDTO
    ) {
        memberService.changeSystemRole(memberDTO, memberId, request.getRole());
    }

    // 탈퇴(isExpired)만 변경
    @PutMapping("/members/{memberId}/expire")
    public void expire(
            @PathVariable Long memberId,
            @RequestBody ExpireMemberRequestDTO request,
            @AuthenticationPrincipal MemberDTO memberDTO
    ) {
        log.info("Expire request isExpired={}", request.isExpired());
        memberService.changeExpired(memberDTO, memberId, request.isExpired());
    }
}
