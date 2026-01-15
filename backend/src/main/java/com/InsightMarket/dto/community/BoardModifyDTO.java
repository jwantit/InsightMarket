package com.InsightMarket.dto.community;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

// [게시글 요청 DTO] 생성/수정 통합
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BoardModifyDTO {

    private String title;
    private String content;

    // update에서 파일 교체 기준 (유지할 파일 id)
    private List<Long> keepFileIds;
    
    // @PreAuthorize를 위한 작성자 ID (수정 시에만 사용, 프론트엔드에서 전송)
    private Long writerId;
}
