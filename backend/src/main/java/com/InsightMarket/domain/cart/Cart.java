package com.InsightMarket.domain.cart;

import com.InsightMarket.domain.common.BaseEntity;
import com.InsightMarket.domain.member.Member;
import com.InsightMarket.domain.project.Project;
import jakarta.persistence.*;
import lombok.*;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@Entity
@Table(
        name = "cart",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_cart_member", columnNames = "project_id")
        }                               //유니크 제약 같은 project_id 값은 cart 테이블에 1번만 존재 가능
)
public class Cart extends BaseEntity {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "cart_id")
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;
}
