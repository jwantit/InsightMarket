package com.InsightMarket.service.community;


import com.InsightMarket.common.exception.ApiException;
import com.InsightMarket.common.exception.ErrorCode;
import com.InsightMarket.domain.community.Board;
import com.InsightMarket.domain.community.Comment;
import com.InsightMarket.domain.files.FileTargetType;
import com.InsightMarket.domain.member.Member;
import com.InsightMarket.dto.community.CommentResponseDTO;
import com.InsightMarket.dto.community.CommentModifyDTO;
import com.InsightMarket.dto.community.FileResponseDTO;
import com.InsightMarket.repository.FileRepository;
import com.InsightMarket.repository.community.BoardRepository;
import com.InsightMarket.repository.community.CommentRepository;
import com.InsightMarket.repository.member.MemberRepository;
import com.InsightMarket.service.FileService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Stream;

// [댓글 서비스] 댓글/대댓글 + 트리 조회 + 파일 한번에 업로드/교체 + 로그
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class CommentServiceImpl implements CommentService {

    private final CommentRepository commentRepository;
    private final BoardRepository boardRepository;
    private final FileRepository fileRepository;
    private final FileService fileService;
    private final MemberRepository memberRepository;

    @Override
    @Transactional
    public CommentResponseDTO create(
            Long brandId,
            Long boardId,
            CommentModifyDTO data,
            List<MultipartFile> files,
            Member currentMember
    ) {
        log.info("[COMMENT][SVC][CREATE] brandId={}, boardId={}, parentId={}, files={}",
                brandId, boardId, data.getParentCommentId(), files == null ? 0 : files.size());

        Long writerId = currentMember.getId();

        // 1) board 조회(brand 스코프)
        Board board = boardRepository.findByIdAndBrandIdAndDeletedAtIsNull(boardId, brandId)
                .orElseThrow(() -> new ApiException(ErrorCode.BOARD_NOT_FOUND));

        // 2) writer 실제 조회
        Member writer = memberRepository.findById(writerId)
                .orElseThrow(() -> new ApiException(ErrorCode.MEMBER_NOT_FOUND));

        // 3) parentId 있으면 parent 조회 + 2단 제한 검사
        Comment parent = null;
        if (data.getParentCommentId() != null) {
            parent = commentRepository.findByIdAndDeletedAtIsNull(data.getParentCommentId())
                    .orElseThrow(() -> new ApiException(ErrorCode.COMMENT_NOT_FOUND));

            // 대댓글의 대댓글 금지
            if (parent.getParent() != null) {
                throw new ApiException(ErrorCode.INVALID_REQUEST);
            }

            // 다른 게시글의 댓글을 parent로 쓰는 것 방지
            if (!parent.getBoard().getId().equals(boardId)) {
                throw new ApiException(ErrorCode.INVALID_REQUEST);
            }
        }

        // 4) comment 저장
        Comment saved = commentRepository.save(
                Comment.builder()
                        .board(board)
                        .writer(writer)
                        .parent(parent)
                        .content(data.getContent())
                        .build()
        );

        log.info("[COMMENT][SVC][CREATE] savedCommentId={}", saved.getId());

        // 5) files 업로드 + 첨부 엔티티 저장(targetType=COMMENT, targetId=commentId)
        List<FileResponseDTO> savedFiles = fileService.saveFiles(
                FileTargetType.COMMENT,
                saved.getId(),
                writerId,
                files
        );

        log.info("[COMMENT][SVC][CREATE] savedFiles={}", savedFiles.size());

        // 6) 단건 응답 DTO (트리 아님)
        return CommentResponseDTO.builder()
                .commentId(saved.getId())
                .parentCommentId(parent != null ? parent.getId() : null)
                .boardId(boardId)
                .content(saved.getContent())
                .writerId(writer.getId())
                .writerName(currentMember.getName())
                .files(savedFiles)
                .createdAt(saved.getCreatedAt())
                .updatedAt(saved.getUpdatedAt())
                .replies(List.of())
                .build();
    }

    @Override
    @Transactional
    public CommentResponseDTO update(
            Long brandId,
            Long boardId,
            Long commentId,
            CommentModifyDTO data,
            List<MultipartFile> files,
            Member currentMember
    ) {
        log.info("[COMMENT][SVC][UPDATE] brandId={}, boardId={}, commentId={}, keepFileIds={}, newFiles={}",
                brandId, boardId, commentId,
                data.getKeepFileIds() == null ? "null" : data.getKeepFileIds().size(),
                files == null ? 0 : files.size());

        Long writerId = currentMember.getId();

        // 1) board 스코프 확인
        boardRepository.findByIdAndBrandIdAndDeletedAtIsNull(boardId, brandId)
                .orElseThrow(() -> new ApiException(ErrorCode.BOARD_NOT_FOUND));

        // 2) comment 조회
        Comment comment = commentRepository.findByIdAndDeletedAtIsNull(commentId)
                .orElseThrow(() -> new ApiException(ErrorCode.COMMENT_NOT_FOUND));

        // 3) 해당 board 소속인지 확인
        if (!comment.getBoard().getId().equals(boardId)) {
            throw new ApiException(ErrorCode.INVALID_REQUEST);
        }

        // 3-1) 본인 확인 (작성자만 수정 가능)
        if (!comment.getWriter().getId().equals(writerId)) {
            throw new ApiException(ErrorCode.ACCESS_DENIED);
        }

        // 4) content 수정
        comment.changeContent(data.getContent());

        // 5) keepFileIds 기준 파일 정리 (null=유지, []=전부삭제, [ids]=일부유지)
        fileService.cleanupFiles(FileTargetType.COMMENT, commentId, data.getKeepFileIds());

        // 6) 새 파일 저장
        fileService.saveFiles(FileTargetType.COMMENT, commentId, writerId, files);

        // 7) 최종 파일 다시 조회해서 응답 구성
        List<FileResponseDTO> currentFiles = fileService.getFiles(FileTargetType.COMMENT, commentId);

        return CommentResponseDTO.builder()
                .commentId(comment.getId())
                .parentCommentId(comment.getParent() != null ? comment.getParent().getId() : null)
                .boardId(boardId)
                .content(comment.getContent())
                .writerId(comment.getWriter().getId())
                .writerName(comment.getWriter().getName())
                .files(currentFiles)
                .createdAt(comment.getCreatedAt())
                .updatedAt(comment.getUpdatedAt())
                .replies(List.of()) // 단건 응답이므로 비움
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<CommentResponseDTO> getCommentTree(Long brandId, Long boardId) {

        // [기능] board 스코프 확인
        boardRepository.findByIdAndBrandIdAndDeletedAtIsNull(boardId, brandId)
                .orElseThrow(() -> new ApiException(ErrorCode.BOARD_NOT_FOUND));

        // 1️⃣ 부모 댓글
        List<Comment> parents =
                commentRepository.findByBoardIdAndParentIsNullAndDeletedAtIsNullOrderByIdDesc(boardId);

        if (parents.isEmpty()) return List.of();

        List<Long> parentIds = parents.stream().map(Comment::getId).toList();

        // 2️⃣ 대댓글
        List<Comment> replies =
                commentRepository.findByBoardIdAndParentIdInAndDeletedAtIsNullOrderByIdAsc(boardId, parentIds);

        // 3️⃣ 파일 조회 (한 방)
        List<Long> allCommentIds = Stream.concat(
                parents.stream(),
                replies.stream()
        ).map(Comment::getId).toList();

        Map<Long, List<FileResponseDTO>> fileMap =
                fileService.getFilesGrouped(FileTargetType.COMMENT, allCommentIds);

        // 4️⃣ 대댓글 그룹핑
        Map<Long, List<CommentResponseDTO>> replyMap = new HashMap<>();
        for (Comment reply : replies) {
            CommentResponseDTO replyDTO = toDTO(reply, fileMap);
            log.info("[COMMENT][TREE] 답글 commentId={}, files={}", reply.getId(), replyDTO.getFiles().size());
            replyMap.computeIfAbsent(reply.getParent().getId(), k -> new ArrayList<>())
                    .add(replyDTO);
        }

        // 5️⃣ 부모에 replies 붙이기
        List<CommentResponseDTO> result = new ArrayList<>();
        for (Comment parent : parents) {
            CommentResponseDTO dto = toDTO(parent, fileMap);
            dto.getReplies().addAll(replyMap.getOrDefault(parent.getId(), List.of()));
            result.add(dto);
        }

        return result;
    }

    @Override
    @Transactional
    public void delete(Long brandId, Long boardId, Long commentId, Member currentMember) {

        // 1) board 스코프 확인
        boardRepository.findByIdAndBrandIdAndDeletedAtIsNull(boardId, brandId)
                .orElseThrow(() -> new ApiException(ErrorCode.BOARD_NOT_FOUND));

        // 2) comment 조회
        Comment comment = commentRepository.findByIdAndDeletedAtIsNull(commentId)
                .orElseThrow(() -> new ApiException(ErrorCode.COMMENT_NOT_FOUND));

        // 3) board 소속 확인
        if (!comment.getBoard().getId().equals(boardId)) {
            throw new ApiException(ErrorCode.INVALID_REQUEST);
        }

        // 3-1) 본인 확인 (작성자만 삭제 가능)
        if (!comment.getWriter().getId().equals(currentMember.getId())) {
            throw new ApiException(ErrorCode.ACCESS_DENIED);
        }

        // 4) soft delete
        comment.softDelete();
        log.info("[COMMENT][SVC][DELETE] commentId={} softDeleted", commentId);

        // 5) 파일 연쇄 soft delete (전부 삭제)
        fileService.cleanupFiles(FileTargetType.COMMENT, commentId, List.of());
        log.info("[COMMENT][SVC][DELETE] cascade files targetId={}", commentId);
    }

    private CommentResponseDTO toDTO(Comment c, Map<Long, List<FileResponseDTO>> fileMap) {
        return CommentResponseDTO.builder()
                .commentId(c.getId())
                .parentCommentId(c.getParent() != null ? c.getParent().getId() : null)
                .boardId(c.getBoard().getId())
                .content(c.getContent())
                .writerId(c.getWriter().getId())
                .writerName(c.getWriter().getName())
                .files(fileMap.getOrDefault(c.getId(), List.of()))
                .createdAt(c.getCreatedAt())
                .updatedAt(c.getUpdatedAt())
                .build();
    }
}
