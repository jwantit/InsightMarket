package com.InsightMarket.domain.community;

import com.InsightMarket.domain.common.BaseEntity;
import com.InsightMarket.domain.common.SoftDeleteEntity;
import com.InsightMarket.domain.user.User;
import jakarta.persistence.*;
import lombok.*;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@Entity
@Table(name = "comment")
public class Comment extends SoftDeleteEntity {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "comment_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "board_id", nullable = false)
    private Board board;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User writer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_comment_id")
    private Comment parent;

    @Lob
    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;
}
