package com.InsightMarket.domain.company;

import com.InsightMarket.domain.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@ToString
@Entity
@Table(name = "company")
public class Company extends BaseEntity {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "company_id")
    private Long id;

    @Column(nullable = false, length = 255)
    private String name;

    //사업자등록
    @Column(name = "registration_number", unique = true, length = 20)
    private String businessNumber;
}
