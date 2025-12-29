package com.InsightMarket.domain.files;

import com.InsightMarket.domain.common.SoftDeleteEntity;
import com.InsightMarket.domain.member.Member;
import jakarta.persistence.*;
import lombok.*;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@Entity
@Table(name = "files")
public class UploadedFile extends SoftDeleteEntity {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "file_id")
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "target_type", nullable = false, length = 20)
    private FileTargetType targetType;

    @Column(name = "target_id", nullable = false)
    private Long targetId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "uploaded_by", nullable = false)
    private Member uploadedBy;

    @Column(name = "file_name", nullable = false, length = 255)
    private String fileName;

    // 추가 추천(운영 필수급): fileUrl/path, contentType, size
//     @Column(name="file_url", nullable=false, length=1000)
//     private String fileUrl;

    // [기능] 스토리지 키(버킷/폴더/UUID 파일명 등)
    @Column(name = "storage_key", nullable = false, length = 500, unique = true)
    private String storageKey;

    // [기능] 첨부파일 메타데이터: 용량/타입 저장(다운로드 헤더, 검증, 배치 정리용)
    @Column(name = "content_type", nullable = false, length = 100)
    private String contentType;

    @Column(name = "file_size", nullable = false)
    private Long size;

    // 썸네일 스토리지 키 (이미지 파일인 경우에만 사용)
    @Column(name = "thumbnail_storage_key", length = 500)
    private String thumbnailStorageKey;
}
