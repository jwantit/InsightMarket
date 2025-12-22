package com.InsightMarket.domain.brand;

import com.InsightMarket.domain.common.BaseEntity;
import com.InsightMarket.domain.user.User;
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
                @UniqueConstraint(name = "uk_brand_member_user_brand", columnNames = {"user_id", "brand_id"})
        }
)
public class BrandMember extends BaseEntity {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "brand_member_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "brand_id", nullable = false)
    private Brand brand;

    @Enumerated(EnumType.STRING)
    @Column(name = "brand_role", nullable = false, length = 30)
    private BrandRole brandRole;
}
