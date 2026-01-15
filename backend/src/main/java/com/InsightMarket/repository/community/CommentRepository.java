package com.InsightMarket.repository.community;

import com.InsightMarket.domain.community.Comment;
import com.InsightMarket.domain.files.FileTargetType;
import com.InsightMarket.domain.files.UploadedFile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CommentRepository extends JpaRepository<Comment, Long> {

    // 부모 댓글 (최신순)
    List<Comment> findByBoardIdAndParentIsNullAndDeletedAtIsNullOrderByIdDesc(Long boardId);

    // 대댓글 (등록순)
    List<Comment> findByBoardIdAndParentIdInAndDeletedAtIsNullOrderByIdAsc(
            Long boardId,
            List<Long> parentIds
    );

    Optional<Comment> findByIdAndDeletedAtIsNull(Long commentId);
    
    // 게시글별 댓글 수 조회 (부모 댓글 + 대댓글 모두 포함)
    long countByBoardIdAndDeletedAtIsNull(Long boardId);

    // 댓글 조회 + N+1 getCommentTree와 연결 필요
//    @Query("""
//        select c
//        from Comment c
//        join fetch c.writer
//        join fetch c.board
//        where c.board.id = :boardId
//          and c.parent is null
//          and c.deletedAt is null
//        order by c.id desc
//    """)
//    List<Comment> findParentsWithWriter(@Param("boardId") Long boardId);


    // 대댓글 조회 + N+1
//    @Query("""
//            select c
//            from Comment c
//            join fetch c.writer
//            join fetch c.board
//            join fetch c.parent
//            where c.board.id = :boardId
//              and c.parent.id in :parentIds
//              and c.deletedAt is null
//            order by c.id asc
//        """)
//    List<Comment> findRepliesWithWriterAndParent(@Param("boardId") Long boardId,
//                                                 @Param("parentIds") List<Long> parentIds);
}
