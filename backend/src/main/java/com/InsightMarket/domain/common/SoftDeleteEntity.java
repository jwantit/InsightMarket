package com.InsightMarket.domain.common;

import jakarta.persistence.Column;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.MappedSuperclass;
import lombok.Getter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

// [공통] 소프트삭제 (Base 포함)
@MappedSuperclass
@Getter
public abstract class SoftDeleteEntity extends BaseEntity {

    @Column(name="deleted_at")
    private LocalDateTime deletedAt;

    public void softDelete() { this.deletedAt = LocalDateTime.now(); }
    public void restore() { this.deletedAt = null; }
    public boolean isDeleted() { return deletedAt != null; }
}