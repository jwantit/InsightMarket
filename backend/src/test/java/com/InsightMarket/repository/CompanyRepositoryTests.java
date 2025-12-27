package com.InsightMarket.repository;

import com.InsightMarket.domain.company.Company;
import com.InsightMarket.repository.company.CompanyRepository;
import lombok.extern.log4j.Log4j2;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;

@SpringBootTest
@Log4j2
public class CompanyRepositoryTests {

    @Autowired
    private CompanyRepository companyRepository;

    @Test
    public void insertCompanies() {

        Company companyA = Company.builder()
                .name("Company A")
                .build();

        Company companyB = Company.builder()
                .name("Company B")
                .build();

        companyRepository.saveAll(List.of(companyA, companyB));
    }

}
