package com.InsightMarket.repository.community;

import com.InsightMarket.domain.community.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

// [댓글 Repository] 2단 트리 구성용 (부모/자식 2쿼리)
public interface CommentRepository extends JpaRepository<Comment, Long> {

    // 1) 부모 댓글(등록순)
    @Query("""
        select c
        from Comment c
        join fetch c.writer w
        where c.board.id = :boardId
          and c.parent is null
        order by c.createdAt asc, c.id asc
    """)
    List<Comment> findParentsOld(@Param("boardId") Long boardId);

    // 2) 부모 댓글(최신순)
    @Query("""
        select c
        from Comment c
        join fetch c.writer w
        where c.board.id = :boardId
          and c.parent is null
        order by c.createdAt desc, c.id desc
    """)
    List<Comment> findParentsNew(@Param("boardId") Long boardId);

    // 3) 자식(대댓글) 전체 - 부모 id 리스트로 한번에 (등록순 고정)
    @Query("""
        select c
        from Comment c
        join fetch c.writer w
        where c.parent.id in :parentIds
        order by c.createdAt asc, c.id asc
    """)
    List<Comment> findChildrenByParentIds(@Param("parentIds") List<Long> parentIds);

    // 4) 수정/삭제 시 스코프 검증(브랜드/보드)
//    Optional<Comment> findByCommentIdAndBoardId(Long commentId, Long boardId);

    // 5) 대댓글 생성 시 parent 조회(2단 제한 검증용)
//    Optional<Comment> findByParentIdAndBoardId(Long parentId, Long boardId);
}

