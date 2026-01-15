package com.InsightMarket.repository;

import com.InsightMarket.domain.brand.Brand;
import com.InsightMarket.domain.community.Board;
import com.InsightMarket.domain.community.Comment;
import com.InsightMarket.domain.member.Member;
import com.InsightMarket.repository.brand.BrandRepository;
import com.InsightMarket.repository.community.BoardRepository;
import com.InsightMarket.repository.community.CommentRepository;
import com.InsightMarket.repository.member.MemberRepository;
import lombok.extern.log4j.Log4j2;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.Commit;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * brand_id=1 기준 Board와 Comment 더미 데이터 생성
 * - 기존 Member 데이터 사용 (MemberRepositoryTests로 생성된 데이터)
 * - 기존 Brand 데이터 사용 (brand_id=1)
 * - Board와 Comment(대댓글 포함)만 생성
 */
@SpringBootTest
@Log4j2
@Transactional
public class BoardCommentDummyDataTests {

    @Autowired
    private BrandRepository brandRepository;

    @Autowired
    private MemberRepository memberRepository;

    @Autowired
    private BoardRepository boardRepository;

    @Autowired
    private CommentRepository commentRepository;

    private static final Long BRAND_ID = 1L;

    @Test
    @Commit
    public void createBoardAndCommentDummyData() {
        log.info("=== brand_id={} 기준 Board/Comment 더미 데이터 생성 시작 ===", BRAND_ID);

        // 1) Brand 조회 (brand_id=1)
        Brand brand = brandRepository.findById(BRAND_ID)
                .orElseThrow(() -> new RuntimeException("Brand id=" + BRAND_ID + " not found"));

        log.info("Brand 조회: id={}, name={}", brand.getId(), brand.getName());

        // 2) 기존 Member 조회 (MemberRepositoryTests로 생성된 데이터 사용)
        List<Member> members = memberRepository.findAll();
        if (members.isEmpty()) {
            throw new RuntimeException("Member 데이터가 없습니다. MemberRepositoryTests를 먼저 실행하세요.");
        }

        log.info("기존 Member 조회: {}명", members.size());

        // Member 선택 (최소 5명 필요)
        Member writer1 = members.get(0); // USER0
        Member writer2 = members.get(1); // USER1
        Member commentWriter1 = members.get(2); // USER2
        Member commentWriter2 = members.get(3); // USER3
        Member commentWriter3 = members.size() > 4 ? members.get(4) : members.get(0); // USER4 또는 USER0

        log.info("사용할 Member: writer1={}, writer2={}, commentWriter1={}, commentWriter2={}, commentWriter3={}",
                writer1.getName(), writer2.getName(), commentWriter1.getName(), commentWriter2.getName(), commentWriter3.getName());

        // 3) Board 100개 이상 생성 (brand_id=1)
        int targetBoardCount = 100;
        Board[] boards = new Board[targetBoardCount];
        
        // Member 리스트를 순환하여 사용
        for (int i = 0; i < targetBoardCount; i++) {
            Member writer = members.get(i % members.size()); // Member 순환 사용
            
            Board board = Board.builder()
                    .brand(brand)
                    .writer(writer)
                    .title(String.format("게시글 %d번 - 더미 데이터", i + 1))
                    .content(String.format("이것은 %d번째 게시글입니다. 더미 데이터 생성 테스트용입니다.", i + 1))
                    .build();
            boardRepository.save(board);
            boards[i] = board;
            
            if ((i + 1) % 10 == 0) {
                log.info("Board 생성 진행: {}/{}", i + 1, targetBoardCount);
            }
        }
        
        log.info("Board {}개 생성 완료", targetBoardCount);
        
        // 댓글 생성을 위한 참조용 Board (첫 5개)
        Board board1 = boards[0];
        Board board2 = boards[1];
        Board board4 = boards[3];
        Board board5 = boards[4];

        // 4) Board1에 댓글/대댓글 생성
        Comment parent1_1 = Comment.builder()
                .board(board1)
                .writer(commentWriter1)
                .parent(null)
                .content("첫 번째 댓글입니다. 좋은 글 감사합니다!")
                .build();
        commentRepository.save(parent1_1);
        log.info("부모 댓글 생성: id={}, boardId={}", parent1_1.getId(), board1.getId());

        Comment parent1_2 = Comment.builder()
                .board(board1)
                .writer(commentWriter2)
                .parent(null)
                .content("두 번째 댓글입니다. 공감합니다!")
                .build();
        commentRepository.save(parent1_2);
        log.info("부모 댓글 생성: id={}, boardId={}", parent1_2.getId(), board1.getId());

        Comment reply1_1 = Comment.builder()
                .board(board1)
                .writer(commentWriter2)
                .parent(parent1_1)
                .content("첫 번째 댓글에 대한 대댓글 1입니다.")
                .build();
        commentRepository.save(reply1_1);
        log.info("대댓글 생성: id={}, parentId={}", reply1_1.getId(), parent1_1.getId());

        Comment reply1_2 = Comment.builder()
                .board(board1)
                .writer(commentWriter3)
                .parent(parent1_1)
                .content("첫 번째 댓글에 대한 대댓글 2입니다.")
                .build();
        commentRepository.save(reply1_2);
        log.info("대댓글 생성: id={}, parentId={}", reply1_2.getId(), parent1_1.getId());

        Comment reply1_3 = Comment.builder()
                .board(board1)
                .writer(commentWriter1)
                .parent(parent1_2)
                .content("두 번째 댓글에 대한 대댓글입니다.")
                .build();
        commentRepository.save(reply1_3);
        log.info("대댓글 생성: id={}, parentId={}", reply1_3.getId(), parent1_2.getId());

        // 5) Board2에 댓글/대댓글 생성
        Comment parent2_1 = Comment.builder()
                .board(board2)
                .writer(commentWriter3)
                .parent(null)
                .content("Board2의 첫 번째 댓글입니다.")
                .build();
        commentRepository.save(parent2_1);
        log.info("부모 댓글 생성: id={}, boardId={}", parent2_1.getId(), board2.getId());

        Comment reply2_1 = Comment.builder()
                .board(board2)
                .writer(commentWriter1)
                .parent(parent2_1)
                .content("Board2의 대댓글 1입니다.")
                .build();
        commentRepository.save(reply2_1);
        log.info("대댓글 생성: id={}, parentId={}", reply2_1.getId(), parent2_1.getId());

        Comment reply2_2 = Comment.builder()
                .board(board2)
                .writer(commentWriter2)
                .parent(parent2_1)
                .content("Board2의 대댓글 2입니다.")
                .build();
        commentRepository.save(reply2_2);
        log.info("대댓글 생성: id={}, parentId={}", reply2_2.getId(), parent2_1.getId());

        // 6) Board4에 댓글/대댓글 생성 (여러 개)
        Comment parent4_1 = Comment.builder()
                .board(board4)
                .writer(commentWriter1)
                .parent(null)
                .content("Board4의 첫 번째 댓글입니다.")
                .build();
        commentRepository.save(parent4_1);
        log.info("부모 댓글 생성: id={}, boardId={}", parent4_1.getId(), board4.getId());

        Comment parent4_2 = Comment.builder()
                .board(board4)
                .writer(commentWriter2)
                .parent(null)
                .content("Board4의 두 번째 댓글입니다.")
                .build();
        commentRepository.save(parent4_2);
        log.info("부모 댓글 생성: id={}, boardId={}", parent4_2.getId(), board4.getId());

        Comment parent4_3 = Comment.builder()
                .board(board4)
                .writer(commentWriter3)
                .parent(null)
                .content("Board4의 세 번째 댓글입니다.")
                .build();
        commentRepository.save(parent4_3);
        log.info("부모 댓글 생성: id={}, boardId={}", parent4_3.getId(), board4.getId());

        Comment reply4_1 = Comment.builder()
                .board(board4)
                .writer(commentWriter2)
                .parent(parent4_1)
                .content("Board4 첫 번째 댓글의 대댓글 1입니다.")
                .build();
        commentRepository.save(reply4_1);
        log.info("대댓글 생성: id={}, parentId={}", reply4_1.getId(), parent4_1.getId());

        Comment reply4_2 = Comment.builder()
                .board(board4)
                .writer(commentWriter3)
                .parent(parent4_1)
                .content("Board4 첫 번째 댓글의 대댓글 2입니다.")
                .build();
        commentRepository.save(reply4_2);
        log.info("대댓글 생성: id={}, parentId={}", reply4_2.getId(), parent4_1.getId());

        Comment reply4_3 = Comment.builder()
                .board(board4)
                .writer(commentWriter1)
                .parent(parent4_2)
                .content("Board4 두 번째 댓글의 대댓글입니다.")
                .build();
        commentRepository.save(reply4_3);
        log.info("대댓글 생성: id={}, parentId={}", reply4_3.getId(), parent4_2.getId());

        // 7) Board5에 댓글 생성
        Comment parent5_1 = Comment.builder()
                .board(board5)
                .writer(writer1)
                .parent(null)
                .content("Board5의 첫 번째 댓글입니다.")
                .build();
        commentRepository.save(parent5_1);
        log.info("부모 댓글 생성: id={}, boardId={}", parent5_1.getId(), board5.getId());

        Comment parent5_2 = Comment.builder()
                .board(board5)
                .writer(writer2)
                .parent(null)
                .content("Board5의 두 번째 댓글입니다.")
                .build();
        commentRepository.save(parent5_2);
        log.info("부모 댓글 생성: id={}, boardId={}", parent5_2.getId(), board5.getId());

        Comment reply5_1 = Comment.builder()
                .board(board5)
                .writer(commentWriter1)
                .parent(parent5_1)
                .content("Board5 첫 번째 댓글의 대댓글입니다.")
                .build();
        commentRepository.save(reply5_1);
        log.info("대댓글 생성: id={}, parentId={}", reply5_1.getId(), parent5_1.getId());

        // 8) 결과 요약
        long boardCount = boardRepository.count();
        long commentCount = commentRepository.count();
        long parentCommentCount = commentRepository.findByBoardIdAndParentIsNullAndDeletedAtIsNullOrderByIdDesc(board1.getId()).size() +
                commentRepository.findByBoardIdAndParentIsNullAndDeletedAtIsNullOrderByIdDesc(board2.getId()).size() +
                commentRepository.findByBoardIdAndParentIsNullAndDeletedAtIsNullOrderByIdDesc(board4.getId()).size() +
                commentRepository.findByBoardIdAndParentIsNullAndDeletedAtIsNullOrderByIdDesc(board5.getId()).size();

        log.info("=== 더미 데이터 생성 완료 ===");
        log.info("Brand: 1개 (id={})", brand.getId());
        log.info("Board: {}개 (전체), {}개 생성됨", boardCount, targetBoardCount);
        log.info("Comment: {}개 (전체)", commentCount);
        log.info("부모 댓글: {}개 (생성된 Board 기준)", parentCommentCount);
        log.info("대댓글: {}개 (추정)", commentCount - parentCommentCount);
    }
}

