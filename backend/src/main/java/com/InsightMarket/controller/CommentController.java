package com.InsightMarket.controller;

import com.InsightMarket.dto.community.CommentModifyDTO;
import com.InsightMarket.dto.community.CommentResponseDTO;
import com.InsightMarket.service.community.CommentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequiredArgsConstructor
@Slf4j
@RequestMapping("/api/brands/{brandId}/boards/{boardId}/comments")
public class CommentController {

    private final CommentService commentService;

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
            @RequestPart(value = "files", required = false) List<MultipartFile> files
    ) {
        log.info("[COMMENT][CREATE] brandId={}, boardId={}, parentId={}, files={}",
                brandId, boardId, data.getParentCommentId(), files == null ? 0 : files.size());

        return commentService.create(brandId, boardId, data, files);
    }

    // [기능] 댓글/대댓글 수정 (multipart)
    @PutMapping(value = "/{commentId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public CommentResponseDTO update(
            @PathVariable Long brandId,
            @PathVariable Long boardId,
            @PathVariable Long commentId,
            @RequestPart("data") CommentModifyDTO data,
            @RequestPart(value = "files", required = false) List<MultipartFile> files
    ) {
        log.info("[COMMENT][UPDATE] brandId={}, boardId={}, commentId={}, keepFileIds={}, newFiles={}",
                brandId, boardId, commentId,
                data.getKeepFileIds() == null ? "null" : data.getKeepFileIds().size(),
                files == null ? 0 : files.size());

        return commentService.update(brandId, boardId, commentId, data, files);
    }

    // [기능] 댓글/대댓글 삭제
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
