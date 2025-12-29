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

import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.*;
import java.util.List;
import java.util.stream.Collectors;
import javax.imageio.ImageIO;

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

            // 2️⃣ 이미지 파일인 경우 썸네일 생성
            String thumbnailStorageKey = null;
            if (isImageFile(contentType)) {
                try {
                    thumbnailStorageKey = generateThumbnail(storageKey, targetType, targetId);
                    log.info("[FILE][THUMBNAIL] created: {}", thumbnailStorageKey);
                } catch (Exception e) {
                    log.warn("[FILE][THUMBNAIL] failed to create thumbnail for {}", originalName, e);
                    // 썸네일 생성 실패해도 원본 파일은 저장됨
                }
            }

            // 3️⃣ 엔티티 저장
            UploadedFile saved = fileRepository.save(
                    UploadedFile.builder()
                            .targetType(targetType)
                            .targetId(targetId)
                            .uploadedBy(uploader)
                            .fileName(originalName)
                            .storageKey(storageKey)
                            .contentType(contentType)
                            .size(file.getSize())
                            .thumbnailStorageKey(thumbnailStorageKey)
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

    // 썸네일 스토리지 키 생성 (원본 파일명에 _s 추가, 확장자 유지)
    private String generateThumbnailStorageKey(String originalStorageKey) {
        int lastDotIndex = originalStorageKey.lastIndexOf(".");
        if (lastDotIndex > 0) {
            // 확장자 앞에 _s 추가하고 원본 확장자 유지
            String extension = originalStorageKey.substring(lastDotIndex);
            return originalStorageKey.substring(0, lastDotIndex) + "_s" + extension;
        } else {
            // 확장자가 없는 경우 끝에 _s.jpg 추가
            return originalStorageKey + "_s.jpg";
        }
    }

    // 이미지 파일인지 확인 (PDF 포함)
    private boolean isImageFile(String contentType) {
        if (contentType == null) return false;
        // PDF도 이미지 파일로 처리
        if (contentType.equals("application/pdf")) return true;
        return contentType.startsWith("image/");
    }

    // 썸네일 생성 (최대 300x300)
    private String generateThumbnail(String originalStorageKey, FileTargetType targetType, Long targetId) throws IOException {
        Path originalPath = Paths.get(BASE_DIR, originalStorageKey);
        if (!Files.exists(originalPath)) {
            throw new IOException("Original file not found: " + originalPath);
        }

        // 원본 이미지 읽기
        BufferedImage originalImage = ImageIO.read(originalPath.toFile());
        if (originalImage == null) {
            throw new IOException("Failed to read image: " + originalPath);
        }

        // 썸네일 크기 계산 (최대 300x300, 비율 유지)
        int maxSize = 300;
        int originalWidth = originalImage.getWidth();
        int originalHeight = originalImage.getHeight();
        
        int thumbnailWidth, thumbnailHeight;
        if (originalWidth > originalHeight) {
            thumbnailWidth = Math.min(maxSize, originalWidth);
            thumbnailHeight = (int) ((double) originalHeight * thumbnailWidth / originalWidth);
        } else {
            thumbnailHeight = Math.min(maxSize, originalHeight);
            thumbnailWidth = (int) ((double) originalWidth * thumbnailHeight / originalHeight);
        }

        // 원본 확장자 확인하여 투명도 지원 여부 결정
        String extension = extractExt(originalStorageKey).toLowerCase();
        boolean hasAlpha = originalImage.getColorModel().hasAlpha();
        int imageType = hasAlpha && extension.equals(".png") 
            ? BufferedImage.TYPE_INT_ARGB 
            : BufferedImage.TYPE_INT_RGB;

        // 썸네일 이미지 생성
        BufferedImage thumbnail = new BufferedImage(thumbnailWidth, thumbnailHeight, imageType);
        Graphics2D g2d = thumbnail.createGraphics();
        
        // 투명도가 있는 경우 배경을 투명하게 설정
        if (hasAlpha && extension.equals(".png")) {
            g2d.setComposite(AlphaComposite.Src);
            g2d.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BILINEAR);
            g2d.setRenderingHint(RenderingHints.KEY_RENDERING, RenderingHints.VALUE_RENDER_QUALITY);
            g2d.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        } else {
            // RGB 이미지의 경우 흰색 배경 설정
            g2d.setColor(Color.WHITE);
            g2d.fillRect(0, 0, thumbnailWidth, thumbnailHeight);
            g2d.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BILINEAR);
            g2d.setRenderingHint(RenderingHints.KEY_RENDERING, RenderingHints.VALUE_RENDER_QUALITY);
            g2d.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        }
        
        g2d.drawImage(originalImage, 0, 0, thumbnailWidth, thumbnailHeight, null);
        g2d.dispose();

        // 썸네일 저장 경로 생성 (원본 파일명에 _s 추가, 확장자 유지)
        String thumbnailStorageKey = generateThumbnailStorageKey(originalStorageKey);
        Path thumbnailPath = Paths.get(BASE_DIR, thumbnailStorageKey);
        Files.createDirectories(thumbnailPath.getParent());
        
        // 원본 확장자에 맞는 포맷으로 저장 (extension 변수는 이미 위에서 정의됨)
        String format = "jpg"; // 기본값
        if (extension.equals(".png")) {
            format = "png";
        } else if (extension.equals(".gif")) {
            format = "gif";
        } else if (extension.equals(".bmp")) {
            format = "bmp";
        } else if (extension.equals(".jpg") || extension.equals(".jpeg")) {
            format = "jpg";
        }
        
        // 썸네일 저장 (원본 확장자에 맞는 포맷으로)
        ImageIO.write(thumbnail, format, thumbnailPath.toFile());
        
        return thumbnailStorageKey;
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

    // 썸네일 다운로드
    @Transactional(readOnly = true)
    public byte[] downloadThumbnail(Long fileId) {
        UploadedFile file = fileRepository.findByIdAndDeletedAtIsNull(fileId)
                .orElseThrow(() -> new IllegalArgumentException("File not found: " + fileId));
        
        if (file.getThumbnailStorageKey() == null) {
            log.warn("[FILE][THUMBNAIL] Thumbnail storage key is null for fileId={}", fileId);
            throw new IllegalArgumentException("Thumbnail not available for file: " + fileId);
        }
        
        Path thumbnailPath = Paths.get(BASE_DIR, file.getThumbnailStorageKey());
        
        if (!Files.exists(thumbnailPath)) {
            log.error("[FILE][THUMBNAIL] Thumbnail file not found on disk: {} (fileId={}, storageKey={})", 
                    thumbnailPath, fileId, file.getThumbnailStorageKey());
            throw new RuntimeException("Thumbnail not found on disk: " + thumbnailPath);
        }
        
        try {
            byte[] data = Files.readAllBytes(thumbnailPath);
            log.debug("[FILE][THUMBNAIL] Successfully read thumbnail: {} (size: {} bytes)", thumbnailPath, data.length);
            return data;
        } catch (IOException e) {
            log.error("[FILE][THUMBNAIL] Failed to read thumbnail: {}", thumbnailPath, e);
            throw new RuntimeException("Failed to read thumbnail: " + thumbnailPath, e);
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
                .hasThumbnail(f.getThumbnailStorageKey() != null)
                .build();
    }
}