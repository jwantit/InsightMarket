package com.InsightMarket.domain.keyword;

import com.InsightMarket.domain.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@Entity
@Table(
        name = "keyword",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_keyword_text", columnNames = "text")
        }
)
public class Keyword extends BaseEntity {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "keyword_id")
    private Long id;

    @Column(nullable = false, length = 255)
    private String text; // 정규화된 형태(소문자/공백정리)
}
