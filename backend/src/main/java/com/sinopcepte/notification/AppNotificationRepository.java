package com.sinopcepte.notification;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface AppNotificationRepository extends JpaRepository<AppNotification, String> {

    @Query("select n from AppNotification n where n.recipientHandle = :handle or n.recipientHandle is null order by n.createdAt desc")
    List<AppNotification> findForUser(@Param("handle") String handle);

    @Modifying
    @Query("update AppNotification n set n.read = true where n.recipientHandle = :handle")
    void markAllReadForUser(@Param("handle") String handle);
}
