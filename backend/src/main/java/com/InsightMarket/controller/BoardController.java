package com.InsightMarket.controller;

import com.InsightMarket.domain.member.Member;
import com.InsightMarket.dto.PageRequestDTO;
import com.InsightMarket.dto.PageResponseDTO;
import com.InsightMarket.dto.community.BoardResponseDTO;
import com.InsightMarket.dto.community.BoardModifyDTO;
import com.InsightMarket.controller.util.ControllerUtil;
import com.InsightMarket.service.community.BoardService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

// [기능] 게시글 API 엔드포인트 정의 (브랜드별 게시판)
// [역할] 요청 파싱 + 로그 + 서비스 위임
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/brands/{brandId}/boards")
@Slf4j
public class BoardController {

    private final BoardService boardService;
    private final ControllerUtil controllerUtil;

    // 게시글 생성 (파일 한번에 업로드)
//     multipart:
//      - data  : BoardModifyDTO (JSON)
//      - files : List<MultipartFile> (optional)
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public BoardResponseDTO create(
            @PathVariable Long brandId,
            @RequestPart("data") BoardModifyDTO dto,
            @RequestPart(value = "files", required = false) List<MultipartFile> files,
            HttpServletRequest request
    ) {
        log.info("[BOARD][CREATE] brandId={}, title={}, files={}",
                brandId, dto.getTitle(), files == null ? 0 : files.size());

        Member currentMember = controllerUtil.getCurrentMember(request);
        return boardService.create(brandId, dto, files, currentMember);
    }

    //게시글 수정 (파일 교체 가능)
//    keepFileIds 규칙:
//     - null : 기존 파일 유지
//     - []   : 기존 파일 전부 삭제
//     - [id] : 해당 id만 유지
    // 이중 검증: @PreAuthorize (1차) + 서비스 레이어 (2차, 실제 DB 조회)
    @PreAuthorize("#dto.writerId == @memberRepository.findByEmail(principal.username).orElseThrow().getId()")
    @PutMapping(value = "/{boardId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public BoardResponseDTO update(
            @PathVariable Long brandId,
            @PathVariable Long boardId,
            @RequestPart("data") BoardModifyDTO dto,
            @RequestPart(value = "files", required = false) List<MultipartFile> files,
            HttpServletRequest request
    ) {
        log.info("[BOARD][UPDATE] brandId={}, boardId={}, keepFileIds={}, newFiles={}",
                brandId,
                boardId,
                dto.getKeepFileIds() == null ? "null" : dto.getKeepFileIds().size(),
                files == null ? 0 : files.size());

        Member currentMember = controllerUtil.getCurrentMember(request);
        return boardService.update(brandId, boardId, dto, files, currentMember);
    }

    // 게시글 목록 (최신순 고정, 커서 기반)
    @GetMapping
    public PageResponseDTO<BoardResponseDTO> list(
            @PathVariable Long brandId,
            PageRequestDTO pageRequestDTO
    ) {
        log.info("[BOARD][LIST] brandId={}, page={}, size={}",
                brandId, pageRequestDTO.getPage(), pageRequestDTO.getSize());

        return boardService.list(brandId, pageRequestDTO);
    }

    // 게시글 상세
    @GetMapping("/{boardId}")
    public BoardResponseDTO detail(
            @PathVariable Long brandId,
            @PathVariable Long boardId
    ) {
        log.info("[BOARD][DETAIL] brandId={}, boardId={}", brandId, boardId);

        return boardService.detail(brandId, boardId);
    }

    // 게시글 삭제 (soft delete + 첨부 연쇄 soft delete)
    @DeleteMapping("/{boardId}")
    public ResponseEntity<Void> delete(
            @PathVariable Long brandId,
            @PathVariable Long boardId,
            HttpServletRequest request
    ) {
        log.info("[BOARD][DELETE] brandId={}, boardId={}", brandId, boardId);

        Member currentMember = controllerUtil.getCurrentMember(request);
        boardService.delete(brandId, boardId, currentMember);
        return ResponseEntity.noContent().build();
    }
}
