package com.InsightMarket.service;

import com.InsightMarket.repository.FileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

// [파일 서비스] 단일 프록시 다운로드
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class FileService {

    private final FileRepository fileRepository;
    // TODO: FileStorageClient (S3/MinIO/Local)

    public ResponseEntity<Resource> download(Long fileId) {
        log.info("[FILE][SVC][DOWNLOAD] fileId={}", fileId);

        // TODO 1) attachment 조회(deletedAt null)
        // TODO 2) 권한 체크(타겟이 BOARD/COMMENT면 조회 가능 범위)
        // TODO 3) storageKey로 파일 로드
        // TODO 4) contentType/filename 헤더 설정 후 반환

        throw new UnsupportedOperationException("TODO");
    }
}
