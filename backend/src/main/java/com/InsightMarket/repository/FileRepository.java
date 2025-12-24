package com.InsightMarket.repository;

import com.InsightMarket.domain.files.FileTargetType;
import com.InsightMarket.domain.files.UploadedFile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

// [파일 Repository] 통합 테이블: (targetType, targetId)
public interface FileRepository extends JpaRepository<UploadedFile, Long> {

    List<UploadedFile> findByTargetTypeAndTargetIdAndDeletedAtIsNull(FileTargetType targetType, Long targetId);

    List<UploadedFile> findByTargetTypeAndTargetIdInAndDeletedAtIsNull(FileTargetType targetType, List<Long> targetIds);

    List<UploadedFile> findByIdInAndDeletedAtIsNull(List<Long> ids);

    Optional<UploadedFile> findByIdAndDeletedAtIsNull(Long fileId);

}