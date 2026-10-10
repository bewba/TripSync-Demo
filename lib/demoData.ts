import type { TruckRecord, Driver, Trip } from '../types/types';
import type { TripFormData } from '../types/auth/plan-trip/trip-info';

export interface DemoLocation {
  id: string;
  name: string;
  lat: number;
  long: number;
  order?: number;
  created_at: string;
}

export interface DemoUser {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Dispatcher' | 'Driver';
  avatar?: string;
}

export interface DemoLog {
  id: string;
  created_at: string;
  trip_id: string | null;
  message: string;
}

// 8 Major Logistics Hubs in the Philippines
export const INITIAL_LOCATIONS: DemoLocation[] = [
  {
    id: 'loc-1',
    name: 'Manila North Harbor Terminal',
    lat: 14.5995,
    long: 120.9842,
    created_at: '2026-08-01T08:00:00.000Z',
  },
  {
    id: 'loc-2',
    name: 'Batangas International Port & Depot',
    lat: 13.7565,
    long: 121.0583,
    created_at: '2026-08-01T08:00:00.000Z',
  },
  {
    id: 'loc-3',
    name: 'Clark Logistics Hub, Pampanga',
    lat: 15.1856,
    long: 120.5598,
    created_at: '2026-08-01T08:00:00.000Z',
  },
  {
    id: 'loc-4',
    name: 'Subic Bay Freeport Terminal, Zambales',
    lat: 14.8219,
    long: 120.2831,
    created_at: '2026-08-01T08:00:00.000Z',
  },
  {
    id: 'loc-5',
    name: 'Cavite Gateway Terminal, Tanza',
    lat: 14.3942,
    long: 120.8524,
    created_at: '2026-08-01T08:00:00.000Z',
  },
  {
    id: 'loc-6',
    name: 'Laguna Technopark Hub, Santa Rosa',
    lat: 14.2816,
    long: 121.0772,
    created_at: '2026-08-01T08:00:00.000Z',
  },
  {
    id: 'loc-7',
    name: 'Bulacan Bulk Terminal, Marilao',
    lat: 14.7578,
    long: 120.9575,
    created_at: '2026-08-01T08:00:00.000Z',
  },
  {
    id: 'loc-8',
    name: 'Baguio Mountain Depot, Benguet',
    lat: 16.4023,
    long: 120.5960,
    created_at: '2026-08-01T08:00:00.000Z',
  },
];

// 10 Drivers
export const INITIAL_DRIVERS: Driver[] = [
  {
    id: 'drv-101',
    username: 'jdelacruz',
    full_name: 'Juan dela Cruz',
    first_name: 'Juan',
    last_name: 'dela Cruz',
    email: 'juan.delacruz@demofleet.ph',
    status: 'In Motion',
    license_number: 'N01-14-098231',
    phone_number: '+63 917 123 4567',
    created_at: '2026-01-15T09:00:00.000Z',
  },
  {
    id: 'drv-102',
    username: 'rsantos',
    full_name: 'Ricardo Santos',
    first_name: 'Ricardo',
    last_name: 'Santos',
    email: 'ricardo.santos@demofleet.ph',
    status: 'In Motion',
    license_number: 'N02-18-044211',
    phone_number: '+63 918 234 5678',
    created_at: '2026-01-20T09:00:00.000Z',
  },
  {
    id: 'drv-103',
    username: 'eramos',
    full_name: 'Eduardo Ramos',
    first_name: 'Eduardo',
    last_name: 'Ramos',
    email: 'eduardo.ramos@demofleet.ph',
    status: 'In Motion',
    license_number: 'N03-16-077543',
    phone_number: '+63 919 345 6789',
    created_at: '2026-02-01T09:00:00.000Z',
  },
  {
    id: 'drv-104',
    username: 'dreyes',
    full_name: 'Danilo Reyes',
    first_name: 'Danilo',
    last_name: 'Reyes',
    email: 'danilo.reyes@demofleet.ph',
    status: 'In Motion',
    license_number: 'N01-19-012984',
    phone_number: '+63 920 456 7890',
    created_at: '2026-02-10T09:00:00.000Z',
  },
  {
    id: 'drv-105',
    username: 'amendoza',
    full_name: 'Arnel Mendoza',
    first_name: 'Arnel',
    last_name: 'Mendoza',
    email: 'arnel.mendoza@demofleet.ph',
    status: 'In Motion',
    license_number: 'N02-21-088322',
    phone_number: '+63 921 567 8901',
    created_at: '2026-03-01T09:00:00.000Z',
  },
  {
    id: 'drv-106',
    username: 'mbautista',
    full_name: 'Mark Bautista',
    first_name: 'Mark',
    last_name: 'Bautista',
    email: 'mark.bautista@demofleet.ph',
    status: 'In Motion',
    license_number: 'N01-20-033190',
    phone_number: '+63 922 678 9012',
    created_at: '2026-03-15T09:00:00.000Z',
  },
  {
    id: 'drv-107',
    username: 'cgomez',
    full_name: 'Carlos Gomez',
    first_name: 'Carlos',
    last_name: 'Gomez',
    email: 'carlos.gomez@demofleet.ph',
    status: 'Pending Trip Assignment',
    license_number: 'N03-17-099412',
    phone_number: '+63 923 789 0123',
    created_at: '2026-04-01T09:00:00.000Z',
  },
  {
    id: 'drv-108',
    username: 'rdizon',
    full_name: 'Roberto Dizon',
    first_name: 'Roberto',
    last_name: 'Dizon',
    email: 'roberto.dizon@demofleet.ph',
    status: 'Pending Trip Assignment',
    license_number: 'N02-15-066782',
    phone_number: '+63 924 890 1234',
    created_at: '2026-04-12T09:00:00.000Z',
  },
  {
    id: 'drv-109',
    username: 'amorales',
    full_name: 'Antonio Morales',
    first_name: 'Antonio',
    last_name: 'Morales',
    email: 'antonio.morales@demofleet.ph',
    status: 'Pending Trip Assignment',
    license_number: 'N01-22-044199',
    phone_number: '+63 925 901 2345',
    created_at: '2026-05-01T09:00:00.000Z',
  },
  {
    id: 'drv-110',
    username: 'etorres',
    full_name: 'Elena Torres',
    first_name: 'Elena',
    last_name: 'Torres',
    email: 'elena.torres@demofleet.ph',
    status: 'Vacation',
    license_number: 'N02-23-011883',
    phone_number: '+63 926 012 3456',
    created_at: '2026-05-15T09:00:00.000Z',
  },
  {
    id: 'drv-111',
    username: 'msantos',
    full_name: 'Manuel Santos',
    first_name: 'Manuel',
    last_name: 'Santos',
    email: 'manuel.santos@demofleet.ph',
    status: 'Pending Trip Assignment',
    license_number: 'N01-19-077421',
    phone_number: '+63 927 123 4567',
    created_at: '2026-06-01T09:00:00.000Z',
  },
  {
    id: 'drv-112',
    username: 'enavarro',
    full_name: 'Eduardo Navarro',
    first_name: 'Eduardo',
    last_name: 'Navarro',
    email: 'eduardo.navarro@demofleet.ph',
    status: 'Pending Trip Assignment',
    license_number: 'N02-18-033912',
    phone_number: '+63 928 234 5678',
    created_at: '2026-06-10T09:00:00.000Z',
  },
  {
    id: 'drv-113',
    username: 'fcruz',
    full_name: 'Ferdinand Cruz',
    first_name: 'Ferdinand',
    last_name: 'Cruz',
    email: 'ferdinand.cruz@demofleet.ph',
    status: 'Pending Trip Assignment',
    license_number: 'N03-21-055182',
    phone_number: '+63 929 345 6789',
    created_at: '2026-06-15T09:00:00.000Z',
  },
  {
    id: 'drv-114',
    username: 'jvillanueva',
    full_name: 'Jaime Villanueva',
    first_name: 'Jaime',
    last_name: 'Villanueva',
    email: 'jaime.villanueva@demofleet.ph',
    status: 'Pending Trip Assignment',
    license_number: 'N01-20-088219',
    phone_number: '+63 930 456 7890',
    created_at: '2026-07-01T09:00:00.000Z',
  },
  {
    id: 'drv-115',
    username: 'ralcantara',
    full_name: 'Ramon Alcantara',
    first_name: 'Ramon',
    last_name: 'Alcantara',
    email: 'ramon.alcantara@demofleet.ph',
    status: 'Pending Trip Assignment',
    license_number: 'N02-17-066491',
    phone_number: '+63 931 567 8901',
    created_at: '2026-07-10T09:00:00.000Z',
  },
  {
    id: 'drv-116',
    username: 'gsoriano',
    full_name: 'Gilbert Soriano',
    first_name: 'Gilbert',
    last_name: 'Soriano',
    email: 'gilbert.soriano@demofleet.ph',
    status: 'Pending Trip Assignment',
    license_number: 'N03-22-012903',
    phone_number: '+63 932 678 9012',
    created_at: '2026-07-20T09:00:00.000Z',
  },
];

// Fleet Vehicles
export const INITIAL_VEHICLES: TruckRecord[] = [
  {
    id: 'TRK-101',
    truck_id: 'TRK-101',
    truck_name: 'Isuzu Giga Heavy Duty 10-Wheeler',
    driver: 'jdelacruz',
    driverId: 'drv-101',
    fuel_efficiency: 3.4,
    metric_type: 'km/L',
    engine_type: 'Diesel 6UZ1-TCG',
    status: 'In Motion',
    plate_number: 'NBD-8891',
    created_at: '2026-01-10T08:00:00.000Z',
  },
  {
    id: 'TRK-102',
    truck_id: 'TRK-102',
    truck_name: 'Hino 700 Heavy Fuel Tanker',
    driver: 'rsantos',
    driverId: 'drv-102',
    fuel_efficiency: 3.1,
    metric_type: 'km/L',
    engine_type: 'Diesel E13C',
    status: 'In Motion',
    plate_number: 'CAE-4521',
    created_at: '2026-01-12T08:00:00.000Z',
  },
  {
    id: 'TRK-103',
    truck_id: 'TRK-103',
    truck_name: 'Fuso Canter 6-Wheeler Closed Van',
    driver: 'eramos',
    driverId: 'drv-103',
    fuel_efficiency: 6.8,
    metric_type: 'km/L',
    engine_type: 'Diesel 4P10',
    status: 'In Motion',
    plate_number: 'DAF-7812',
    created_at: '2026-01-15T08:00:00.000Z',
  },
  {
    id: 'TRK-104',
    truck_id: 'TRK-104',
    truck_name: 'UD Quon Tractor Prime Mover',
    driver: 'dreyes',
    driverId: 'drv-104',
    fuel_efficiency: 2.9,
    metric_type: 'km/L',
    engine_type: 'Diesel GH11',
    status: 'In Motion',
    plate_number: 'NDB-3094',
    created_at: '2026-01-18T08:00:00.000Z',
  },
  {
    id: 'TRK-105',
    truck_id: 'TRK-105',
    truck_name: 'Isuzu Forward FTR Wing Van',
    driver: 'amendoza',
    driverId: 'drv-105',
    fuel_efficiency: 5.2,
    metric_type: 'km/L',
    engine_type: 'Diesel 4HK1',
    status: 'In Motion',
    plate_number: 'BAB-6120',
    created_at: '2026-01-20T08:00:00.000Z',
  },
  {
    id: 'TRK-106',
    truck_id: 'TRK-106',
    truck_name: 'Hino 300 Series Light Cargo Truck',
    driver: 'mbautista',
    driverId: 'drv-106',
    fuel_efficiency: 7.5,
    metric_type: 'km/L',
    engine_type: 'Diesel N04C',
    status: 'In Motion',
    plate_number: 'NEB-1192',
    created_at: '2026-02-01T08:00:00.000Z',
  },
  {
    id: 'TRK-107',
    truck_id: 'TRK-107',
    truck_name: 'Fuso Super Great 10-Wheeler Dump Truck',
    driver: 'Unassigned',
    driverId: undefined,
    fuel_efficiency: 3.2,
    metric_type: 'km/L',
    engine_type: 'Diesel 6R20',
    status: 'Pending Trip Assignment',
    plate_number: 'CBA-9023',
    created_at: '2026-02-05T08:00:00.000Z',
  },
  {
    id: 'TRK-108',
    truck_id: 'TRK-108',
    truck_name: 'Isuzu Elf Dropside 4-Wheeler',
    driver: 'Unassigned',
    driverId: undefined,
    fuel_efficiency: 8.2,
    metric_type: 'km/L',
    engine_type: 'Diesel 4JJ1',
    status: 'Pending Trip Assignment',
    plate_number: 'NFA-5632',
    created_at: '2026-02-10T08:00:00.000Z',
  },
  {
    id: 'TRK-109',
    truck_id: 'TRK-109',
    truck_name: 'Scania R500 Heavy Prime Mover',
    driver: 'Unassigned',
    driverId: undefined,
    fuel_efficiency: 2.7,
    metric_type: 'km/L',
    engine_type: 'Diesel DC13',
    status: 'Pending Trip Assignment',
    plate_number: 'NDR-7119',
    created_at: '2026-02-15T08:00:00.000Z',
  },
  {
    id: 'TRK-110',
    truck_id: 'TRK-110',
    truck_name: 'Hino 500 Medium Duty Refrigerated Van',
    driver: 'Unassigned',
    driverId: undefined,
    fuel_efficiency: 4.8,
    metric_type: 'km/L',
    engine_type: 'Diesel J08E',
    status: 'Pending Trip Assignment',
    plate_number: 'DAE-3298',
    created_at: '2026-02-20T08:00:00.000Z',
  },
  {
    id: 'TRK-111',
    truck_id: 'TRK-111',
    truck_name: 'Isuzu Giga Heavy Tipper 8x4',
    driver: 'Unassigned',
    driverId: undefined,
    fuel_efficiency: 2.5,
    metric_type: 'km/L',
    engine_type: 'Diesel 6WG1',
    status: 'Maintenance',
    plate_number: 'NGA-9912',
    created_at: '2026-03-01T08:00:00.000Z',
  },
  {
    id: 'TRK-112',
    truck_id: 'TRK-112',
    truck_name: 'Fuso Fighter Medium Duty Cargo',
    driver: 'Unassigned',
    driverId: undefined,
    fuel_efficiency: 5.6,
    metric_type: 'km/L',
    engine_type: 'Diesel 6M60',
    status: 'Maintenance',
    plate_number: 'BAC-8761',
    created_at: '2026-03-05T08:00:00.000Z',
  },
  {
    id: 'TRK-113',
    truck_id: 'TRK-113',
    truck_name: 'Fuso Canter 4-Wheeler Aluminum Van',
    driver: 'Unassigned',
    driverId: undefined,
    fuel_efficiency: 8.5,
    metric_type: 'km/L',
    engine_type: 'Diesel 4P10-T2',
    status: 'Pending Trip Assignment',
    plate_number: 'NBC-5129',
    created_at: '2026-03-10T08:00:00.000Z',
  },
  {
    id: 'TRK-114',
    truck_id: 'TRK-114',
    truck_name: 'Isuzu Forward 6-Wheeler Dropside',
    driver: 'Unassigned',
    driverId: undefined,
    fuel_efficiency: 5.8,
    metric_type: 'km/L',
    engine_type: 'Diesel 6HK1-TCS',
    status: 'Pending Trip Assignment',
    plate_number: 'CAE-8734',
    created_at: '2026-03-12T08:00:00.000Z',
  },
  {
    id: 'TRK-115',
    truck_id: 'TRK-115',
    truck_name: 'Hino 500 10-Wheeler Heavy Cargo',
    driver: 'Unassigned',
    driverId: undefined,
    fuel_efficiency: 3.6,
    metric_type: 'km/L',
    engine_type: 'Diesel J08E-WD',
    status: 'Pending Trip Assignment',
    plate_number: 'DAA-4921',
    created_at: '2026-03-15T08:00:00.000Z',
  },
  {
    id: 'TRK-116',
    truck_id: 'TRK-116',
    truck_name: 'UD Croner 6-Wheeler Refrigerated Truck',
    driver: 'Unassigned',
    driverId: undefined,
    fuel_efficiency: 5.1,
    metric_type: 'km/L',
    engine_type: 'Diesel GH5E',
    status: 'Pending Trip Assignment',
    plate_number: 'NDE-6218',
    created_at: '2026-03-18T08:00:00.000Z',
  },
  {
    id: 'TRK-117',
    truck_id: 'TRK-117',
    truck_name: 'Scania P360 Heavy Duty Tractor',
    driver: 'Unassigned',
    driverId: undefined,
    fuel_efficiency: 2.8,
    metric_type: 'km/L',
    engine_type: 'Diesel DC09',
    status: 'Pending Trip Assignment',
    plate_number: 'BAC-3341',
    created_at: '2026-03-20T08:00:00.000Z',
  },
  {
    id: 'TRK-118',
    truck_id: 'TRK-118',
    truck_name: 'Isuzu Traviz Utility Cargo Van',
    driver: 'Unassigned',
    driverId: undefined,
    fuel_efficiency: 11.2,
    metric_type: 'km/L',
    engine_type: 'Diesel 4JA1-CR',
    status: 'Pending Trip Assignment',
    plate_number: 'NBD-9042',
    created_at: '2026-03-22T08:00:00.000Z',
  },
  {
    id: 'TRK-119',
    truck_id: 'TRK-119',
    truck_name: 'Fuso Fighter 6-Wheeler Wing Van',
    driver: 'Unassigned',
    driverId: undefined,
    fuel_efficiency: 4.9,
    metric_type: 'km/L',
    engine_type: 'Diesel 6M60-1AT1',
    status: 'Pending Trip Assignment',
    plate_number: 'CAB-6712',
    created_at: '2026-03-25T08:00:00.000Z',
  },
  {
    id: 'TRK-120',
    truck_id: 'TRK-120',
    truck_name: 'Hino 300 4-Wheeler Box Truck',
    driver: 'Unassigned',
    driverId: undefined,
    fuel_efficiency: 7.8,
    metric_type: 'km/L',
    engine_type: 'Diesel N04C-VK',
    status: 'Pending Trip Assignment',
    plate_number: 'NBE-4109',
    created_at: '2026-03-28T08:00:00.000Z',
  },
];

import realRoutesJson from './realRoutes.json';

// True Highway Road Geometry Routes (TomTom Road-Level Routing)
export const ROUTE_MANILA_BATANGAS: [number, number][] = realRoutesJson['TRP-101'] as [number, number][];
export const ROUTE_CLARK_SUBIC: [number, number][] = realRoutesJson['TRP-102'] as [number, number][];
export const ROUTE_LAGUNA_CAVITE: [number, number][] = realRoutesJson['TRP-103'] as [number, number][];
export const ROUTE_BULACAN_MANILA: [number, number][] = realRoutesJson['TRP-104'] as [number, number][];
export const ROUTE_MANILA_BAGUIO: [number, number][] = realRoutesJson['TRP-105'] as [number, number][];
export const ROUTE_SUBIC_CLARK: [number, number][] = [...ROUTE_CLARK_SUBIC].reverse();

export const PRECONFIGURED_ROUTES: Record<string, [number, number][]> = {
  'TRP-101': ROUTE_MANILA_BATANGAS,
  'TRP-102': ROUTE_CLARK_SUBIC,
  'TRP-103': ROUTE_LAGUNA_CAVITE,
  'TRP-104': ROUTE_BULACAN_MANILA,
  'TRP-105': ROUTE_MANILA_BAGUIO,
  'TRP-106': ROUTE_SUBIC_CLARK,
};

// 5 Active Trips
export const INITIAL_ACTIVE_TRIPS: any[] = [
  {
    id: 'TRP-101',
    status: 'Trip in progress',
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    request_info: {
      requestDate: new Date().toISOString().split('T')[0],
      requestTime: '06:00',
      scheduledDeparture: '07:00 AM',
      travelPurpose: 'Bulk Container Distribution to Calabarzon Ports',
      requestedBy: 'Transport Operations Team',
      notes: 'Priority sea cargo dispatch. Handle with care.',
    },
    location_info: {
      truckId: 'TRK-101',
      truck: INITIAL_VEHICLES[0],
      driverId: 'drv-101',
      driverName: 'Juan dela Cruz',
      driver: INITIAL_DRIVERS[0],
      locations: [
        { name: 'Manila North Harbor Terminal', order: 1, lat: 14.5995, long: 120.9842 },
        { name: 'Batangas International Port & Depot', order: 2, lat: 13.7565, long: 121.0583 },
      ],
      estDistanceRequired: [108.5],
      applyToll: true,
    },
    inventory_items: [
      { itemName: '40ft Standard Shipping Container', itemQuantity: 2, itemUnit: 'units' },
      { itemName: 'Industrial Machine Spares', itemQuantity: 450, itemUnit: 'kg' },
    ],
    fuel_requirement: {
      distance: 108.5,
      estimatedTotalFuel: 31.9,
      finalFuelAmount: 35.0,
      fuelPrice: 62.5,
    },
    distance_travelled: [58.2],
    estimated_trip_time: ['2h 15m'],
    actual_trip_time: ['1h 10m'],
    use_toll: true,
  },
  {
    id: 'TRP-102',
    status: 'Trip in progress',
    created_at: new Date(Date.now() - 3600000 * 3).toISOString(),
    request_info: {
      requestDate: new Date().toISOString().split('T')[0],
      requestTime: '07:30',
      scheduledDeparture: '08:00 AM',
      travelPurpose: 'Aviation Fuel Supply Transfer',
      requestedBy: 'Fuel Logistics Department',
      notes: 'Direct delivery to Subic Bay Aviation Depot via SCTEX.',
    },
    location_info: {
      truckId: 'TRK-102',
      truck: INITIAL_VEHICLES[1],
      driverId: 'drv-102',
      driverName: 'Ricardo Santos',
      driver: INITIAL_DRIVERS[1],
      locations: [
        { name: 'Clark Logistics Hub, Pampanga', order: 1, lat: 15.1856, long: 120.5598 },
        { name: 'Subic Bay Freeport Terminal, Zambales', order: 2, lat: 14.8219, long: 120.2831 },
      ],
      estDistanceRequired: [78.2],
      applyToll: true,
    },
    inventory_items: [
      { itemName: 'Jet-A1 Aviation Kerosene', itemQuantity: 18000, itemUnit: 'L' },
    ],
    fuel_requirement: {
      distance: 78.2,
      estimatedTotalFuel: 25.2,
      finalFuelAmount: 28.0,
      fuelPrice: 62.5,
    },
    distance_travelled: [42.1],
    estimated_trip_time: ['1h 45m'],
    actual_trip_time: ['55m'],
    use_toll: true,
  },
  {
    id: 'TRP-103',
    status: 'Trip in progress',
    created_at: new Date(Date.now() - 3600000 * 1.5).toISOString(),
    request_info: {
      requestDate: new Date().toISOString().split('T')[0],
      requestTime: '09:00',
      scheduledDeparture: '09:30 AM',
      travelPurpose: 'Electronics Component Delivery to Cavite Export Zone',
      requestedBy: 'Global Semiconductor Logistics',
      notes: 'Temperature-controlled cargo. Maintain 22°C ambient.',
    },
    location_info: {
      truckId: 'TRK-103',
      truck: INITIAL_VEHICLES[2],
      driverId: 'drv-103',
      driverName: 'Eduardo Ramos',
      driver: INITIAL_DRIVERS[2],
      locations: [
        { name: 'Laguna Technopark Hub, Santa Rosa', order: 1, lat: 14.2816, long: 121.0772 },
        { name: 'Cavite Gateway Terminal, Tanza', order: 2, lat: 14.3942, long: 120.8524 },
      ],
      estDistanceRequired: [42.6],
      applyToll: true,
    },
    inventory_items: [
      { itemName: 'PCB Microcontrollers Batch #881', itemQuantity: 3200, itemUnit: 'pcs' },
      { itemName: 'Precision Sensors Box', itemQuantity: 15, itemUnit: 'crates' },
    ],
    fuel_requirement: {
      distance: 42.6,
      estimatedTotalFuel: 6.3,
      finalFuelAmount: 8.0,
      fuelPrice: 62.5,
    },
    distance_travelled: [18.4],
    estimated_trip_time: ['1h 10m'],
    actual_trip_time: ['32m'],
    use_toll: true,
  },
  {
    id: 'TRP-104',
    status: 'Trip in progress',
    created_at: new Date(Date.now() - 3600000 * 1).toISOString(),
    request_info: {
      requestDate: new Date().toISOString().split('T')[0],
      requestTime: '10:00',
      scheduledDeparture: '10:30 AM',
      travelPurpose: 'Bulk Grains and Dry Food Transport to Manila Port',
      requestedBy: 'AgriLogistics Distribution',
      notes: 'Ensure tarpaulin cover is tightly fastened.',
    },
    location_info: {
      truckId: 'TRK-104',
      truck: INITIAL_VEHICLES[3],
      driverId: 'drv-104',
      driverName: 'Danilo Reyes',
      driver: INITIAL_DRIVERS[3],
      locations: [
        { name: 'Bulacan Bulk Terminal, Marilao', order: 1, lat: 14.7578, long: 120.9575 },
        { name: 'Manila North Harbor Terminal', order: 2, lat: 14.5995, long: 120.9842 },
      ],
      estDistanceRequired: [26.4],
      applyToll: true,
    },
    inventory_items: [
      { itemName: 'Premium Jasmine Rice Sacks', itemQuantity: 400, itemUnit: 'sacks' },
      { itemName: 'Flour Sacks 25kg', itemQuantity: 250, itemUnit: 'sacks' },
    ],
    fuel_requirement: {
      distance: 26.4,
      estimatedTotalFuel: 9.1,
      finalFuelAmount: 11.0,
      fuelPrice: 62.5,
    },
    distance_travelled: [12.0],
    estimated_trip_time: ['50m'],
    actual_trip_time: ['24m'],
    use_toll: true,
  },
  {
    id: 'TRP-105',
    status: 'Trip in progress',
    created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
    request_info: {
      requestDate: new Date().toISOString().split('T')[0],
      requestTime: '05:00',
      scheduledDeparture: '05:30 AM',
      travelPurpose: 'Highland FMCG Supermarket Distribution',
      requestedBy: 'National Retail Distribution Center',
      notes: 'Long haul. Regular rest stop at TPLEX Tarlac.',
    },
    location_info: {
      truckId: 'TRK-105',
      truck: INITIAL_VEHICLES[4],
      driverId: 'drv-105',
      driverName: 'Arnel Mendoza',
      driver: INITIAL_DRIVERS[4],
      locations: [
        { name: 'Manila North Harbor Terminal', order: 1, lat: 14.5995, long: 120.9842 },
        { name: 'Baguio Mountain Depot, Benguet', order: 2, lat: 16.4023, long: 120.5960 },
      ],
      estDistanceRequired: [245.8],
      applyToll: true,
    },
    inventory_items: [
      { itemName: 'Consumer Packaged Goods Assorted', itemQuantity: 850, itemUnit: 'cartons' },
      { itemName: 'Beverages & Drinking Water', itemQuantity: 120, itemUnit: 'cases' },
    ],
    fuel_requirement: {
      distance: 245.8,
      estimatedTotalFuel: 47.3,
      finalFuelAmount: 52.0,
      fuelPrice: 62.5,
    },
    distance_travelled: [142.5],
    estimated_trip_time: ['5h 30m'],
    actual_trip_time: ['3h 15m'],
    use_toll: true,
  },
  {
    id: 'TRP-106',
    status: 'Trip in progress',
    created_at: new Date(Date.now() - 3600000 * 2.5).toISOString(),
    request_info: {
      requestDate: new Date().toISOString().split('T')[0],
      requestTime: '08:30',
      scheduledDeparture: '09:00 AM',
      travelPurpose: 'Pharmaceutical Supplies Distribution to Regional Depots',
      requestedBy: 'Healthcare Logistics PH',
      notes: 'Critical medical cargo. Secure temperature loggers.',
    },
    location_info: {
      truckId: 'TRK-106',
      truck: INITIAL_VEHICLES[5],
      driverId: 'drv-106',
      driverName: 'Mark Bautista',
      driver: INITIAL_DRIVERS[5],
      locations: [
        { name: 'Subic Bay Freeport Terminal, Zambales', order: 1, lat: 14.8219, long: 120.2831 },
        { name: 'Clark Logistics Hub, Pampanga', order: 2, lat: 15.1856, long: 120.5598 },
      ],
      estDistanceRequired: [78.2],
      applyToll: true,
    },
    inventory_items: [
      { itemName: 'Medical Cold-Chain Vaccines', itemQuantity: 1200, itemUnit: 'vials' },
      { itemName: 'Surgical Disposables Pack', itemQuantity: 30, itemUnit: 'cartons' },
    ],
    fuel_requirement: {
      distance: 78.2,
      estimatedTotalFuel: 10.4,
      finalFuelAmount: 12.0,
      fuelPrice: 62.5,
    },
    distance_travelled: [35.0],
    estimated_trip_time: ['1h 40m'],
    actual_trip_time: ['48m'],
    use_toll: true,
  },
];

export type FlagCode = 0 | 1;

export interface DriverFlag {
  id: string;
  trip_id: string;
  driver_id: string;
  leg: number;
  code: FlagCode; // 0: Stoppage, 1: GPS Signal Dropout
  duration: number | null; // minutes
  lat: number;
  long: number;
  created_at: string;
}

export const INITIAL_DRIVER_FLAGS: Record<string, DriverFlag[]> = {
  // ── Active Trips ────────────────────────────────────────────────────────────
  'TRP-101': [
    {
      id: 'flg-101-1', trip_id: 'TRP-101', driver_id: 'drv-101', leg: 1,
      code: 0, duration: 18,
      lat: 14.2125, long: 121.1278,
      created_at: new Date(Date.now() - 3600000 * 1.2).toISOString(),
    },
    {
      id: 'flg-101-2', trip_id: 'TRP-101', driver_id: 'drv-101', leg: 1,
      code: 1, duration: 12,
      lat: 14.195, long: 121.139,
      created_at: new Date(Date.now() - 3600000 * 0.8).toISOString(),
    },
  ],
  'TRP-102': [
    {
      id: 'flg-102-1', trip_id: 'TRP-102', driver_id: 'drv-102', leg: 1,
      code: 1, duration: 22,
      lat: 15.0614, long: 120.4882,
      created_at: new Date(Date.now() - 3600000 * 2.1).toISOString(),
    },
    {
      id: 'flg-102-2', trip_id: 'TRP-102', driver_id: 'drv-102', leg: 1,
      code: 0, duration: 15,
      lat: 14.9452, long: 120.3741,
      created_at: new Date(Date.now() - 3600000 * 1.4).toISOString(),
    },
  ],
  'TRP-103': [
    {
      id: 'flg-103-1', trip_id: 'TRP-103', driver_id: 'drv-103', leg: 1,
      code: 0, duration: 28,
      lat: 14.3381, long: 121.0022,
      created_at: new Date(Date.now() - 3600000 * 1.0).toISOString(),
    },
  ],
  'TRP-104': [
    {
      id: 'flg-104-1', trip_id: 'TRP-104', driver_id: 'drv-104', leg: 1,
      code: 1, duration: 19,
      lat: 14.7021, long: 120.9694,
      created_at: new Date(Date.now() - 3600000 * 0.7).toISOString(),
    },
    {
      id: 'flg-104-2', trip_id: 'TRP-104', driver_id: 'drv-104', leg: 1,
      code: 0, duration: 11,
      lat: 14.6538, long: 120.9753,
      created_at: new Date(Date.now() - 3600000 * 0.4).toISOString(),
    },
  ],
  'TRP-105': [
    {
      id: 'flg-105-1', trip_id: 'TRP-105', driver_id: 'drv-105', leg: 1,
      code: 0, duration: 35,
      lat: 15.485, long: 120.621,
      created_at: new Date(Date.now() - 3600000 * 3.2).toISOString(),
    },
    {
      id: 'flg-105-2', trip_id: 'TRP-105', driver_id: 'drv-105', leg: 1,
      code: 1, duration: 27,
      lat: 16.021, long: 120.598,
      created_at: new Date(Date.now() - 3600000 * 1.5).toISOString(),
    },
  ],
  'TRP-106': [
    {
      id: 'flg-106-1', trip_id: 'TRP-106', driver_id: 'drv-106', leg: 1,
      code: 1, duration: 24,
      lat: 14.9812, long: 120.4412,
      created_at: new Date(Date.now() - 3600000 * 1.8).toISOString(),
    },
  ],

  // ── Completed Trips (TRP-201 to TRP-215) ───────────────────────────────────
  'TRP-201': [
    {
      id: 'flg-201-1', trip_id: 'TRP-201', driver_id: 'drv-101', leg: 1,
      code: 0, duration: 42,
      lat: 13.9808, long: 121.1504,
      created_at: new Date(Date.now() - 86400000 * 1 - 3600000 * 3).toISOString(),
    },
    {
      id: 'flg-201-2', trip_id: 'TRP-201', driver_id: 'drv-101', leg: 1,
      code: 1, duration: 15,
      lat: 13.882, long: 121.122,
      created_at: new Date(Date.now() - 86400000 * 1 - 3600000 * 1.5).toISOString(),
    },
  ],
  'TRP-202': [
    {
      id: 'flg-202-1', trip_id: 'TRP-202', driver_id: 'drv-102', leg: 1,
      code: 1, duration: 31,
      lat: 14.9635, long: 120.4521,
      created_at: new Date(Date.now() - 86400000 * 2 - 3600000 * 2).toISOString(),
    },
  ],
  'TRP-203': [
    {
      id: 'flg-203-1', trip_id: 'TRP-203', driver_id: 'drv-103', leg: 1,
      code: 0, duration: 24,
      lat: 14.3215, long: 121.0120,
      created_at: new Date(Date.now() - 86400000 * 3 - 3600000 * 2.5).toISOString(),
    },
    {
      id: 'flg-203-2', trip_id: 'TRP-203', driver_id: 'drv-103', leg: 1,
      code: 0, duration: 17,
      lat: 14.2953, long: 120.9263,
      created_at: new Date(Date.now() - 86400000 * 3 - 3600000 * 1.2).toISOString(),
    },
  ],
  'TRP-204': [
    {
      id: 'flg-204-1', trip_id: 'TRP-204', driver_id: 'drv-104', leg: 1,
      code: 0, duration: 33,
      lat: 14.7412, long: 120.9582,
      created_at: new Date(Date.now() - 86400000 * 4 - 3600000 * 1.8).toISOString(),
    },
    {
      id: 'flg-204-2', trip_id: 'TRP-204', driver_id: 'drv-104', leg: 1,
      code: 1, duration: 21,
      lat: 14.6891, long: 120.9623,
      created_at: new Date(Date.now() - 86400000 * 4 - 3600000 * 0.9).toISOString(),
    },
  ],
  'TRP-205': [
    {
      id: 'flg-205-1', trip_id: 'TRP-205', driver_id: 'drv-105', leg: 1,
      code: 0, duration: 55,
      lat: 15.485, long: 120.621,
      created_at: new Date(Date.now() - 86400000 * 5 - 3600000 * 4).toISOString(),
    },
    {
      id: 'flg-205-2', trip_id: 'TRP-205', driver_id: 'drv-105', leg: 1,
      code: 1, duration: 40,
      lat: 16.32, long: 120.601,
      created_at: new Date(Date.now() - 86400000 * 5 - 3600000 * 1.5).toISOString(),
    },
  ],
  'TRP-206': [
    {
      id: 'flg-206-1', trip_id: 'TRP-206', driver_id: 'drv-106', leg: 1,
      code: 0, duration: 22,
      lat: 14.251, long: 121.092,
      created_at: new Date(Date.now() - 86400000 * 6 - 3600000 * 2).toISOString(),
    },
  ],
  'TRP-207': [
    {
      id: 'flg-207-1', trip_id: 'TRP-207', driver_id: 'drv-107', leg: 1,
      code: 1, duration: 28,
      lat: 14.795, long: 120.942,
      created_at: new Date(Date.now() - 86400000 * 7 - 3600000 * 3).toISOString(),
    },
    {
      id: 'flg-207-2', trip_id: 'TRP-207', driver_id: 'drv-107', leg: 1,
      code: 0, duration: 19,
      lat: 14.7124, long: 120.9502,
      created_at: new Date(Date.now() - 86400000 * 7 - 3600000 * 1.2).toISOString(),
    },
  ],
  'TRP-208': [
    {
      id: 'flg-208-1', trip_id: 'TRP-208', driver_id: 'drv-108', leg: 1,
      code: 0, duration: 36,
      lat: 14.4182, long: 121.0394,
      created_at: new Date(Date.now() - 86400000 * 8 - 3600000 * 2.5).toISOString(),
    },
  ],
  'TRP-209': [
    {
      id: 'flg-209-1', trip_id: 'TRP-209', driver_id: 'drv-109', leg: 1,
      code: 1, duration: 45,
      lat: 14.891, long: 120.458,
      created_at: new Date(Date.now() - 86400000 * 9 - 3600000 * 2).toISOString(),
    },
    {
      id: 'flg-209-2', trip_id: 'TRP-209', driver_id: 'drv-109', leg: 1,
      code: 0, duration: 26,
      lat: 14.834, long: 120.312,
      created_at: new Date(Date.now() - 86400000 * 9 - 3600000 * 0.8).toISOString(),
    },
  ],
  'TRP-210': [
    {
      id: 'flg-210-1', trip_id: 'TRP-210', driver_id: 'drv-110', leg: 1,
      code: 0, duration: 22,
      lat: 14.251, long: 121.092,
      created_at: new Date(Date.now() - 86400000 * 10 - 3600000 * 2).toISOString(),
    },
    {
      id: 'flg-210-2', trip_id: 'TRP-210', driver_id: 'drv-110', leg: 1,
      code: 1, duration: 14,
      lat: 14.299, long: 121.044,
      created_at: new Date(Date.now() - 86400000 * 10 - 3600000 * 0.6).toISOString(),
    },
  ],
  'TRP-211': [
    {
      id: 'flg-211-1', trip_id: 'TRP-211', driver_id: 'drv-101', leg: 1,
      code: 0, duration: 31,
      lat: 14.7578, long: 120.9575,
      created_at: new Date(Date.now() - 86400000 * 11 - 3600000 * 1.5).toISOString(),
    },
  ],
  'TRP-212': [
    {
      id: 'flg-212-1', trip_id: 'TRP-212', driver_id: 'drv-102', leg: 1,
      code: 1, duration: 38,
      lat: 15.0921, long: 120.5134,
      created_at: new Date(Date.now() - 86400000 * 12 - 3600000 * 2.5).toISOString(),
    },
    {
      id: 'flg-212-2', trip_id: 'TRP-212', driver_id: 'drv-102', leg: 1,
      code: 0, duration: 20,
      lat: 14.9813, long: 120.4021,
      created_at: new Date(Date.now() - 86400000 * 12 - 3600000 * 1.1).toISOString(),
    },
  ],
  'TRP-213': [
    {
      id: 'flg-213-1', trip_id: 'TRP-213', driver_id: 'drv-103', leg: 1,
      code: 0, duration: 29,
      lat: 14.3742, long: 120.8914,
      created_at: new Date(Date.now() - 86400000 * 13 - 3600000 * 2).toISOString(),
    },
  ],
  'TRP-214': [
    {
      id: 'flg-214-1', trip_id: 'TRP-214', driver_id: 'drv-104', leg: 1,
      code: 0, duration: 55,
      lat: 15.485, long: 120.621,
      created_at: new Date(Date.now() - 86400000 * 14 - 3600000 * 4).toISOString(),
    },
    {
      id: 'flg-214-2', trip_id: 'TRP-214', driver_id: 'drv-104', leg: 1,
      code: 1, duration: 40,
      lat: 16.32, long: 120.601,
      created_at: new Date(Date.now() - 86400000 * 14 - 3600000 * 1).toISOString(),
    },
  ],
  'TRP-215': [
    {
      id: 'flg-215-1', trip_id: 'TRP-215', driver_id: 'drv-105', leg: 1,
      code: 1, duration: 33,
      lat: 14.6021, long: 120.9912,
      created_at: new Date(Date.now() - 86400000 * 15 - 3600000 * 2).toISOString(),
    },
    {
      id: 'flg-215-2', trip_id: 'TRP-215', driver_id: 'drv-105', leg: 1,
      code: 0, duration: 18,
      lat: 14.5612, long: 120.9831,
      created_at: new Date(Date.now() - 86400000 * 15 - 3600000 * 0.8).toISOString(),
    },
  ],
};

// Helper to generate 15 Completed & Historical Trips for the past 15 days
export function generateCompletedTrips(): any[] {
  const routes = [
    { from: INITIAL_LOCATIONS[0], to: INITIAL_LOCATIONS[1], dist: 108.5, time: '2h 15m', routeKey: 'TRP-101' },
    { from: INITIAL_LOCATIONS[2], to: INITIAL_LOCATIONS[3], dist: 78.2, time: '1h 45m', routeKey: 'TRP-102' },
    { from: INITIAL_LOCATIONS[5], to: INITIAL_LOCATIONS[4], dist: 42.6, time: '1h 10m', routeKey: 'TRP-103' },
    { from: INITIAL_LOCATIONS[6], to: INITIAL_LOCATIONS[0], dist: 26.4, time: '50m', routeKey: 'TRP-104' },
    { from: INITIAL_LOCATIONS[0], to: INITIAL_LOCATIONS[7], dist: 245.8, time: '5h 30m', routeKey: 'TRP-105' },
    { from: INITIAL_LOCATIONS[1], to: INITIAL_LOCATIONS[5], dist: 72.3, time: '1h 35m', routeKey: 'TRP-101' },
    { from: INITIAL_LOCATIONS[2], to: INITIAL_LOCATIONS[6], dist: 64.1, time: '1h 20m', routeKey: 'TRP-102' },
  ];

  const travelPurposes = [
    'Bulk Container Distribution to Calabarzon Ports',
    'Aviation Fuel Supply Transfer via SCTEX',
    'Electronics Component Delivery to Cavite Export Zone',
    'Bulk Grains and Dry Food Transport to Manila Port',
    'Highland FMCG Supermarket Distribution via TPLEX',
    'Fuel Tanker Delivery to Batangas Industrial Depot',
    'Cold Chain Cargo Run to Subic Bay Logistics Hub',
    'Construction Materials Haul to Pampanga Depot',
    'Retail Distribution to Cavite Gateway Terminal',
    'Container Port Run — Bulacan to Manila Harbor',
    'Long Haul Consumer Goods to Baguio Mountain Depot',
    'Express Freight to Batangas Port via STAR Tollway',
    'Semiconductor Parts Delivery to Laguna Technopark',
    'Agricultural Produce Run to Manila North Harbor',
    'Fleet Supply Delivery via NLEX–SCTEX Connector',
  ];

  const completedTrips: any[] = [];
  const flaggedIds = new Set(Object.keys(INITIAL_DRIVER_FLAGS));

  // TRP-215 (newest, 1 day ago) → TRP-201 (oldest, 15 days ago)
  for (let i = 15; i >= 1; i--) {
    const route = routes[i % routes.length];
    const truck = INITIAL_VEHICLES[(i + 1) % INITIAL_VEHICLES.length];
    const driver = INITIAL_DRIVERS[i % INITIAL_DRIVERS.length];
    const dayOffset = i; // TRP-215 = 1 day ago, TRP-201 = 15 days ago
    const dateObj = new Date(Date.now() - dayOffset * 86400000);
    const dateStr = dateObj.toISOString().split('T')[0];
    const tripId = `TRP-${200 + i}`;

    const actualDist = Number((route.dist * (0.95 + (i % 5) * 0.02)).toFixed(1));
    const fuelReq = Number((actualDist / (truck.fuel_efficiency || 4.5)).toFixed(1));

    completedTrips.push({
      id: tripId,
      status: 'Completed',
      created_at: `${dateStr}T08:30:00.000Z`,
      isFlagged: flaggedIds.has(tripId), // All 15 are in INITIAL_DRIVER_FLAGS → all flagged
      request_info: {
        requestDate: dateStr,
        requestTime: '08:00',
        scheduledDeparture: `${dateStr}T08:30:00.000Z`,
        travelPurpose: travelPurposes[i - 1] || `Scheduled Freight Run #${1000 + i}`,
        requestedBy: 'Logistics Dispatch Desk',
        notes: 'Delivery completed and verified at delivery bay.',
      },
      location_info: {
        truckId: truck.truck_id,
        truck: truck,
        driverId: driver.id,
        driverName: driver.full_name || driver.username,
        driver: driver,
        locations: [
          { name: route.from.name, order: 1, lat: route.from.lat, long: route.from.long },
          { name: route.to.name, order: 2, lat: route.to.lat, long: route.to.long },
        ],
        estDistanceRequired: [route.dist],
        applyToll: true,
      },
      inventory_items: [
        { itemName: 'General Commercial Freight Pallets', itemQuantity: 8 + (i % 12), itemUnit: 'pallets' },
      ],
      fuel_requirement: {
        distance: route.dist,
        estimatedTotalFuel: fuelReq,
        finalFuelAmount: fuelReq + 4,
        fuelPrice: 62.5,
      },
      distance_travelled: [actualDist],
      estimated_trip_time: [route.time],
      actual_trip_time: [route.time],
      use_toll: true,
      route_key: route.routeKey,
    });
  }

  return completedTrips;
}

// 30-Day Analytics Data for Fuel & Distance charts
export function generateAnalyticsData(completedTrips: any[]) {
  return completedTrips.map((trip) => {
    const actualDistance = (trip.distance_travelled || []).reduce((sum: number, d: any) => sum + (Number(d) || 0), 0);
    const efficiency = trip.location_info?.truck?.fuel_efficiency || 4.0;
    const actualFuel = efficiency > 0 ? parseFloat((actualDistance / efficiency).toFixed(2)) : 0;

    return {
      date: trip.request_info?.requestDate || trip.created_at?.split('T')[0],
      truck: trip.location_info?.truck?.truck_name || 'Fleet Truck',
      driver_name: trip.location_info?.driver_name || 'Assigned Driver',
      total_distance: actualDistance,
      total_fuel: actualFuel,
      fuel_requested: trip.fuel_requirement?.finalFuelAmount || trip.fuel_requirement?.final_fuel_amount || actualFuel + 2,
    };
  });
}

// System Audit Logs
export const INITIAL_LOGS: DemoLog[] = [
  {
    id: 'log-1',
    created_at: new Date(Date.now() - 3600000 * 2.5).toISOString(),
    trip_id: 'TRP-101',
    message: '[INFO] Trip TRP-101 initiated by Dispatcher admin@demofleet.ph. Vehicle TRK-101 assigned to Juan dela Cruz.',
  },
  {
    id: 'log-2',
    created_at: new Date(Date.now() - 3600000 * 2.4).toISOString(),
    trip_id: 'TRP-101',
    message: '[INFO] Geofence established for origin Manila North Harbor Terminal (buffer: 500m).',
  },
  {
    id: 'log-3',
    created_at: new Date(Date.now() - 3600000 * 2.0).toISOString(),
    trip_id: 'TRP-102',
    message: '[INFO] Trip TRP-102 spawned on SCTEX. Vehicle TRK-102 in motion towards Subic Bay Freeport.',
  },
  {
    id: 'log-4',
    created_at: new Date(Date.now() - 3600000 * 1.8).toISOString(),
    trip_id: 'TRP-103',
    message: '[INFO] Trip TRP-103 departing Laguna Technopark Hub via CALAX connector.',
  },
  {
    id: 'log-5',
    created_at: new Date(Date.now() - 3600000 * 1.2).toISOString(),
    trip_id: 'TRP-104',
    message: '[INFO] Trip TRP-104 en route Bulacan to Manila. Telemetry streaming live GPS at 64 km/h.',
  },
  {
    id: 'log-6',
    created_at: new Date(Date.now() - 3600000 * 0.8).toISOString(),
    trip_id: 'TRP-105',
    message: '[INFO] Trip TRP-105 passed Gerona TPLEX toll gate. Normal engine temperature reported.',
  },
  {
    id: 'log-7',
    created_at: new Date(Date.now() - 3600000 * 0.4).toISOString(),
    trip_id: null,
    message: '[INFO] Automated fleet telemetry check completed. 5 vehicles active, 5 standby, 2 maintenance.',
  },
];

// Demo Users for 1-Click Login and Role Switcher
export const DEMO_USERS: DemoUser[] = [
  {
    id: 'usr-admin',
    name: 'Fleet Administrator',
    email: 'admin@demofleet.ph',
    role: 'Admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop',
  },
  {
    id: 'usr-dispatcher',
    name: 'Senior Dispatcher',
    email: 'dispatcher@demofleet.ph',
    role: 'Dispatcher',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop',
  },
  {
    id: 'usr-driver',
    name: 'Lead Driver',
    email: 'driver@demofleet.ph',
    role: 'Driver',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop',
  },
];
