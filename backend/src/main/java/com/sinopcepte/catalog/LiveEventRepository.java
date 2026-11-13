package com.sinopcepte.catalog;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface LiveEventRepository extends JpaRepository<LiveEvent, String> {

    List<LiveEvent> findAllByOrderBySortOrderAscIdAsc();

    @Query("select coalesce(max(e.sortOrder), -1) from LiveEvent e")
    int maxSortOrder();
}
