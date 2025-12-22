package com.InsightMarket.domain.brand;

import com.InsightMarket.domain.common.BaseEntity;
import com.InsightMarket.domain.member.Member;
import jakarta.persistence.*;
import lombok.*;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@Entity
@Table(
        name = "brand_member",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_member_brand", columnNames = {"member_id", "brand_id"})
        }
)
public class BrandMember extends BaseEntity {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "brand_member_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "brand_id", nullable = false)
    private Brand brand;

    @Enumerated(EnumType.STRING)
    @Column(name = "brand_role", nullable = false, length = 30)
    private BrandRole brandRole;
}
