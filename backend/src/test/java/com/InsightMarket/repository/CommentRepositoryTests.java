package com.InsightMarket.repository;

import static org.assertj.core.api.Assertions.assertThat;
import com.InsightMarket.domain.brand.Brand;
import com.InsightMarket.domain.community.Board;
import com.InsightMarket.domain.community.Comment;
import com.InsightMarket.domain.member.Member;
import com.InsightMarket.domain.member.SystemRole;
import com.InsightMarket.repository.brand.BrandRepository;
import com.InsightMarket.repository.community.CommentRepository;
import com.InsightMarket.repository.member.MemberRepository;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@SpringBootTest
@Transactional
@DisplayName("CommentRepository 테스트")
class CommentRepositoryTests {

    @Autowired
    CommentRepository commentRepository;

    @Autowired
    BrandRepository brandRepository;

    @Autowired
    MemberRepository memberRepository;

    @Autowired
    EntityManager em;

    private static final Long BRAND_ID = 1L;
    private Brand brand;
    private Board board1;
    private Board board2;
    private Member writer1;
    private Member writer2;
    private Member writer3;
    private Long boardId1;
    private Long boardId2;
    private Long parentCommentId1;
    private Long parentCommentId2;
    private Long replyCommentId1;
    private Long replyCommentId2;
    private Long replyCommentId3;

    @BeforeEach
    void setUp() {
        // Brand 조회 또는 생성 (brand_id=1)
        brand = brandRepository.findById(BRAND_ID)
                .orElseGet(() -> {
                    Brand newBrand = Brand.builder()
                            .name("테스트 브랜드")
                            .description("테스트용 브랜드입니다")
                            .build();
                    return brandRepository.save(newBrand);
                });

        // Member 3명 생성
        writer1 = Member.builder()
                .name("댓글작성자1")
                .email("comment1@test.com")
                .password("1234")
                .systemRole(SystemRole.USER)
                .isSocial(false)
                .isApproved(true)
                .isExpired(false)
                .build();
        memberRepository.save(writer1);

        writer2 = Member.builder()
                .name("댓글작성자2")
                .email("comment2@test.com")
                .password("1234")
                .systemRole(SystemRole.USER)
                .isSocial(false)
                .isApproved(true)
                .isExpired(false)
                .build();
        memberRepository.save(writer2);

        writer3 = Member.builder()
                .name("댓글작성자3")
                .email("comment3@test.com")
                .password("1234")
                .systemRole(SystemRole.USER)
                .isSocial(false)
                .isApproved(true)
                .isExpired(false)
                .build();
        memberRepository.save(writer3);

        // Board 2개 생성 (brand_id=1)
        board1 = Board.builder()
                .brand(brand)
                .writer(writer1)
                .title("댓글이 많은 게시글")
                .content("이 게시글에는 댓글과 대댓글이 많습니다.")
                .build();
        em.persist(board1);
        boardId1 = board1.getId();

        board2 = Board.builder()
                .brand(brand)
                .writer(writer2)
                .title("댓글이 적은 게시글")
                .content("이 게시글에는 댓글이 적습니다.")
                .build();
        em.persist(board2);
        boardId2 = board2.getId();

        // Board1에 부모 댓글 2개
        Comment parent1 = Comment.builder()
                .board(board1)
                .writer(writer1)
                .content("첫 번째 댓글입니다. 좋은 글 감사합니다!")
                .build();
        em.persist(parent1);
        parentCommentId1 = parent1.getId();

        Comment parent2 = Comment.builder()
                .board(board1)
                .writer(writer2)
                .content("두 번째 댓글입니다. 공감합니다!")
                .build();
        em.persist(parent2);
        parentCommentId2 = parent2.getId();

        // Board1에 대댓글 3개 (parent1에 2개, parent2에 1개)
        Comment reply1 = Comment.builder()
                .board(board1)
                .writer(writer2)
                .parent(parent1)
                .content("첫 번째 댓글에 대한 대댓글 1입니다.")
                .build();
        em.persist(reply1);
        replyCommentId1 = reply1.getId();

        Comment reply2 = Comment.builder()
                .board(board1)
                .writer(writer3)
                .parent(parent1)
                .content("첫 번째 댓글에 대한 대댓글 2입니다.")
                .build();
        em.persist(reply2);
        replyCommentId2 = reply2.getId();

        Comment reply3 = Comment.builder()
                .board(board1)
                .writer(writer1)
                .parent(parent2)
                .content("두 번째 댓글에 대한 대댓글입니다.")
                .build();
        em.persist(reply3);
        replyCommentId3 = reply3.getId();

        // Board2에 부모 댓글 1개
        Comment parent3 = Comment.builder()
                .board(board2)
                .writer(writer3)
                .content("Board2의 첫 번째 댓글입니다.")
                .build();
        em.persist(parent3);

        // Board2에 대댓글 2개
        Comment reply4 = Comment.builder()
                .board(board2)
                .writer(writer1)
                .parent(parent3)
                .content("Board2의 대댓글 1입니다.")
                .build();
        em.persist(reply4);

        Comment reply5 = Comment.builder()
                .board(board2)
                .writer(writer2)
                .parent(parent3)
                .content("Board2의 대댓글 2입니다.")
                .build();
        em.persist(reply5);

        em.flush();
        em.clear();
    }

    @Test
    @DisplayName("부모 댓글 조회 - board_id로 부모 댓글만 조회 (최신순)")
    void 부모댓글_조회() {
        // when
        List<Comment> parents = commentRepository.findByBoardIdAndParentIsNullAndDeletedAtIsNullOrderByIdDesc(boardId1);

        // then
        assertThat(parents).hasSize(2);
        assertThat(parents.get(0).getId()).isEqualTo(parentCommentId2); // 최신순이므로 2번이 먼저
        assertThat(parents.get(1).getId()).isEqualTo(parentCommentId1);
        assertThat(parents.get(0).getContent()).isEqualTo("두 번째 댓글입니다. 공감합니다!");
        assertThat(parents.get(0).getParent()).isNull();
    }

    @Test
    @DisplayName("대댓글 조회 - 부모 댓글 ID 리스트로 대댓글 조회 (등록순)")
    void 대댓글_조회() {
        // given
        List<Comment> parents = commentRepository.findByBoardIdAndParentIsNullAndDeletedAtIsNullOrderByIdDesc(boardId1);
        List<Long> parentIds = parents.stream().map(Comment::getId).toList();

        // when
        List<Comment> replies = commentRepository.findByBoardIdAndParentIdInAndDeletedAtIsNullOrderByIdAsc(
                boardId1, parentIds);

        // then
        assertThat(replies).hasSize(3);
        assertThat(replies.get(0).getParent().getId()).isEqualTo(parentCommentId1);
        assertThat(replies.get(1).getParent().getId()).isEqualTo(parentCommentId1);
        assertThat(replies.get(2).getParent().getId()).isEqualTo(parentCommentId2);
    }

    @Test
    @DisplayName("댓글 단건 조회 - comment_id로 조회")
    void 댓글_단건_조회() {
        // when
        Optional<Comment> found = commentRepository.findByIdAndDeletedAtIsNull(parentCommentId1);

        // then
        assertThat(found).isPresent();
        assertThat(found.get().getId()).isEqualTo(parentCommentId1);
        assertThat(found.get().getContent()).isEqualTo("첫 번째 댓글입니다. 좋은 글 감사합니다!");
        assertThat(found.get().getParent()).isNull();
        assertThat(found.get().getBoard().getId()).isEqualTo(boardId1);
    }

    @Test
    @DisplayName("대댓글 단건 조회 - parent 확인")
    void 대댓글_단건_조회() {
        // when
        Optional<Comment> found = commentRepository.findByIdAndDeletedAtIsNull(replyCommentId1);

        // then
        assertThat(found).isPresent();
        assertThat(found.get().getId()).isEqualTo(replyCommentId1);
        assertThat(found.get().getParent()).isNotNull();
        assertThat(found.get().getParent().getId()).isEqualTo(parentCommentId1);
        assertThat(found.get().getContent()).isEqualTo("첫 번째 댓글에 대한 대댓글 1입니다.");
    }

    @Test
    @DisplayName("게시글별 댓글 수 조회 - 부모 댓글 + 대댓글 모두 포함")
    void 게시글별_댓글수_조회() {
        // when
        long count1 = commentRepository.countByBoardIdAndDeletedAtIsNull(boardId1);
        long count2 = commentRepository.countByBoardIdAndDeletedAtIsNull(boardId2);

        // then
        assertThat(count1).isEqualTo(5); // 부모 2개 + 대댓글 3개
        assertThat(count2).isEqualTo(3); // 부모 1개 + 대댓글 2개
    }

    @Test
    @DisplayName("다른 게시글의 댓글 조회 - board_id가 다르면 조회되지 않음")
    void 다른게시글_댓글_조회() {
        // when
        List<Comment> board1Comments = commentRepository.findByBoardIdAndParentIsNullAndDeletedAtIsNullOrderByIdDesc(boardId1);
        List<Comment> board2Comments = commentRepository.findByBoardIdAndParentIsNullAndDeletedAtIsNullOrderByIdDesc(boardId2);

        // then
        assertThat(board1Comments).hasSize(2);
        assertThat(board2Comments).hasSize(1);
        assertThat(board1Comments).noneMatch(c -> c.getBoard().getId().equals(boardId2));
        assertThat(board2Comments).noneMatch(c -> c.getBoard().getId().equals(boardId1));
    }

    @Test
    @DisplayName("대댓글 상세 조회 - replyCommentId2, replyCommentId3 확인")
    void 대댓글_상세_조회_여러개() {
        // when
        Optional<Comment> reply2 = commentRepository.findByIdAndDeletedAtIsNull(replyCommentId2);
        Optional<Comment> reply3 = commentRepository.findByIdAndDeletedAtIsNull(replyCommentId3);

        // then
        assertThat(reply2).isPresent();
        assertThat(reply2.get().getParent().getId()).isEqualTo(parentCommentId1);
        assertThat(reply2.get().getContent()).isEqualTo("첫 번째 댓글에 대한 대댓글 2입니다.");

        assertThat(reply3).isPresent();
        assertThat(reply3.get().getParent().getId()).isEqualTo(parentCommentId2);
        assertThat(reply3.get().getContent()).isEqualTo("두 번째 댓글에 대한 대댓글입니다.");
    }
}
