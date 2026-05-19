import { Truck, Wrench } from "lucide-react-native";

export const ROLES = [
  {
    id: "technician",
    label: "Technician",
    icon: Wrench,
    desc: "Install & manage equipment",
  },
  {
    id: "driver",
    label: "Driver",
    icon: Truck,
    desc: "Deliver telecom equipment",
  },
] as const;

export type Role = (typeof ROLES)[number]["id"];
