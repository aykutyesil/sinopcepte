package com.sinopcepte.taxi;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface TaxiLobbyRepository extends JpaRepository<TaxiLobby, String> {

    List<TaxiLobby> findAllByOrderByCreatedAtDesc();

    @Query("SELECT t FROM TaxiLobby t WHERE "
            + "(:destination IS NULL OR LOWER(t.destination) LIKE LOWER(CONCAT('%', :destination, '%'))) AND "
            + "(:status IS NULL OR t.status = :status) "
            + "ORDER BY t.createdAt DESC")
    List<TaxiLobby> searchLobbies(@Param("destination") String destination, @Param("status") String status);
}
