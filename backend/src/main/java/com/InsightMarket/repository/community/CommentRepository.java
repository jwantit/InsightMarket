package com.InsightMarket.repository.community;

import com.InsightMarket.domain.community.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

// [댓글 조회] 부모/자식 분리 조회용 Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {

    // 1) 부모 댓글 조회 (parent is null)
    @Query("""
        select c
        from Comment c
        join fetch c.writer w
        where c.board.id = :boardId
          and c.parent is null
          and c.deletedAt is null
        order by c.createdAt asc, c.id asc
    """)
    List<Comment> findParentsOld(@Param("boardId") Long boardId);

    @Query("""
        select c
        from Comment c
        join fetch c.writer w
        where c.board.id = :boardId
          and c.parent is null
          and c.deletedAt is null
        order by c.createdAt desc, c.id desc
    """)
    List<Comment> findParentsNew(@Param("boardId") Long boardId);

    // 2) 자식(대댓글) 한번에 조회 (부모 id 리스트로)
    @Query("""
        select c
        from Comment c
        join fetch c.writer w
        where c.parent.id in :parentIds
          and c.deletedAt is null
        order by c.createdAt asc, c.id asc
    """)
    List<Comment> findChildrenByParentIds(@Param("parentIds") List<Long> parentIds);
}
