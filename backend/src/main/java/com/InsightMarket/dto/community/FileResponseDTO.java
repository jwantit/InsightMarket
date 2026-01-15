package com.InsightMarket.dto.community;

import lombok.Builder;
import lombok.Getter;

// [파일 응답 DTO] 게시글/댓글 공통 첨부 메타
@Getter
@Builder
public class FileResponseDTO {
    private Long id;
    private String originalName;
    private Long size;
    private String contentType;
    private Boolean hasThumbnail; // 썸네일 존재 여부
}

