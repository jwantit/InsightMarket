package com.InsightMarket.domain.project;

import com.InsightMarket.domain.brand.Brand;
import com.InsightMarket.domain.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@Entity
@Table(name = "project")
public class Project extends BaseEntity {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "project_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "brand_id")//nullable = false
    private Brand brand;

    @Column(length = 255)//nullable = false
    private String name;

    @Column(name = "start_date")//nullable = false
    private LocalDate startDate;

    @Column(name = "end_date")//nullable = false
    private LocalDate endDate;

    public void changeInfo(String name, LocalDate startDate, LocalDate endDate) {
        this.name = name;
        this.startDate = startDate;
        this.endDate = endDate;
    }
}


