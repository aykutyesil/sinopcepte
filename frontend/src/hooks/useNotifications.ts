"use client";

import { useEffect, useState } from "react";
import { getNotifications, getUnreadCount, type AppNotification } from "@/lib/notifications";

export function useNotifications() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const update = () => {
      const list = getNotifications();
      setNotifications(list);
      setUnreadCount(getUnreadCount(list));
    };
    update();
    window.addEventListener("sinopcepte_notif_changed", update);
    return () => window.removeEventListener("sinopcepte_notif_changed", update);
  }, []);

  return { notifications, unreadCount };
}
