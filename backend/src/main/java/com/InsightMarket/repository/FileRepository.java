package com.InsightMarket.repository;

import com.InsightMarket.domain.files.FileTargetType;
import com.InsightMarket.domain.files.Files;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

// [파일 Repository] 통합 테이블: (targetType, targetId)
public interface FileRepository extends JpaRepository<Files, Long> {

    List<Files> findByTargetTypeAndTargetIdAndDeletedAtIsNull(FileTargetType targetType, Long targetId);

    List<Files> findByTargetTypeAndTargetIdInAndDeletedAtIsNull(FileTargetType targetType, List<Long> targetIds);

    List<Files> findByIdInAndDeletedAtIsNull(List<Long> ids);

    Optional<Files> findByIdAndDeletedAtIsNull(Long fileId);
}