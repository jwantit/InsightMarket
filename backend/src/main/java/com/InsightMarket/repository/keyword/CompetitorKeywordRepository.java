package com.InsightMarket.repository.keyword;

import com.InsightMarket.domain.company.Competitor;
import com.InsightMarket.domain.keyword.CompetitorKeyword;
import com.InsightMarket.domain.keyword.Keyword;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CompetitorKeywordRepository extends JpaRepository<CompetitorKeyword, Long> {

    // 경쟁사 키워드 조회 (n+1 방지 쿼리)
    @Query("""
            select ck
            from CompetitorKeyword ck
            join fetch ck.keyword k
            where ck.competitor in :competitors
            """)
    List<CompetitorKeyword> findByCompetitorInWithKeyword(@Param("competitors") List<Competitor> competitors);

    @Query("select ck from CompetitorKeyword ck join fetch ck.keyword where ck.competitor = :competitor")
    List<CompetitorKeyword> findByCompetitorWithKeyword(@Param("competitor") Competitor competitor);

    void deleteByCompetitorIn(List<Competitor> competitors);
}
