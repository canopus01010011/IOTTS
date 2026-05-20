import { useEffect, useState } from "react";
import {
  getNotifications,
  getUnreadCount,
  type AppNotification,
} from "@/app/services/notifications.service";

export function useNotifications() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const [items, count] = await Promise.all([
          getNotifications(),
          getUnreadCount(),
        ]);
        if (!active) return;
        setNotifications(items);
        setUnreadCount(count > 0 ? count : items.length);
      } catch (error) {
        console.error("Unable to load notifications", error);
      } finally {
        if (active) setLoading(false);
      }
    }

    load();

    return () => {
      active = false;
    };
  }, []);

  return { notifications, unreadCount, loading };
}
