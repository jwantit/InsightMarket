package com.InsightMarket.controller;

import com.InsightMarket.domain.files.UploadedFile;
import com.InsightMarket.service.FileService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@RestController
@RequiredArgsConstructor
@Slf4j
@RequestMapping("/api/files")
public class FileController {

    private final FileService fileService;

    @GetMapping("/{fileId}")
    public ResponseEntity<byte[]> downloadFile(@PathVariable Long fileId) {
        try {
            UploadedFile file = fileService.getFileInfo(fileId);
            byte[] fileData = fileService.downloadFile(fileId);

            // 파일명 인코딩 (한글 등 특수문자 처리)
            String encodedFileName = URLEncoder.encode(file.getFileName(), StandardCharsets.UTF_8)
                    .replaceAll("\\+", "%20");

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType(file.getContentType()));
            headers.setContentDispositionFormData("attachment", encodedFileName);
            headers.setContentLength(fileData.length);

            return new ResponseEntity<>(fileData, headers, HttpStatus.OK);
        } catch (Exception e) {
            log.error("File download failed: fileId={}", fileId, e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @GetMapping("/{fileId}/thumbnail")
    public ResponseEntity<byte[]> downloadThumbnail(@PathVariable Long fileId) {
        try {
            UploadedFile file = fileService.getFileInfo(fileId);
            byte[] thumbnailData = fileService.downloadThumbnail(fileId);

            // 원본 파일의 확장자에 맞는 ContentType 설정
            String contentType = file.getContentType();
            MediaType mediaType = MediaType.IMAGE_JPEG; // 기본값
            
            if (contentType != null) {
                if (contentType.equals("image/png")) {
                    mediaType = MediaType.IMAGE_PNG;
                } else if (contentType.equals("image/gif")) {
                    mediaType = MediaType.IMAGE_GIF;
                } else if (contentType.equals("image/bmp")) {
                    mediaType = MediaType.parseMediaType("image/bmp");
                } else if (contentType.startsWith("image/jpeg") || contentType.startsWith("image/jpg")) {
                    mediaType = MediaType.IMAGE_JPEG;
                } else {
                    // 확장자로 판단
                    String fileName = file.getFileName().toLowerCase();
                    if (fileName.endsWith(".png")) {
                        mediaType = MediaType.IMAGE_PNG;
                    } else if (fileName.endsWith(".gif")) {
                        mediaType = MediaType.IMAGE_GIF;
                    } else if (fileName.endsWith(".bmp")) {
                        mediaType = MediaType.parseMediaType("image/bmp");
                    }
                }
            }

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(mediaType);
            headers.setContentLength(thumbnailData.length);
            headers.setCacheControl("public, max-age=31536000"); // 1년 캐시

            return new ResponseEntity<>(thumbnailData, headers, HttpStatus.OK);
        } catch (Exception e) {
            log.error("Thumbnail download failed: fileId={}", fileId, e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }
}
