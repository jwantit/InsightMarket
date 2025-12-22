package com.InsightMarket.service.community;


import com.InsightMarket.dto.community.CommentResponseDTO;
import com.InsightMarket.dto.community.CommentUpsertRequestDTO;
import com.InsightMarket.repository.FileRepository;
import com.InsightMarket.repository.community.BoardRepository;
import com.InsightMarket.repository.community.CommentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

// [댓글 서비스] 댓글/대댓글 + 트리 조회 + 파일 한번에 업로드/교체 + 로그
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class CommentService {

    private final CommentRepository commentRepository;
    private final BoardRepository boardRepository;
    private final FileRepository fileRepository;

    // TODO: UserContext, FileStorageClient

    public CommentResponseDTO create(Long brandId, Long boardId, CommentUpsertRequestDTO data, List<MultipartFile> files) {
        log.info("[COMMENT][SVC][CREATE] brandId={}, boardId={}, parentId={}, files={}",
                brandId, boardId, data.getParentId(), files == null ? 0 : files.size());

        // TODO 1) board 조회(brand 스코프)
        // TODO 2) writer 조회
        // TODO 3) parentId 있으면 parent 조회 + 2단 제한 검사
        // TODO 4) comment 저장
        // TODO 5) files 업로드 + Attachment 저장(targetType=COMMENT, targetId=commentId)
        // TODO 6) 생성 응답은 "부모댓글 1개 형태"로 내려줄지 정책(보통 단건 응답)

        throw new UnsupportedOperationException("TODO");
    }

    public void update(Long brandId, Long boardId, Long commentId, CommentUpsertRequestDTO data, List<MultipartFile> files) {
        log.info("[COMMENT][SVC][UPDATE] brandId={}, boardId={}, commentId={}, keepFileIds={}, newFiles={}",
                brandId, boardId, commentId,
                data.getKeepFileIds() == null ? 0 : data.getKeepFileIds().size(),
                files == null ? 0 : files.size());

        // TODO 1) comment 조회(board 스코프)
        // TODO 2) 권한 체크(작성자 본인)
        // TODO 3) content 수정
        // TODO 4) 기존 Attachment 조회(targetType=COMMENT, targetId=commentId)
        // TODO 5) keepFileIds 기준 유지/삭제(soft delete)
        // TODO 6) 새 files 업로드 + Attachment 추가

        throw new UnsupportedOperationException("TODO");
    }

    @Transactional(readOnly = true)
    public List<CommentResponseDTO> listTree(Long brandId, Long boardId, String sort) {
        log.info("[COMMENT][SVC][LIST] brandId={}, boardId={}, sort={}", brandId, boardId, sort);

        // TODO 1) board 조회(brand 스코프)
        // TODO 2) 부모 댓글 조회(old/new)
        // TODO 3) 자식 댓글 조회(parentIds)
        // TODO 4) 댓글 ids 모아서 attachments IN 조회(targetType=COMMENT, targetId in commentIds)
        // TODO 5) (부모->자식) 그룹핑 + (댓글->파일) 그룹핑
        // TODO 6) DTO 트리 조립(삭제면 content 치환)

        throw new UnsupportedOperationException("TODO");
    }

    public void delete(Long brandId, Long boardId, Long commentId) {
        log.info("[COMMENT][SVC][DELETE] brandId={}, boardId={}, commentId={}", brandId, boardId, commentId);

        // TODO 1) comment 조회 + 권한 체크
        // TODO 2) comment.softDelete()
        // TODO 3) (옵션) attachments soft delete 정책

        throw new UnsupportedOperationException("TODO");
    }
}
