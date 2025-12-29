package com.InsightMarket.repository.payment;

import com.InsightMarket.domain.member.Member;
import com.InsightMarket.domain.order.Orders;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PaymentRepository extends JpaRepository<Orders, Long> {

    @Query("SELECT o FROM Orders o " +
            "WHERE o.buyMemberId = :buyMemberId " +
            "AND o.status = com.InsightMarket.domain.order.OrderStatus.PAID " +
            "ORDER BY o.createdAt DESC")
    Page<Orders> findMyOrders(
            @Param("buyMemberId") Long buyMemberId,
            Pageable pageable
    );



}
