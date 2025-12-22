package com.InsightMarket.dto.community;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

// [게시글 응답 DTO]
@Getter
@Builder
public class BoardResponseDTO {

    private Long id;

    private Long writerId;
    private String writerName;

    private Long brandId;

    private String title;
    private String content;

    private boolean deleted;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    private List<FileResponseDTO> files;
}
