package com.InsightMarket.service.community;

import com.InsightMarket.domain.member.Member;
import com.InsightMarket.dto.PageRequestDTO;
import com.InsightMarket.dto.PageResponseDTO;
import com.InsightMarket.dto.community.BoardModifyDTO;
import com.InsightMarket.dto.community.BoardResponseDTO;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface BoardService {

    BoardResponseDTO create(Long brandId, BoardModifyDTO data, List<MultipartFile> files, Member currentMember);

    BoardResponseDTO update(Long brandId, Long boardId, BoardModifyDTO dto, List<MultipartFile> newFiles, Member currentMember);

    PageResponseDTO<BoardResponseDTO> list(Long brandId, PageRequestDTO pageRequestDTO);

    BoardResponseDTO detail(Long brandId, Long boardId);

    void delete(Long brandId, Long boardId, Member currentMember);
}
