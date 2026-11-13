package com.sinopcepte.okeye4;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface Okeye4LobbyRepository extends JpaRepository<Okeye4Lobby, String> {
    List<Okeye4Lobby> findAllByOrderByCreatedAtDesc();
    List<Okeye4Lobby> findByHostHandleOrderByCreatedAtDesc(String hostHandle);
}
