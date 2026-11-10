package com.sinopcepte.notification;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.sinopcepte.auth.AppUser;
import com.sinopcepte.web.ForbiddenException;
import com.sinopcepte.web.NotFoundException;

@Service
public class NotificationService {

    private final AppNotificationRepository notifications;

    public NotificationService(AppNotificationRepository notifications) {
        this.notifications = notifications;
    }

    public List<AppNotification> listForUser(AppUser user) {
        return notifications.findForUser(user.getUsername());
    }

    @Transactional
    public AppNotification markAsRead(AppUser user, String id) {
        AppNotification notif = notifications.findById(id)
                .orElseThrow(() -> new NotFoundException("Bildirim bulunamadı"));

        if (notif.getRecipientHandle() != null && !notif.getRecipientHandle().equalsIgnoreCase(user.getUsername())) {
            throw new ForbiddenException("Bu bildirimi güncelleme yetkiniz yok");
        }

        notif.setRead(true);
        return notifications.save(notif);
    }

    @Transactional
    public void markAllRead(AppUser user) {
        notifications.markAllReadForUser(user.getUsername());
    }

    @Transactional
    public void delete(AppUser user, String id) {
        AppNotification notif = notifications.findById(id)
                .orElseThrow(() -> new NotFoundException("Bildirim bulunamadı"));

        if (notif.getRecipientHandle() != null && !notif.getRecipientHandle().equalsIgnoreCase(user.getUsername())) {
            throw new ForbiddenException("Bu bildirimi silme yetkiniz yok");
        }

        notifications.delete(notif);
    }
}
