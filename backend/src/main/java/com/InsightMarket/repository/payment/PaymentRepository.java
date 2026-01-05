package com.InsightMarket.repository.payment;

import com.InsightMarket.domain.member.Member;
import com.InsightMarket.domain.order.Orders;
import com.InsightMarket.dto.PageRequestDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;

public interface PaymentRepository extends JpaRepository<Orders, Long> {

    
    //User기준으로 전체조회
    @Query("SELECT o FROM Orders o " +
            "WHERE o.buyMemberId = :buyMemberId " +
            "AND o.status = com.InsightMarket.domain.order.OrderStatus.PAID ")
    Page<Orders> findMyOrders(
            @Param("buyMemberId") Long buyMemberId,
            Pageable pageable
    );
    //User + Time
    @Query("SELECT o FROM Orders o " +
            "WHERE o.buyMemberId = :buyMemberId " +
            "AND o.status = com.InsightMarket.domain.order.OrderStatus.PAID " +
            "AND o.createdAt >= :startTime " +
            "AND o.createdAt <= :endTime ")
    Page<Orders> findMyOrdersTime(
            @Param("buyMemberId") Long buyMemberId,
            @Param("startTime")LocalDateTime startTime,
            @Param("endTime")LocalDateTime endTime,
            Pageable pageable
            );

    // 특정 사용자가 특정 솔루션을 구매했는지 확인
    @Query("""
        SELECT COUNT(oi) > 0 
        FROM OrderItem oi 
        JOIN oi.order o 
        WHERE oi.solution.id = :solutionId 
        AND o.buyMemberId = :buyMemberId 
        AND o.status = com.InsightMarket.domain.order.OrderStatus.PAID
        """)
    boolean isSolutionPurchasedByMember(
            @Param("solutionId") Long solutionId,
            @Param("buyMemberId") Long buyMemberId
    );

    // 사용자가 구매한 무료 리포트 개수 (price = 0인 솔루션)
    @Query("""
        SELECT COUNT(DISTINCT oi.solution.id)
        FROM OrderItem oi
        JOIN oi.order o
        JOIN oi.solution s
        WHERE o.buyMemberId = :buyMemberId
        AND o.status = com.InsightMarket.domain.order.OrderStatus.PAID
        AND s.price = 0
        """)
    long countFreeReportsByMemberId(@Param("buyMemberId") Long buyMemberId);

}
