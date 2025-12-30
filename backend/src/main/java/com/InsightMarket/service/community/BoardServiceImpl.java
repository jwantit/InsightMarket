package com.InsightMarket.service.community;

import com.InsightMarket.common.exception.ApiException;
import com.InsightMarket.common.exception.ErrorCode;
import com.InsightMarket.domain.brand.Brand;
import com.InsightMarket.domain.community.Board;
import com.InsightMarket.domain.files.FileTargetType;
import com.InsightMarket.domain.member.Member;
import com.InsightMarket.dto.PageRequestDTO;
import com.InsightMarket.dto.PageResponseDTO;
import com.InsightMarket.dto.community.BoardResponseDTO;
import com.InsightMarket.dto.community.BoardModifyDTO;
import com.InsightMarket.dto.community.FileResponseDTO;
import com.InsightMarket.repository.brand.BrandRepository;
import com.InsightMarket.repository.community.BoardRepository;
import com.InsightMarket.repository.community.CommentRepository;
import com.InsightMarket.repository.member.MemberRepository;
import com.InsightMarket.service.FileService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

// [게시글 서비스] CRUD + 파일 한번에 업로드/교체 + 로그
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class BoardServiceImpl implements BoardService {

    private final BoardRepository boardRepository;
    private final FileService fileService;
    private final BrandRepository brandRepository;
    private final MemberRepository memberRepository;
    private final CommentRepository commentRepository;

    // [기능] 게시글 생성 1단계 (Brand/User repository 없이)
    // [원칙] FK는 존재한다고 가정하고 ID만 연결
    @Override
    @Transactional
    public BoardResponseDTO create(Long brandId, BoardModifyDTO data, List<MultipartFile> files, Member currentMember) {

        Long writerId = currentMember.getId();

        log.info("[BOARD][SVC][CREATE] brandId={}, writerId={}, title={}",
                brandId, writerId, data.getTitle());

        // Brand와 Member 실제 조회
        Brand brand = brandRepository.findById(brandId)
                .orElseThrow(() -> new ApiException(ErrorCode.BRAND_NOT_FOUND));
        Member writer = memberRepository.findById(writerId)
                .orElseThrow(() -> new ApiException(ErrorCode.MEMBER_NOT_FOUND));

        Board board = Board.builder()
                .brand(brand)
                .writer(writer)
                .title(data.getTitle())
                .content(data.getContent())
                .build();

        // 1) Board 저장
        Board saved = boardRepository.save(board);

        // 2) 파일 저장
        List<FileResponseDTO> savedFiles = fileService.saveFiles(
                FileTargetType.BOARD,
                saved.getId(),
                writerId,          // 테스트용 1L이면 그대로
                files
        );

        log.info("[BOARD][SVC][CREATE] savedFiles={}", savedFiles.size());

        return toDTO(saved, brandId, savedFiles, 0L);
    }

    @Override
    @Transactional
    public BoardResponseDTO update(
            Long brandId,
            Long boardId,
            BoardModifyDTO dto,
            List<MultipartFile> newFiles,
            Member currentMember
    ) {

        Long updaterId = currentMember.getId();

        Board board = boardRepository.findByIdAndBrandIdAndDeletedAtIsNull(boardId, brandId)
                .orElseThrow();

        // 0️⃣ 본인 확인 (작성자만 수정 가능)
        if (!board.getWriter().getId().equals(updaterId)) {
            throw new ApiException(ErrorCode.ACCESS_DENIED);
        }

        // 1️⃣ 게시글 수정
        board.changeTitle(dto.getTitle());
        board.changeContent(dto.getContent());

        // 2️⃣ 기존 파일 정리
        fileService.cleanupFiles(FileTargetType.BOARD, boardId, dto.getKeepFileIds());

        // 3️⃣ 새 파일 추가
        fileService.saveFiles(FileTargetType.BOARD, boardId, updaterId, newFiles);

        // 4️⃣ 현재 파일 목록 재조회 (응답용)
        List<FileResponseDTO> currentFiles = fileService.getFiles(FileTargetType.BOARD, boardId);

        return toDTO(board, brandId, currentFiles, 0L);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponseDTO<BoardResponseDTO> list(Long brandId, PageRequestDTO pageRequestDTO) {

        log.info("[BOARD][SVC][LIST] brandId={}, page={}, size={}",
                brandId, pageRequestDTO.getPage(), pageRequestDTO.getSize());

        // page는 1부터 시작 → Pageable은 0부터
        Pageable pageable = PageRequest.of(
                pageRequestDTO.getPage() - 1,
                pageRequestDTO.getSize(),
                Sort.by("id").descending()
        );

        Page<Board> result = boardRepository.findByBrandIdAndDeletedAtIsNull(brandId, pageable);

        List<Board> boards = result.getContent();

        // 게시글 ID 수집
        List<Long> boardIds = boards.stream()
                .map(Board::getId)
                .toList();

        // 파일 IN 조회
        Map<Long, List<FileResponseDTO>> fileMap = fileService.getFilesGrouped(FileTargetType.BOARD, boardIds);

        // 댓글 수 조회 (부모 댓글 + 대댓글 모두 포함)
        Map<Long, Long> commentCountMap = new java.util.HashMap<>();
        for (Long boardId : boardIds) {
            long count = commentRepository.countByBoardIdAndDeletedAtIsNull(boardId);
            commentCountMap.put(boardId, count);
        }

        // DTO 변환
        List<BoardResponseDTO> dtoList = boards.stream()
                .map(board -> toDTO(
                        board,
                        brandId,
                        fileMap.getOrDefault(board.getId(), List.of()),
                        commentCountMap.getOrDefault(board.getId(), 0L)
                ))
                .toList();

        // ✅ 공용 PageResponseDTO 사용
        return PageResponseDTO.<BoardResponseDTO>withAll()
                .dtoList(dtoList)
                .pageRequestDTO(pageRequestDTO)
                .totalCount(result.getTotalElements())
                .build();
    }

    @Override
    // [기능] 게시글 상세 조회 1단계: 게시글 + (첨부파일 목록) 조회 후 DTO 반환
// [디버깅] brandId/boardId/첨부 개수 로그
    @Transactional(readOnly = true)
    public BoardResponseDTO detail(Long brandId, Long boardId) {

        log.info("[BOARD][SVC][DETAIL] brandId={}, boardId={}", brandId, boardId);

        Board board = boardRepository.findByIdAndBrandIdAndDeletedAtIsNull(boardId, brandId)
                .orElseThrow(() -> new ApiException(ErrorCode.BOARD_NOT_FOUND));

        List<FileResponseDTO> fileDtos = fileService.getFiles(FileTargetType.BOARD, boardId);
        log.info("[BOARD][SVC][DETAIL] attachments={}", fileDtos.size());

        return toDTO(board, brandId, fileDtos, 0L);
    }

    @Override
    @Transactional
    public void delete(Long brandId, Long boardId, Member currentMember) {

        Board board = boardRepository.findByIdAndBrandIdAndDeletedAtIsNull(boardId, brandId)
                .orElseThrow(() -> new ApiException(ErrorCode.BOARD_NOT_FOUND));

        // 본인 확인 (작성자만 삭제 가능)
        if (!board.getWriter().getId().equals(currentMember.getId())) {
            throw new ApiException(ErrorCode.ACCESS_DENIED);
        }

        // [기능] 게시글 soft delete
        board.softDelete();
        log.info("[BOARD][SVC][DELETE] boardId={}, brandId={}", boardId, brandId);

        // [기능] 게시글 첨부파일 연쇄 soft delete
        fileService.cleanupFiles(
                FileTargetType.BOARD,
                boardId,
                List.of() // 빈 리스트 → 전부 삭제
        );
        log.info("[BOARD][SVC][DELETE] cascade files targetId={}", boardId);
    }

    // [기능] Board -> BoardResponseDTO 변환 규칙 단일화 (writerName 항상 포함)
    private BoardResponseDTO toDTO(Board board, Long brandId, List<FileResponseDTO> files, Long commentCount) {
        return BoardResponseDTO.builder()
                .id(board.getId())
                .brandId(brandId)
                .writerId(board.getWriter().getId())
                .writerName(board.getWriter().getName())
                .title(board.getTitle())
                .content(board.getContent())
                .deleted(board.getDeletedAt() != null)
                .createdAt(board.getCreatedAt())
                .updatedAt(board.getUpdatedAt())
                .files(files)
                .commentCount(commentCount)
                .build();
    }
}

