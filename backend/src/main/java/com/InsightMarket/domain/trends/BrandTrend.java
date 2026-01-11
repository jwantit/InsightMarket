package com.InsightMarket.domain.trends;

import com.InsightMarket.domain.brand.Brand;
import com.InsightMarket.domain.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@Entity
@Table(name = "brand_trend")
public class BrandTrend extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "brand_trend_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "brand_id", nullable = false)
    private Brand brand;

    @Column(nullable = false, length = 255)
    private String keyword;

    @Column(name = "collected_at", nullable = false)
    private LocalDateTime collectedAt;

    // 트렌드 데이터 (top/rising 리스트)를 JSON 문자열로 저장
    @Lob
    @Column(name = "data_json", nullable = false, columnDefinition = "JSON")
    private String dataJson;
}
