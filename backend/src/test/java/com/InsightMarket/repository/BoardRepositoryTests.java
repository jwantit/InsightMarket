package com.InsightMarket.repository;

import com.InsightMarket.domain.brand.Brand;
import com.InsightMarket.domain.community.Board;
import com.InsightMarket.domain.member.Member;
import com.InsightMarket.domain.member.SystemRole;
import com.InsightMarket.repository.brand.BrandRepository;
import com.InsightMarket.repository.community.BoardRepository;
import com.InsightMarket.repository.member.MemberRepository;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@Transactional
@DisplayName("BoardRepository 테스트")
class BoardRepositoryTests {

    @Autowired
    BoardRepository boardRepository;

    @Autowired
    BrandRepository brandRepository;

    @Autowired
    MemberRepository memberRepository;

    @Autowired
    EntityManager em;

    private static final Long BRAND_ID = 1L;
    private Brand brand;
    private Member writer1;
    private Member writer2;
    private Long boardId1;
    private Long boardId2;
    private Long boardId3;

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

        // Member 2명 생성
        writer1 = Member.builder()
                .name("작성자1")
                .email("writer1@test.com")
                .password("1234")
                .systemRole(SystemRole.USER)
                .isSocial(false)
                .isApproved(true)
                .isExpired(false)
                .build();
        memberRepository.save(writer1);

        writer2 = Member.builder()
                .name("작성자2")
                .email("writer2@test.com")
                .password("1234")
                .systemRole(SystemRole.USER)
                .isSocial(false)
                .isApproved(true)
                .isExpired(false)
                .build();
        memberRepository.save(writer2);

        // Board 3개 생성 (brand_id=1)
        Board board1 = Board.builder()
                .brand(brand)
                .writer(writer1)
                .title("첫 번째 게시글")
                .content("첫 번째 게시글 내용입니다. 댓글이 많은 게시글입니다.")
                .build();
        boardRepository.save(board1);
        boardId1 = board1.getId();

        Board board2 = Board.builder()
                .brand(brand)
                .writer(writer2)
                .title("두 번째 게시글")
                .content("두 번째 게시글 내용입니다. 댓글이 적은 게시글입니다.")
                .build();
        boardRepository.save(board2);
        boardId2 = board2.getId();

        Board board3 = Board.builder()
                .brand(brand)
                .writer(writer1)
                .title("세 번째 게시글")
                .content("세 번째 게시글 내용입니다. 댓글이 없는 게시글입니다.")
                .build();
        boardRepository.save(board3);
        boardId3 = board3.getId();

        em.flush();
        em.clear();
    }

    @Test
    @DisplayName("게시글 상세 조회 - brand_id와 board_id로 조회")
    void 게시글_상세_조회() {
        // when
        Optional<Board> found = boardRepository.findByIdAndBrandIdAndDeletedAtIsNull(boardId1, BRAND_ID);

        // then
        assertThat(found).isPresent();
        assertThat(found.get().getId()).isEqualTo(boardId1);
        assertThat(found.get().getBrand().getId()).isEqualTo(BRAND_ID);
        assertThat(found.get().getTitle()).isEqualTo("첫 번째 게시글");
        assertThat(found.get().getWriter().getName()).isEqualTo("작성자1");
    }

    @Test
    @DisplayName("게시글 상세 조회 - 다른 brand_id로 조회 시 실패")
    void 게시글_상세_조회_다른브랜드() {
        // when
        Optional<Board> found = boardRepository.findByIdAndBrandIdAndDeletedAtIsNull(boardId1, 999L);

        // then
        assertThat(found).isEmpty();
    }

    @Test
    @DisplayName("게시글 목록 조회 - brand_id로 페이징 조회")
    void 게시글_목록_조회() {
        // given
        Pageable pageable = PageRequest.of(0, 10);

        // when
        Page<Board> boards = boardRepository.findByBrandIdAndDeletedAtIsNull(BRAND_ID, pageable);

        // then
        assertThat(boards.getTotalElements()).isEqualTo(3);
        assertThat(boards.getContent()).hasSize(3);
        assertThat(boards.getContent().get(0).getBrand().getId()).isEqualTo(BRAND_ID);
    }

    @Test
    @DisplayName("게시글 목록 조회 - 다른 brand_id로 조회 시 빈 결과")
    void 게시글_목록_조회_다른브랜드() {
        // given
        Pageable pageable = PageRequest.of(0, 10);

        // when
        Page<Board> boards = boardRepository.findByBrandIdAndDeletedAtIsNull(999L, pageable);

        // then
        assertThat(boards.getTotalElements()).isEqualTo(0);
        assertThat(boards.getContent()).isEmpty();
    }

    @Test
    @DisplayName("게시글 목록 조회 - 페이징 테스트")
    void 게시글_목록_조회_페이징() {
        // given
        Pageable pageable = PageRequest.of(0, 2);

        // when
        Page<Board> boards = boardRepository.findByBrandIdAndDeletedAtIsNull(BRAND_ID, pageable);

        // then
        assertThat(boards.getTotalElements()).isEqualTo(3);
        assertThat(boards.getContent()).hasSize(2);
        assertThat(boards.getTotalPages()).isEqualTo(2);
    }

    @Test
    @DisplayName("게시글 상세 조회 - boardId2, boardId3 확인")
    void 게시글_상세_조회_여러개() {
        // when
        Optional<Board> found2 = boardRepository.findByIdAndBrandIdAndDeletedAtIsNull(boardId2, BRAND_ID);
        Optional<Board> found3 = boardRepository.findByIdAndBrandIdAndDeletedAtIsNull(boardId3, BRAND_ID);

        // then
        assertThat(found2).isPresent();
        assertThat(found2.get().getId()).isEqualTo(boardId2);
        assertThat(found2.get().getTitle()).isEqualTo("두 번째 게시글");
        assertThat(found2.get().getWriter().getName()).isEqualTo("작성자2");

        assertThat(found3).isPresent();
        assertThat(found3.get().getId()).isEqualTo(boardId3);
        assertThat(found3.get().getTitle()).isEqualTo("세 번째 게시글");
        assertThat(found3.get().getWriter().getName()).isEqualTo("작성자1");
    }
}

