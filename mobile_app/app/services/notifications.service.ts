import api from "./api";

export type AppNotification = {
  id: string;
  title: string;
  body: string;
  sent_at: string;
};

export async function getNotifications(
  limit = 50,
): Promise<AppNotification[]> {
  const response = await api.get<{
    success: boolean;
    data: AppNotification[];
  }>(`/notifications?limit=${limit}`);

  return response.data ?? [];
}

export async function getUnreadCount(): Promise<number> {
  const response = await api.get<{ unreadCount: number }>(
    "/notifications/unread/count",
  );
  return response.unreadCount ?? 0;
}
