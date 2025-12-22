package com.InsightMarket.dto.community;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

// [댓글 요청 DTO] 생성/수정 통합
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommentUpsertRequestDTO {

    private String content;

    // create에서만 의미 (대댓글이면 값 존재)
    private Long parentId;

    // update에서 파일 교체 기준 (유지할 파일 id)
    private List<Long> keepFileIds;
}
