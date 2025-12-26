package com.InsightMarket.controller;

import com.InsightMarket.domain.member.Member;
import com.InsightMarket.dto.community.CommentModifyDTO;
import com.InsightMarket.dto.community.CommentResponseDTO;
import com.InsightMarket.repository.member.MemberRepository;
import com.InsightMarket.security.util.JWTUtil;
import com.InsightMarket.service.community.CommentService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@Slf4j
@RequestMapping("/api/brands/{brandId}/boards/{boardId}/comments")
public class CommentController {

    private final CommentService commentService;
    private final MemberRepository memberRepository;

    // JWT 토큰에서 사용자 정보 가져오기
    private Member getCurrentMember(HttpServletRequest request) {
        String authHeaderStr = request.getHeader("Authorization");
        if (authHeaderStr == null || !authHeaderStr.startsWith("Bearer ")) {
            throw new IllegalStateException("인증 토큰이 없습니다.");
        }
        try {
            String accessToken = authHeaderStr.substring(7);
            Map<String, Object> claims = JWTUtil.validateToken(accessToken);
            String email = (String) claims.get("email");
            return memberRepository.findByEmail(email)
                    .orElseThrow(() -> new IllegalStateException("사용자를 찾을 수 없습니다: " + email));
        } catch (Exception e) {
            log.error("JWT 토큰 파싱 실패", e);
            throw new IllegalStateException("인증 토큰 처리 중 오류가 발생했습니다.", e);
        }
    }

    // [기능] 댓글 트리 조회
    @GetMapping
    public List<CommentResponseDTO> list(
            @PathVariable Long brandId,
            @PathVariable Long boardId
    ) {
        log.info("[COMMENT][LIST] brandId={}, boardId={}", brandId, boardId);
        return commentService.getCommentTree(brandId, boardId);
    }

    // [기능] 댓글/대댓글 생성 (multipart)
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public CommentResponseDTO create(
            @PathVariable Long brandId,
            @PathVariable Long boardId,
            @RequestPart("data") CommentModifyDTO data,
            @RequestPart(value = "files", required = false) List<MultipartFile> files,
            HttpServletRequest request
    ) {
        log.info("[COMMENT][CREATE] brandId={}, boardId={}, parentId={}, files={}",
                brandId, boardId, data.getParentCommentId(), files == null ? 0 : files.size());

        Member currentMember = getCurrentMember(request);
        return commentService.create(brandId, boardId, data, files, currentMember);
    }

    // [기능] 댓글/대댓글 수정 (multipart)
    @PreAuthorize("principal.username == #CommentModifyDTO.writer")
    @PutMapping(value = "/{commentId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public CommentResponseDTO update(
            @PathVariable Long brandId,
            @PathVariable Long boardId,
            @PathVariable Long commentId,
            @RequestPart("data") CommentModifyDTO data,
            @RequestPart(value = "files", required = false) List<MultipartFile> files,
            HttpServletRequest request
    ) {
        log.info("[COMMENT][UPDATE] brandId={}, boardId={}, commentId={}, keepFileIds={}, newFiles={}",
                brandId, boardId, commentId,
                data.getKeepFileIds() == null ? "null" : data.getKeepFileIds().size(),
                files == null ? 0 : files.size());

        Member currentMember = getCurrentMember(request);
        return commentService.update(brandId, boardId, commentId, data, files, currentMember);
    }

    // [기능] 댓글/대댓글 삭제
    @PreAuthorize("principal.username == #CommentModifyDTO.writer")
    @DeleteMapping("/{commentId}")
    public ResponseEntity<Void> delete(
            @PathVariable Long brandId,
            @PathVariable Long boardId,
            @PathVariable Long commentId
    ) {
        log.info("[COMMENT][DELETE] brandId={}, boardId={}, commentId={}", brandId, boardId, commentId);
        commentService.delete(brandId, boardId, commentId);
        return ResponseEntity.noContent().build();
    }
}
