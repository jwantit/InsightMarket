package com.InsightMarket.service;

import com.InsightMarket.domain.files.FileTargetType;
import com.InsightMarket.domain.files.UploadedFile;
import com.InsightMarket.domain.member.Member;
import com.InsightMarket.dto.community.FileResponseDTO;
import com.InsightMarket.repository.FileRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class FileService {

    private final FileRepository fileRepository;

    @PersistenceContext
    private EntityManager entityManager;

    private static final String BASE_DIR = "uploads";

    public List<FileResponseDTO> saveFiles(
            FileTargetType targetType,
            Long targetId,
            Long uploaderId,
            List<MultipartFile> files
    ) {

        if (files == null || files.isEmpty()) {
            return List.of();
        }

        // 🔹 여기서 User 프록시 생성
        Member uploaderRef = entityManager.getReference(Member.class, uploaderId);

        List<FileResponseDTO> result = new ArrayList<>();

        for (MultipartFile file : files) {

            // 0) 비어있는 part 스킵
            if (file == null || file.isEmpty()) {
                log.debug("[FILE][SKIP] empty multipart part");
                continue;
            }

            // 1) 원본 파일명 null/blank 방어
            String originalName = Optional.ofNullable(file.getOriginalFilename())
                    .filter(s -> !s.isBlank())
                    .orElse("unknown");

            // 2) contentType null/blank 방어 (DB not-null 500 방지)
            String contentType = Optional.ofNullable(file.getContentType())
                    .filter(s -> !s.isBlank())
                    .orElse("application/octet-stream"); // 기본값

            String storageKey = generateStorageKey(targetType, targetId, file);

            // 1️⃣ 로컬 저장
            saveToLocal(storageKey, file);

            // 2️⃣ 엔티티 저장
            UploadedFile saved = fileRepository.save(
                    UploadedFile.builder()
                            .targetType(targetType)
                            .targetId(targetId)
                            .uploadedBy(uploaderRef)
                            .fileName(originalName)
                            .storageKey(storageKey)
                            .contentType(contentType)
                            .size(file.getSize())
                            .build()
            );

            // 3️⃣ DTO 변환
            result.add(
                    FileResponseDTO.builder()
                            .id(saved.getId())
                            .originalName(saved.getFileName())
                            .contentType(saved.getContentType())
                            .size(saved.getSize())
                            .build()
            );
        }
        if (result.isEmpty()) {
            log.info("[FILE][UPLOAD] no valid files. targetType={}, targetId={}", targetType, targetId);
        }

        return result;
    }

    // ----------------- 내부 메서드 -----------------

    private void saveToLocal(String storageKey, MultipartFile file) {
        try {
            Path path = Paths.get(BASE_DIR, storageKey);
            Files.createDirectories(path.getParent());
            Files.copy(file.getInputStream(), path, StandardCopyOption.REPLACE_EXISTING);

            log.info("[FILE][UPLOAD] {}", path.toAbsolutePath());
        } catch (Exception e) {
            throw new RuntimeException("File save failed", e);
        }
    }

    private String generateStorageKey(FileTargetType targetType, Long targetId, MultipartFile file) {
        String ext = Optional.ofNullable(file.getOriginalFilename())
                .filter(n -> n.contains("."))
                .map(n -> n.substring(n.lastIndexOf(".")))
                .orElse("");

        return targetType.name() + "/" + targetId + "/" + UUID.randomUUID() + ext;
    }

    @Transactional
    public void cleanupFiles(
            FileTargetType targetType,
            Long targetId,
            List<Long> keepFileIds
    ) {

        // null → 아무것도 안 함
        if (keepFileIds == null) {
            return;
        }

        List<UploadedFile> existingFiles =
                fileRepository.findByTargetTypeAndTargetIdAndDeletedAtIsNull(
                        targetType, targetId);

        for (UploadedFile file : existingFiles) {

            // keep 목록에 없으면 soft delete
            if (!keepFileIds.contains(file.getId())) {
                file.softDelete(); // deletedAt 설정
                log.info("[FILE][SOFT_DELETE] fileId={}", file.getId());
            }
        }
    }

    @Transactional(readOnly = true)
    public List<FileResponseDTO> getFiles(FileTargetType targetType, Long targetId) {

        return fileRepository
                .findByTargetTypeAndTargetIdAndDeletedAtIsNull(targetType, targetId)
                .stream()
                .map(f -> FileResponseDTO.builder()
                        .id(f.getId())
                        .originalName(f.getFileName())
                        .contentType(f.getContentType())
                        .size(f.getSize())
                        .build()
                )
                .toList();
    }

    // [기능] 여러 targetId의 파일을 한 번에 조회해서 targetId별로 그룹핑
    @Transactional(readOnly = true)
    public Map<Long, List<FileResponseDTO>> getFilesGrouped(FileTargetType targetType, List<Long> targetIds) {

        if (targetIds == null || targetIds.isEmpty()) {
            return Map.of();
        }

        List<UploadedFile> files =
                fileRepository.findByTargetTypeAndTargetIdInAndDeletedAtIsNull(targetType, targetIds);

        return files.stream()
                .collect(Collectors.groupingBy(
                        UploadedFile::getTargetId,
                        Collectors.mapping(this::toDTO, Collectors.toList())
                ));
    }

    private FileResponseDTO toDTO(UploadedFile f) {
        return FileResponseDTO.builder()
                .id(f.getId())
                .originalName(f.getFileName())
                .contentType(f.getContentType())
                .size(f.getSize())
                .build();
    }
}