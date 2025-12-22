package com.InsightMarket.service.community;


import com.InsightMarket.domain.community.Comment;
import com.InsightMarket.repository.community.CommentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
// [댓글 서비스] 트리 조립 + 정렬 옵션 처리
public class CommentService {

    private final CommentRepository commentRepository;
}