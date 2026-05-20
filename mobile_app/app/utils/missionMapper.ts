export type MissionCardData = {
  id: string;
  site: string;
  company: string;
  status: string;
  statusRaw: string;
  time: string;
  items: number;
  date: "today" | "other";
  address: string;
  raw: Record<string, unknown>;
};

export function formatStatusLabel(status?: string): string {
  const raw = (status || "pending").toString().toLowerCase();
  if (raw === "in-progress") return "In Progress";
  if (raw === "completed") return "Completed";
  if (raw === "pending") return "Pending";
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

export function mapMissionForCard(mission: Record<string, any>): MissionCardData {
  const site = mission.Site ?? mission.site;
  const scheduled = mission.scheduled_start_date
    ? new Date(mission.scheduled_start_date)
    : null;
  const today = new Date();
  const isToday =
    !!scheduled && scheduled.toDateString() === today.toDateString();
  const statusRaw = (mission.status || "pending").toString().toLowerCase();

  return {
    id: String(mission.id),
    site: site?.name || "Unknown site",
    company:
      mission.driver?.full_name ||
      mission.technician?.full_name ||
      "—",
    status: formatStatusLabel(statusRaw),
    statusRaw,
    time: scheduled ? scheduled.toLocaleDateString() : "",
    items: Array.isArray(mission.equipment_list)
      ? mission.equipment_list.length
      : 0,
    date: isToday ? "today" : "other",
    address: site?.address || "",
    raw: mission,
  };
}

export function formatDateTime(value?: string | Date | null): string {
  if (!value) return "—";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString();
}
