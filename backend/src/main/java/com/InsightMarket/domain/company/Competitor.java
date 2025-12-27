package com.InsightMarket.domain.company;

import com.InsightMarket.domain.brand.Brand;
import com.InsightMarket.domain.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@Entity
@Table(
        name = "competitor",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_competitor_brand_name", columnNames = {"brand_id", "name"})
        }
)
public class Competitor extends BaseEntity {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "competitor_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "brand_id", nullable = false)
    private Brand brand;

    @Column(nullable = false, length = 255)
    private String name;

    @Column(name = "is_enabled", nullable = false)
    private boolean enabled;

    public void changeName(String name) {
        this.name = name;
    }

    public void changeEnabled(boolean enabled) {
        this.enabled = enabled;
    }
}
