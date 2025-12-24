package com.InsightMarket.repository.community;

import com.InsightMarket.domain.community.Board;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

// [게시글 Repository] 브랜드별 무한스크롤(최신순) + 상세 조회
public interface BoardRepository extends JpaRepository<Board, Long> {

    // 1) 첫 페이지 (lastId 없을 때)
    @Query("""
        select b
        from Board b
        where b.brand.id = :brandId
          and b.deletedAt is null
        order by b.id desc
    """)
    List<Board> findFirstPage(@Param("brandId") Long brandId, Pageable pageable);

    // 2) 다음 페이지 (lastId 있을 때) - 최신순 커서
    @Query("""
        select b
        from Board b
        where b.brand.id = :brandId
          and b.deletedAt is null
          and b.id < :lastId
        order by b.id desc
    """)
    List<Board> findNextPage(@Param("brandId") Long brandId,
                             @Param("lastId") Long lastId,
                             Pageable pageable);

    // 3) 상세 조회 (브랜드 스코프 검증 포함)
    Optional<Board> findByIdAndBrandIdAndDeletedAtIsNull(Long boardId, Long brandId);

    // 4) 게시글 목록에 작성자 추가
    @Query("""
    select b
    from Board b
    join fetch b.writer w
    where b.brand.id = :brandId
      and b.deletedAt is null
    order by b.id desc
""")
    List<Board> findFirstPageWithWriter(@Param("brandId") Long brandId, Pageable pageable);

    List<Board> findByBrandIdAndDeletedAtIsNullOrderByIdDesc(Long brandId);

    // N+1 해결
    @EntityGraph(attributePaths = {"writer"})
    Page<Board> findByBrandIdAndDeletedAtIsNull(Long brandId, Pageable pageable);
}
