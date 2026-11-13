package com.sinopcepte.catalog;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface ItemRepository extends JpaRepository<Item, String> {

    List<Item> findAllByOrderBySortOrderAscIdAsc();

    List<Item> findAllByCategoryOrderBySortOrderAscIdAsc(String category);

    @Query("select coalesce(max(i.sortOrder), -1) from Item i")
    int maxSortOrder();
}
