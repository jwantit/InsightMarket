package com.InsightMarket.repository.member;

import com.InsightMarket.domain.company.Company;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import com.InsightMarket.domain.member.Member;

import java.util.List;
import java.util.Optional;

public interface MemberRepository extends JpaRepository<Member, Long> {

    //이메일로 회원 정보(+회사 정보까지) 조회하는 쿼리
    @EntityGraph(attributePaths = {"company"})
    @Query("select m from Member m where m.email = :email")
    Optional<Member> findWithCompanyByEmail(@Param("email") String email);

    //이메일로 회원정보 조회
    Optional<Member> findByEmail(String email);

    //이메일로 회원 존재하는지 확인
    boolean existsByEmail(String email);

    //승인 false 회원 전체 조회
    List<Member> findByIsApprovedFalse();

    //파라미터로 들어온 Company와 RequestCompany가 일치하고, 승인 false인 회원 목록 가져오기
    //즉, 해당 회사로 가입한 아직 승인 안된 회원들 조회
    @EntityGraph(attributePaths = {"requestedCompany"})
    List<Member> findByIsApprovedFalseAndRequestedCompany(Company company);
}
