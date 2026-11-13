package com.sinopcepte.taxi;

import java.time.OffsetDateTime;
import java.util.List;

public record TaxiLobbyDto(
    String id,
    String hostHandle,
    String hostName,
    String hostAvatar,
    String hostPhone,
    String destination,
    String departurePoint,
    String departureTime,
    int totalSeats,
    int occupiedSeats,
    String estimatedFare,
    String note,
    String status,
    OffsetDateTime createdAt,
    List<TaxiLobbyMemberDto> members,
    boolean joinedByMe,
    boolean isHost
) {
    public record TaxiLobbyMemberDto(
        Long id,
        String lobbyId,
        String userHandle,
        String userName,
        String userAvatar,
        String userPhone,
        OffsetDateTime joinedAt
    ) {
        public static TaxiLobbyMemberDto fromEntity(TaxiLobbyMember member) {
            return new TaxiLobbyMemberDto(
                member.getId(),
                member.getLobbyId(),
                member.getUserHandle(),
                member.getUserName(),
                member.getUserAvatar(),
                member.getUserPhone(),
                member.getJoinedAt()
            );
        }
    }

    public static TaxiLobbyDto fromEntity(
        TaxiLobby lobby,
        List<TaxiLobbyMember> members,
        boolean joinedByMe,
        boolean isHost
    ) {
        List<TaxiLobbyMemberDto> memberDtos = members != null
            ? members.stream().map(TaxiLobbyMemberDto::fromEntity).toList()
            : List.of();

        return new TaxiLobbyDto(
            lobby.getId(),
            lobby.getHostHandle(),
            lobby.getHostName(),
            lobby.getHostAvatar(),
            lobby.getHostPhone(),
            lobby.getDestination(),
            lobby.getDeparturePoint(),
            lobby.getDepartureTime(),
            lobby.getTotalSeats(),
            lobby.getOccupiedSeats(),
            lobby.getEstimatedFare(),
            lobby.getNote(),
            lobby.getStatus(),
            lobby.getCreatedAt(),
            memberDtos,
            joinedByMe,
            isHost
        );
    }
}
