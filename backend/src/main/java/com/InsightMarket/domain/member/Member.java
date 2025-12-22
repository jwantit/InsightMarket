package com.InsightMarket.domain.member;

import com.InsightMarket.domain.common.BaseEntity;
import com.InsightMarket.domain.company.Company;
import jakarta.persistence.*;
import lombok.*;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@Entity
@Table(name = "member",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_member_email", columnNames = "email")
        })
public class Member extends BaseEntity {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "member_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id")
    private Company company;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, length = 255)
    private String email;

    @Column(nullable = false, length = 255)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(name = "system_role", nullable = false, length = 30)
    private SystemRole systemRole;

    @Column(name = "is_social", nullable = false)
    private boolean isSocial;

    @Column(name = "is_approved", nullable = false)
    private boolean isApproved;

    @Column(name = "is_expired", nullable = false)
    private boolean isExpired;

    public void changeName(String name) {
        this.name = name;
    }

    public void changePassword(String password){
        this.password = password;
    }

    public void changeIsSocial(boolean isSocial) {
        this.isSocial = isSocial;
    }
}
