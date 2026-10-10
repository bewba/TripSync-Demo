import { TruckRecord } from "@/types/types";

export interface InventoryItem {
  itemName: string;
  itemQuantity: string | number;
  itemUnit: string;
}

export type Vehicle = TruckRecord;

export enum FuelType {
  Diesel = 'Diesel',
  Gasoline = 'Gasoline',
  Electric = 'Electric',
  Hybrid = 'Hybrid'
}

export interface fuelRequirements {
  distance: number;
  estimatedTotalFuel: number;
  finalFuelAmount: number;
  fuelPrice?: number;
}

export interface Location {
  name: string;
  order: number;
  lat: number;
  long: number;
}

export interface TripFormData {
  id?: string;
  requestInfo: {
    requestDate: string;
    requestTime: string;
    scheduledDeparture: string;
    travelPurpose: string;
    requestedBy: string;
    // checkedBy: string;
    // validatedBy: string;
    // approvedBy: string;
    notes: string;
  };
  locationInfo: {
    locations: Location[];
    truckId: string;
    truck: Vehicle;
    driverId?: string;
    driverName?: string;
    driver?: any;
    geofenceEnabled?: boolean;
    geofenceBuffer?: string;

    estDistanceRequired?: number[];
    applyToll?: boolean;
    waypoints?: [number, number][];
  };
  inventoryItems: InventoryItem[];
  fuelRequirement: fuelRequirements;
  status?: string;
  tripStart?: string[];
  tripEnd?: string[];
  estDistanceRequired?: number[];
  estimatedTripTime?: string[];
  distanceTravelled?: number[];
  actualTripTime?: string[];
  useToll?: boolean;
}