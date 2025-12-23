package com.InsightMarket.repository.member;

import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import com.InsightMarket.domain.member.Member;

import java.util.Optional;

public interface MemberRepository extends JpaRepository<Member, String> {

    //이메일로 회원 정보(+회사 정보까지) 조회하는 쿼리
    @EntityGraph(attributePaths = {"company"})
    @Query("select m from Member m where m.email = :email")
    Optional<Member> findWithCompanyByEmail(@Param("email") String email);

    //이메일로 회원정보 조회
    Optional<Member> findByEmail(String email);
}
