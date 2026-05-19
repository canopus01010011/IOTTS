export type UserRole = "technician" | "driver";

export interface Driver {
  id: string;
  firstName: string;
  lastName: string;
}

export interface GPSDevice {
  GPS_ID: string;
  Device_serial_number: string;
  Battery_level: string;
  Device_status: string;
}

export interface Equipment {
  Eq_ID: string;
  Eq_type: string;
  Eq_Serial_number: string;
  Eq_model: string;
  Eq_qr_code: string;
  Eq_status: string;
}

export interface Site {
  Site_ID: string;
  Site_name: string;
  Site_address: string;
}

export interface Mission {
  Mission_ID: string;
  Mission_type: string;
  schedule_start: string;
  schedule_end: string;
  start_date: string;
  end_date: string;

  site: Site;
  driver: Driver;
  gps: GPSDevice;
  equipment: Equipment[];
}

export interface MissionResponse {
  success: boolean;
  data: Mission;
}