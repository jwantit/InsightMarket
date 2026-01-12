package com.InsightMarket.domain.brand;

import com.InsightMarket.domain.common.BaseEntity;
import com.InsightMarket.domain.company.Company;
import com.InsightMarket.domain.company.Competitor;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@Entity
@Table(name = "brand")
public class Brand extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
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

    @Column(name = "image_file_id")
    private Long imageFileId;

    //cascade = ALL → Brand 삭제 시 관련 BrandMember도 자동 삭제
    //orphanRemoval = true → 부모에서 제거된 자식도 삭제
    //BrandRepository에서 delete 호출하면 FK 문제 없이 삭제 가능
    @OneToMany(mappedBy = "brand", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<BrandMember> members = new ArrayList<>();

    @OneToMany(mappedBy = "brand", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Competitor> competitors = new ArrayList<>();

    public void changeName(String name) {
        this.name = name;
    }

    public void changeDescription(String description) {
        this.description = description;
    }

    public void changeImageFileId(Long imageFileId) {
        this.imageFileId = imageFileId;
    }
}
