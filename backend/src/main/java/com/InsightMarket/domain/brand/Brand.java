package com.InsightMarket.domain.brand;

import com.InsightMarket.domain.common.BaseEntity;
import com.InsightMarket.domain.company.Company;
import jakarta.persistence.*;
import lombok.*;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@Entity
@Table(name = "brand")
public class Brand extends BaseEntity {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "brand_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id")
    private Company company;

    @Column(nullable = false, length = 255)
    private String name;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String description;
}
