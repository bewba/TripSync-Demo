export interface TruckRecord {
  id: string;
  truck_id: string;
  truck_name: string;
  driver?: string;
  driverId?: string;
  fuel_efficiency: number;
  fuelEfficiency?: number;
  metric_type: 'km/L' | 'L/H';
  engine_type?: string;
  status: 'In Motion' | 'Assigned Trip' | 'Pending Trip Assignment' | 'Maintenance';
  plate_number?: string;
  created_at: string;
}

export interface Trip {
  trip_id: string;
  when: string;
  scheduled_departure?: string;
  vehicle_name: string;
  first_location: string;
  last_location: string;
  total_distance?: number;
  status?: string;
  isFlagged?: boolean;
  full_data?: any; // Contains the complete TripFormData for the detail modal
}

export interface TripSegment {
  trip_id: string;
  from: string;
  to: string;
  distance_km: number;
  trip_order: number;
  created_at: string;
  truck_id: string;
}

export interface ConsolidatedTrip {
  trip_id: string;
  total_distance: number;
  start_location: string;
  end_location: string;
  date: string;
  truck_id: string;
}

export interface Driver {
  id: string;
  username: string;
  status: 'Active Trip' | 'Pending Trip Assignment' | 'Assigned Trip' | 'Vacation' | string;
  first_name?: string;
  last_name?: string;
  email?: string;
  created_at?: string;
  full_name?: string;
  license_number?: string;
  phone_number?: string;
}