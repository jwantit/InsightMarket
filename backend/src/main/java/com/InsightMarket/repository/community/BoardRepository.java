package com.InsightMarket.repository.community;

import com.InsightMarket.domain.community.Board;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

// [게시글 Repository]
public interface BoardRepository extends JpaRepository<Board, Long> {

    // 1) 상세 조회 (브랜드 스코프 검증 포함)
    @EntityGraph(attributePaths = {"writer"}) // N+1 해결
    Optional<Board> findByIdAndBrandIdAndDeletedAtIsNull(Long boardId, Long brandId);

    // 2) 게시글 목록 조회
    @EntityGraph(attributePaths = {"writer"})
    Page<Board> findByBrandIdAndDeletedAtIsNull(Long brandId, Pageable pageable);

}
