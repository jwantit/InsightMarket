package com.InsightMarket.service;

import com.InsightMarket.domain.files.FileTargetType;
import com.InsightMarket.domain.files.UploadedFile;
import com.InsightMarket.domain.member.Member;
import com.InsightMarket.dto.community.FileResponseDTO;
import com.InsightMarket.repository.FileRepository;
import com.InsightMarket.repository.member.MemberRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
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
    private final MemberRepository memberRepository;

    private static final String BASE_DIR = "uploads";

    public List<FileResponseDTO> saveFiles(
            FileTargetType targetType,
            Long targetId,
            Long uploaderId,
            List<MultipartFile> files
    ) {

        if (files == null || files.isEmpty()) {return List.of();}

        // Member 실제 조회
        Member uploader = memberRepository.findById(uploaderId)
                .orElseThrow(() -> new IllegalArgumentException("Member not found: " + uploaderId));
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

            String storageKey = generateStorageKey(targetType, targetId, originalName);

            // 1️⃣ 로컬 저장
            saveToLocal(storageKey, file);

            // 2️⃣ 엔티티 저장
            UploadedFile saved = fileRepository.save(
                    UploadedFile.builder()
                            .targetType(targetType)
                            .targetId(targetId)
                            .uploadedBy(uploader)
                            .fileName(originalName)
                            .storageKey(storageKey)
                            .contentType(contentType)
                            .size(file.getSize())
                            .build()
            );

            // 3️⃣ DTO 변환
            result.add(toDTO(saved));
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

    //  MultipartFile 대신 "정제된 파일명"을 받게 변경
    private String generateStorageKey(FileTargetType targetType, Long targetId, String originalName) {
        String ext = extractExt(originalName);
        return targetType.name() + "/" + targetId + "/" + UUID.randomUUID() + ext;
    }

    // 확장자 추출 규칙도 한 군데로 고정
    private String extractExt(String filename) {
        if (filename == null) return "";
        int idx = filename.lastIndexOf(".");
        if (idx < 0 || idx == filename.length() - 1) return "";
        return filename.substring(idx);
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
                .map(this::toDTO)
                .toList();
    }

    // [기능] 여러 targetId의 파일을 한 번에 조회해서 targetId별로 그룹핑
    @Transactional(readOnly = true)
    public Map<Long, List<FileResponseDTO>> getFilesGrouped(FileTargetType targetType, List<Long> targetIds) {

        if (targetIds == null || targetIds.isEmpty()) {
            log.debug("[FILE][GROUP] empty targetIds. targetType={}", targetType);
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

    // 파일 다운로드
    @Transactional(readOnly = true)
    public byte[] downloadFile(Long fileId) {
        UploadedFile file = fileRepository.findByIdAndDeletedAtIsNull(fileId)
                .orElseThrow(() -> new IllegalArgumentException("File not found: " + fileId));
        
        Path filePath = Paths.get(BASE_DIR, file.getStorageKey());
        
        if (!Files.exists(filePath)) {
            throw new RuntimeException("File not found on disk: " + filePath);
        }
        
        try {
            return Files.readAllBytes(filePath);
        } catch (IOException e) {
            throw new RuntimeException("Failed to read file: " + filePath, e);
        }
    }

    // 파일 정보 조회 (다운로드용)
    @Transactional(readOnly = true)
    public UploadedFile getFileInfo(Long fileId) {
        return fileRepository.findByIdAndDeletedAtIsNull(fileId)
                .orElseThrow(() -> new IllegalArgumentException("File not found: " + fileId));
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