package com.InsightMarket.dto.community;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

// [댓글 응답 DTO] 부모/대댓글 공용 (2단만 사용)
@Getter
@Builder
public class CommentResponseDTO {

    private Long commentId;
    private Long parentCommentId;        // 부모면 null

    private Long boardId;
    private Long writerId;
    private String writerName;

    private String content;       // 삭제면 "삭제된 댓글입니다"
    private boolean deleted;

    private LocalDateTime createdAt;

    private List<FileResponseDTO> files;

    // 부모 댓글에만 채움(대댓글은 빈 리스트)
    @Builder.Default
    private List<CommentResponseDTO> replies = new ArrayList<>();
}
