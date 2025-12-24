package com.InsightMarket.repository;

import static org.assertj.core.api.Assertions.assertThat;
import com.InsightMarket.domain.community.Board;
import com.InsightMarket.domain.community.Comment;
import com.InsightMarket.domain.member.Member;
import com.InsightMarket.domain.member.SystemRole;
import com.InsightMarket.repository.community.CommentRepository;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@SpringBootTest
@Transactional
class CommentRepositoryTests {

    @Autowired
    CommentRepository commentRepository;
    @Autowired
    EntityManager em;

    Long boardId;
    Long memberId;

    @BeforeEach
    void setUp() {
        Member member = Member.builder()
                .name("테스터")
                .email("test@test.com")
                .password("1234")
                .systemRole(SystemRole.USER)
                .build();
        em.persist(member);
        memberId = member.getId();

        Board board = Board.builder()
                .title("게시글")
                .content("내용")
                .writer(member)
                .build();
        em.persist(board);
        boardId = board.getId();

        // 부모 댓글 2개
        Comment p1 = Comment.builder()
                .board(board)
                .writer(member)
                .content("부모1")
                .build();
        em.persist(p1);

        Comment p2 = Comment.builder()
                .board(board)
                .writer(member)
                .content("부모2")
                .build();
        em.persist(p2);

        // 대댓글
        Comment c1 = Comment.builder()
                .board(board)
                .writer(member)
                .parent(p1)
                .content("대댓글1")
                .build();
        em.persist(c1);

        em.flush();
        em.clear();
    }

    @Test
    void 부모댓글_조회() {
        List<Comment> parents =
                commentRepository.findByBoardIdAndParentIsNullAndDeletedAtIsNullOrderByIdDesc(boardId);

        assertThat(parents).hasSize(2);
    }

    @Test
    void 대댓글_조회() {
        List<Comment> parents =
                commentRepository.findByBoardIdAndParentIsNullAndDeletedAtIsNullOrderByIdDesc(boardId);

        List<Long> parentIds = parents.stream().map(Comment::getId).toList();

        List<Comment> replies =
                commentRepository.findByBoardIdAndParentIdInAndDeletedAtIsNullOrderByIdAsc(
                        boardId, parentIds);

        assertThat(replies).hasSize(1);
    }
}
