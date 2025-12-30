package com.InsightMarket.service.community;

import com.InsightMarket.dto.community.CommentModifyDTO;
import com.InsightMarket.dto.community.CommentResponseDTO;
import com.InsightMarket.domain.member.Member;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface CommentService {

    CommentResponseDTO create(Long brandId, Long boardId, CommentModifyDTO data, List<MultipartFile> files, Member currentMember);

    CommentResponseDTO update(Long brandId, Long boardId, Long commentId, CommentModifyDTO data, List<MultipartFile> files, Member currentMember);

    List<CommentResponseDTO> getCommentTree(Long brandId, Long boardId);

    void delete(Long brandId, Long boardId, Long commentId, Member currentMember);
}