package com.sinopcepte.taxi;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TaxiLobbyMemberRepository extends JpaRepository<TaxiLobbyMember, Long> {

    List<TaxiLobbyMember> findByLobbyIdOrderByJoinedAtAsc(String lobbyId);

    boolean existsByLobbyIdAndUserHandle(String lobbyId, String userHandle);

    Optional<TaxiLobbyMember> findByLobbyIdAndUserHandle(String lobbyId, String userHandle);

    void deleteByLobbyIdAndUserHandle(String lobbyId, String userHandle);

    long countByLobbyId(String lobbyId);
}
