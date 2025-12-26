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
}
