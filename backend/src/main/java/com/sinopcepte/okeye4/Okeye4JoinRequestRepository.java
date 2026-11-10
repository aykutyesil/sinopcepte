package com.sinopcepte.okeye4;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface Okeye4JoinRequestRepository extends JpaRepository<Okeye4JoinRequest, String> {
    List<Okeye4JoinRequest> findByLobbyIdOrderByCreatedAtAsc(String lobbyId);
    List<Okeye4JoinRequest> findByApplicantHandleOrderByCreatedAtDesc(String applicantHandle);
}
