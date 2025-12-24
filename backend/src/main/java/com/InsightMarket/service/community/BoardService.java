package com.InsightMarket.service.community;

import com.InsightMarket.domain.brand.Brand;
import com.InsightMarket.domain.community.Board;
import com.InsightMarket.domain.files.FileTargetType;
import com.InsightMarket.domain.files.UploadedFile;
import com.InsightMarket.domain.member.Member;
import com.InsightMarket.dto.PageRequestDTO;
import com.InsightMarket.dto.PageResponseDTO;
import com.InsightMarket.dto.community.BoardResponseDTO;
import com.InsightMarket.dto.community.BoardModifyDTO;
import com.InsightMarket.dto.community.FileResponseDTO;
import com.InsightMarket.repository.FileRepository;
import com.InsightMarket.repository.community.BoardRepository;
import com.InsightMarket.service.FileService;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

// [게시글 서비스] CRUD + 파일 한번에 업로드/교체 + 로그
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class BoardService {

    private final BoardRepository boardRepository;
    private final FileRepository fileRepository;
    private final FileService fileService;

    @PersistenceContext
    private EntityManager entityManager; //JPA 표준 방식

    // TODO: BrandRepository, UserContext(로그인 유저), FileStorageClient(실제 업로드) 주입

    // [기능] 게시글 생성 1단계 (Brand/User repository 없이)
    // [원칙] FK는 존재한다고 가정하고 ID만 연결
    @Transactional
    public BoardResponseDTO create(Long brandId, BoardModifyDTO data, List<MultipartFile> files) {

        // 개발 중 임시 writerId
        Long writerId = 1L;

        log.info("[BOARD][SVC][CREATE] brandId={}, writerId={}, title={}",
                brandId, writerId, data.getTitle());

        // 🔑 핵심: 실제 조회 없이 FK 프록시만 생성
        Brand brandRef = entityManager.getReference(Brand.class, brandId);
        Member writerRef = entityManager.getReference(Member.class, writerId);

        Board board = Board.builder()
                .brand(brandRef)
                .writer(writerRef)
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

        return BoardResponseDTO.builder()
                .id(saved.getId())
                .brandId(brandId)
                .writerId(writerId)
                .title(saved.getTitle())
                .content(saved.getContent())
                .files(savedFiles)
                .createdAt(saved.getCreatedAt())
                .updatedAt(saved.getUpdatedAt())
                .build();
    }

    @Transactional
    public BoardResponseDTO update(
            Long brandId,
            Long boardId,
            BoardModifyDTO dto,
            List<MultipartFile> newFiles
    ) {

        Long updaterId = 1L; // 테스트용

        Board board = boardRepository.findByIdAndBrandIdAndDeletedAtIsNull(boardId, brandId)
                .orElseThrow();

        // 1️⃣ 게시글 수정
        board.changeTitle(dto.getTitle());
        board.changeContent(dto.getContent());

        // 2️⃣ 기존 파일 정리
        fileService.cleanupFiles(
                FileTargetType.BOARD,
                boardId,
                dto.getKeepFileIds()
        );

        // 3️⃣ 새 파일 추가
        List<FileResponseDTO> files =
                fileService.saveFiles(
                        FileTargetType.BOARD,
                        boardId,
                        updaterId,
                        newFiles
                );

        // 4️⃣ 현재 파일 목록 재조회 (응답용)
        List<FileResponseDTO> currentFiles =
                fileService.getFiles(FileTargetType.BOARD, boardId);

        return BoardResponseDTO.builder()
                .id(board.getId())
                .brandId(brandId)
                .writerId(board.getWriter().getId())
                .title(board.getTitle())
                .content(board.getContent())
                .files(currentFiles)
                .createdAt(board.getCreatedAt())
                .updatedAt(board.getUpdatedAt())
                .build();
    }

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

        Page<Board> result =
                boardRepository.findByBrandIdAndDeletedAtIsNull(brandId, pageable);

        List<Board> boards = result.getContent();

        // 게시글 ID 수집
        List<Long> boardIds = boards.stream()
                .map(Board::getId)
                .toList();

        // 파일 IN 조회
        Map<Long, List<FileResponseDTO>> fileMap =
                fileRepository
                        .findByTargetTypeAndTargetIdInAndDeletedAtIsNull(
                                FileTargetType.BOARD, boardIds)
                        .stream()
                        .collect(Collectors.groupingBy(
                                UploadedFile::getTargetId,
                                Collectors.mapping(f ->
                                                FileResponseDTO.builder()
                                                        .id(f.getId())
                                                        .originalName(f.getFileName())
                                                        .size(f.getSize())
                                                        .contentType(f.getContentType())
                                                        .build(),
                                        Collectors.toList()
                                )
                        ));

        // DTO 변환
        List<BoardResponseDTO> dtoList = boards.stream()
                .map(b -> BoardResponseDTO.builder()
                        .id(b.getId())
                        .brandId(brandId)
                        .writerId(b.getWriter().getId())
                        .title(b.getTitle())
                        .content(b.getContent())
                        .files(fileMap.getOrDefault(b.getId(), List.of()))
                        .createdAt(b.getCreatedAt())
                        .updatedAt(b.getUpdatedAt())
                        .build()
                )
                .toList();

        // ✅ 공용 PageResponseDTO 사용
        return PageResponseDTO.<BoardResponseDTO>withAll()
                .dtoList(dtoList)
                .pageRequestDTO(pageRequestDTO)
                .totalCount(result.getTotalElements())
                .build();
    }

    // [기능] 게시글 상세 조회 1단계: 게시글 + (첨부파일 목록) 조회 후 DTO 반환
// [디버깅] brandId/boardId/첨부 개수 로그
    @Transactional(readOnly = true)
    public BoardResponseDTO detail(Long brandId, Long boardId) {

        log.info("[BOARD][SVC][DETAIL] brandId={}, boardId={}", brandId, boardId);

        Board board = boardRepository.findByIdAndBrandIdAndDeletedAtIsNull(boardId, brandId)
                .orElseThrow(() -> new IllegalArgumentException("Board not found"));

        List<UploadedFile> files = fileRepository
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

    @Transactional
    public void delete(Long brandId, Long boardId) {

        Board board = boardRepository.findByIdAndBrandIdAndDeletedAtIsNull(boardId, brandId)
                .orElseThrow();

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
}

