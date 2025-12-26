package com.InsightMarket.controller;

import com.InsightMarket.dto.company.CompanyDTO;
import com.InsightMarket.repository.company.CompanyRepository;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/company")
@RequiredArgsConstructor
public class CompanyController {

    private final CompanyRepository companyRepository;
    private final ModelMapper modelMapper;

    // 회사 목록 조회 (회원가입용)
    @GetMapping
    public List<CompanyDTO> getCompanyList() {
        return companyRepository.findAll().stream()
                .map(company -> modelMapper.map(company, CompanyDTO.class))
                .toList();
    }
}

