package com.InsightMarket.service;

import static org.assertj.core.api.Assertions.assertThat;

import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@Transactional
class CommentServiceTests {

//    @Autowired
//    CommentService commentService;
//
//    @Autowired
//    private ObjectMapper objectMapper;
//
//    Long brandId;
//    Long boardId;
//    Long writerId;
//
//    @Test
//    void 댓글_트리_조회() throws JsonProcessingException {
//        List<CommentResponseDTO> tree = commentService.getCommentTree(5L);
//
//        // 1) JSON으로 전체 출력 (가장 보기 편함)
//        System.out.println("\n==== Comment Tree (JSON) ====");
//        System.out.println(objectMapper.writerWithDefaultPrettyPrinter()
//                .writeValueAsString(tree));
//
//        // 2) 트리 형태로 요약 출력 (부모/대댓글 구조 확인용)
//        System.out.println("\n==== Comment Tree (Pretty) ====");
//        for (CommentResponseDTO parent : tree) {
//            System.out.printf("[P] id=%d writer=%s content=%s replies=%d%n",
//                    parent.getCommentId(),
//                    parent.getWriterName(),
//                    parent.getContent(),
//                    parent.getReplies() == null ? -1 : parent.getReplies().size()
//            );
//
//            if (parent.getReplies() != null) {
//                for (CommentResponseDTO child : parent.getReplies()) {
//                    System.out.printf("   └─ [C] id=%d writer=%s content=%s%n",
//                            child.getCommentId(),
//                            child.getWriterName(),
//                            child.getContent()
//                    );
//                }
//            }
//        }
//
//        assertThat(tree).isNotEmpty();
//        assertThat(tree.get(0).getReplies()).isNotNull();
//    }
//
//    @Test
//    void 부모댓글_생성() {
//
//        CommentModifyDTO dto = new CommentModifyDTO();
//        dto.setContent("부모댓글");
//
//        CommentResponseDTO res =
//                commentService.create(1L, 5L, dto, List.of());
//
//        assertThat(res.getCommentId()).isNotNull();
//        assertThat(res.getParentCommentId()).isNull();
//        assertThat(res.getContent()).isEqualTo("부모댓글");
//    }
//
//    @Test
//    void 대댓글_생성() {
//
//        // 부모 먼저 생성
//        CommentModifyDTO parentDto = new CommentModifyDTO();
//        parentDto.setContent("부모");
//
//        CommentResponseDTO parent =
//                commentService.create(1L, 5L, parentDto, List.of());
//
//        // 대댓글 생성
//        CommentModifyDTO replyDto = new CommentModifyDTO();
//        replyDto.setContent("대댓글");
//        replyDto.setParentCommentId(parent.getCommentId());
//
//        CommentResponseDTO reply =
//                commentService.create(1L, 5L, replyDto, List.of());
//
//        assertThat(reply.getCommentId()).isNotNull();
//        assertThat(reply.getParentCommentId()).isEqualTo(parent.getCommentId());
//    }

    public static class PaymentServiceTests {
    }
}