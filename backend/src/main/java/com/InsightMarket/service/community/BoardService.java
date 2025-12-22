package com.InsightMarket.service.community;

import com.InsightMarket.domain.community.Board;
import com.InsightMarket.domain.files.FileTargetType;
import com.InsightMarket.domain.files.Files;
import com.InsightMarket.dto.community.BoardResponseDTO;
import com.InsightMarket.dto.community.BoardUpsertRequestDTO;
import com.InsightMarket.dto.community.FileResponseDTO;
import com.InsightMarket.repository.FileRepository;
import com.InsightMarket.repository.community.BoardRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

// [게시글 서비스] CRUD + 파일 한번에 업로드/교체 + 로그
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class BoardService {

    private final BoardRepository boardRepository;
    private final FileRepository fileRepository;

    // TODO: BrandRepository, UserContext(로그인 유저), FileStorageClient(실제 업로드) 주입

    public BoardResponseDTO create(Long brandId, BoardUpsertRequestDTO data, List<MultipartFile> files) {
        log.info("[BOARD][SVC][CREATE] brandId={}, title={}, files={}",
                brandId, data.getTitle(), files == null ? 0 : files.size());

        // TODO 1) brand 조회
        // TODO 2) writer(로그인 유저) 조회
        // TODO 3) board 저장
        // TODO 4) files 업로드 + Attachment 저장(targetType=BOARD, targetId=boardId)
        // TODO 5) BoardResponseDTO 조립(파일 포함)

        throw new UnsupportedOperationException("TODO");
    }

    public BoardResponseDTO update(Long brandId, Long boardId, BoardUpsertRequestDTO data, List<MultipartFile> files) {

        log.info("[BOARD][UPDATE] brandId={}, boardId={}, keepFileIds={}, newFiles={}",
                brandId, boardId,
                data.getKeepFileIds() == null ? "null" : data.getKeepFileIds().size(),
                files == null ? 0 : files.size());

        // 1) 게시글 조회 (브랜드 스코프 + 미삭제)
        Board board = boardRepository.findByIdAndBrandIdAndDeletedAtIsNull(boardId, brandId)
                .orElseThrow(() -> new IllegalArgumentException("Board not found"));

        // 2) 권한 체크 (작성자 본인)
        // TODO: 로그인 유저 id 가져와서 board.getWriter().getId()와 비교
        // 예) Long currentUserId = userContext.getCurrentUserId();
        // if (!board.getWriter().getId().equals(currentUserId)) throw new AccessDeniedException("No permission");

        // 3) 게시글 내용 수정
        // TODO: board.changeTitle(data.getTitle()); board.changeContent(data.getContent());
        // (엔티티에 change 메서드 없으면 setter 대신 명시적 메서드 추천)

        // 4) 기존 첨부 조회 (BOARD 타겟)
        List<Files> existing = fileRepository
                .findByTargetTypeAndTargetIdAndDeletedAtIsNull(FileTargetType.BOARD, boardId);

        int existingCount = existing.size();
        List<Long> keepFileIds = data.getKeepFileIds();

        // 5) keepFileIds 규칙 적용
        if (keepFileIds == null) {
            // 파일 유지(삭제 없음) + 새 파일 들어오면 "추가만" (추가는 다음 단계에서)
            log.info("[BOARD][UPDATE][FILES] keepFileIds=null => keep all existing. existing={}", existingCount);

        } else {
            // keepFileIds가 빈 리스트면 전부 삭제, 값 있으면 해당 id만 유지
            Set<Long> keepSet = new HashSet<>(keepFileIds);

            int deleteCount = 0;
            int keepCount = 0;

            for (Files att : existing) {
                if (keepSet.contains(att.getId())) {
                    keepCount++;
                    continue;
                }
                att.softDelete();   // SoftDeleteEntity의 deletedAt 설정
                deleteCount++;
            }

            log.info("[BOARD][UPDATE][FILES] existing={}, keepIds={}, keep={}, delete={}",
                    existingCount, keepFileIds.size(), keepCount, deleteCount);
        }

        // 6) (다음 단계) 새 files 업로드 + Attachment 추가
        // TODO

        // 7) (다음 단계) BoardResponseDTO 조립(첨부 포함) 후 반환
        throw new UnsupportedOperationException("TODO: 다음 단계에서 DTO 조립까지 완료");
    }

    @Transactional(readOnly = true)
    public List<BoardResponseDTO> list(Long brandId, Long lastId, int size) {
        log.info("[BOARD][SVC][LIST] brandId={}, lastId={}, size={}", brandId, lastId, size);

        // TODO 1) board 목록 조회(first/next)
        // TODO 2) boardIds 추출
        // TODO 3) attachments IN 조회(targetType=BOARD, targetId in boardIds)
        // TODO 4) Map<boardId, files>로 묶기
        // TODO 5) DTO 리스트 조립

        throw new UnsupportedOperationException("TODO");
    }

    // [기능] 게시글 상세 조회 1단계: 게시글 + (첨부파일 목록) 조회 후 DTO 반환
// [디버깅] brandId/boardId/첨부 개수 로그
    @Transactional(readOnly = true)
    public BoardResponseDTO detail(Long brandId, Long boardId) {

        log.info("[BOARD][SVC][DETAIL] brandId={}, boardId={}", brandId, boardId);

        Board board = boardRepository.findByIdAndBrandIdAndDeletedAtIsNull(boardId, brandId)
                .orElseThrow(() -> new IllegalArgumentException("Board not found"));

        List<Files> files = fileRepository
                .findByTargetTypeAndTargetIdAndDeletedAtIsNull(FileTargetType.BOARD, boardId);

        log.info("[BOARD][SVC][DETAIL] attachments={}", files.size());

        return BoardResponseDTO.builder()
                .id(board.getId())
                .brandId(board.getBrand().getId())
                .writerId(board.getWriter().getId())
                .writerName(board.getWriter().getName())
                .title(board.getTitle())
                .content(board.getContent())
                .deleted(board.getDeletedAt() != null)
                .createdAt(board.getCreatedAt())
                .updatedAt(board.getUpdatedAt())
                .files(files.stream().map(f -> FileResponseDTO.builder()
                        .id(f.getId())
                        .originalName(f.getFileName())
                        .size(f.getSize())
                        .contentType(f.getContentType())
                        .build()
                ).toList())
                .build();
    }

    public void delete(Long brandId, Long boardId) {
        log.info("[BOARD][SVC][DELETE] brandId={}, boardId={}", brandId, boardId);

        // TODO 1) board 조회 + 권한 체크
        // TODO 2) board.softDelete()
        // TODO 3) (옵션) attachments도 soft delete 할지 정책 결정

        throw new UnsupportedOperationException("TODO");
    }
}

