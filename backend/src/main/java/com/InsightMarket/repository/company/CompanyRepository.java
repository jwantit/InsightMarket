package com.InsightMarket.repository.company;

import com.InsightMarket.domain.company.Company;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CompanyRepository extends JpaRepository<Company, Long>{

    //사업자 번호 중복방지
    boolean existsByBusinessNumber(String businessNumber);
}