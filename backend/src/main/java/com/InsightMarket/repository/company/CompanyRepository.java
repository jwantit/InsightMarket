package com.InsightMarket.repository.company;

import com.InsightMarket.domain.company.Company;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CompanyRepository extends JpaRepository<Company, Long>{
}