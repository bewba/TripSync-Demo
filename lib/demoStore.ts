import {
  INITIAL_LOCATIONS,
  INITIAL_DRIVERS,
  INITIAL_VEHICLES,
  INITIAL_ACTIVE_TRIPS,
  PRECONFIGURED_ROUTES,
  INITIAL_LOGS,
  INITIAL_DRIVER_FLAGS,
  DriverFlag,
  generateCompletedTrips,
  generateAnalyticsData,
  DemoLocation,
  DemoLog,
} from './demoData';
import type { TruckRecord, Driver } from '../types/types';

interface ActiveSimulation {
  tripId: string;
  route: [number, number][];
  currentSegmentIndex: number;
  segmentProgress: number; // 0 to 1
  speed: number; // km/h
  batteryLevel: number;
  heading: number; // degrees
  forward: boolean;
  /** Timestamp (ms) until which this truck is stopped. 0 = not stopped. */
  stoppedUntil: number;
  /** Timestamp (ms) when the stoppage began. 0 = not stopped. */
  stoppedAt: number;
  /** Timestamp (ms) when the next stoppage should begin. */
  nextStopAt: number;
  /** Whether the driver is currently online / transmitting ping */
  isOnline: boolean;
  /** Timestamp (ms) until which this driver is offline */
  offlineUntil: number;
  /** Timestamp (ms) when the next offline period begins */
  nextOfflineAt: number;
}

// Calculate bearing in degrees from point A to point B
function calculateBearing(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const toDeg = (rad: number) => (rad * 180) / Math.PI;

  const y = Math.sin(toRad(lon2 - lon1)) * Math.cos(toRad(lat2));
  const x =
    Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
    Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(toRad(lon2 - lon1));

  const brng = toDeg(Math.atan2(y, x));
  return (brng + 360) % 360;
}

// Helper: Haversine distance in kilometers
export function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Interpolate waypoints between start and end coordinates
export function generateInterpolatedWaypoints(
  startLat: number,
  startLng: number,
  endLat: number,
  endLng: number,
  steps = 15
): [number, number][] {
  const waypoints: [number, number][] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    // Add subtle curvature to simulate realistic road trajectories
    const curveOffset = Math.sin(t * Math.PI) * 0.015;
    const lat = startLat + (endLat - startLat) * t + curveOffset;
    const lng = startLng + (endLng - startLng) * t - curveOffset * 0.5;
    waypoints.push([parseFloat(lat.toFixed(5)), parseFloat(lng.toFixed(5))]);
  }
  return waypoints;
}

class DemoStore {
  private vehicles: TruckRecord[] = [];
  private drivers: Driver[] = [];
  private locations: DemoLocation[] = [];
  private trips: any[] = [];
  private logs: DemoLog[] = [];
  private driverFlags: Map<string, DriverFlag[]> = new Map();
  private simulations: Map<string, ActiveSimulation> = new Map();
  private lastTick: number = Date.now();

  constructor() {
    this.reset();
  }

  public reset() {
    this.vehicles = JSON.parse(JSON.stringify(INITIAL_VEHICLES));
    this.drivers = JSON.parse(JSON.stringify(INITIAL_DRIVERS));
    this.locations = JSON.parse(JSON.stringify(INITIAL_LOCATIONS));

    const completed = generateCompletedTrips();
    const active = JSON.parse(JSON.stringify(INITIAL_ACTIVE_TRIPS));
    this.trips = [...active, ...completed];
    this.logs = JSON.parse(JSON.stringify(INITIAL_LOGS));

    this.driverFlags.clear();
    Object.entries(INITIAL_DRIVER_FLAGS).forEach(([tripId, flags]) => {
      this.driverFlags.set(tripId, JSON.parse(JSON.stringify(flags)));
    });

    this.simulations.clear();

    // Initialize 5 active simulations with distributed starting positions along highway routes
    active.forEach((trip: any, idx: number) => {
      const route = PRECONFIGURED_ROUTES[trip.id] || [
        [trip.location_info.locations[0].lat, trip.location_info.locations[0].long],
        [trip.location_info.locations[1].lat, trip.location_info.locations[1].long],
      ];

      const initialSeg = Math.min(route.length - 2, Math.floor((idx + 1) * (route.length / 6)));
      const initialProg = 0.15;

      const p1 = route[initialSeg];
      const p2 = route[initialSeg + 1] || route[initialSeg];
      const heading = calculateBearing(p1[0], p1[1], p2[0], p2[1]);

      this.simulations.set(trip.id, {
        tripId: trip.id,
        route,
        currentSegmentIndex: initialSeg,
        segmentProgress: initialProg,
        speed: 62 + (idx * 4),
        batteryLevel: Math.max(45, 95 - idx * 10),
        heading,
        forward: true,
        stoppedUntil: 0,
        stoppedAt: 0,
        // TRP-104 (Danilo Reyes) stops first after 5s so the demo effect is visible immediately
        nextStopAt: Date.now() + (trip.id === 'TRP-104' ? 5_000 : 0),
        // TRP-105 (Arnel Mendoza) & TRP-106 (Mark Bautista) start offline
        isOnline: trip.id !== 'TRP-105' && trip.id !== 'TRP-106',
        offlineUntil: (trip.id === 'TRP-105' || trip.id === 'TRP-106') ? Date.now() + 120_000 : 0,
        nextOfflineAt: (trip.id === 'TRP-105' || trip.id === 'TRP-106') ? 0 : (trip.id === 'TRP-103' ? Date.now() + 50_000 : 0),
      });
    });

    this.lastTick = Date.now();
  }

  // Advance simulation on every read tick (real km/s movement — segment-density-independent)
  public tick() {
    const now = Date.now();
    const dt = Math.min((now - this.lastTick) / 1000, 10); // seconds passed
    this.lastTick = now;

    this.simulations.forEach((sim) => {
      const { route } = sim;
      if (route.length < 2) return;

      // ── Stoppage cycle (only TRP-104 — Danilo Reyes) ──────────────────────
      if (sim.tripId === 'TRP-104') {
        if (sim.stoppedUntil === 0 && now >= sim.nextStopAt) {
          // Begin a new stoppage: stopped for 40s
          sim.stoppedUntil = now + 40_000;
          sim.stoppedAt = now;
          sim.speed = 0;
        } else if (sim.stoppedUntil > 0 && now >= sim.stoppedUntil) {
          // End stoppage — resume moving, next stop in 55-70s
          sim.stoppedUntil = 0;
          sim.stoppedAt = 0;
          sim.nextStopAt = now + 55_000 + Math.random() * 15_000;
          sim.speed = 60;
        }

        if (sim.stoppedUntil > 0) {
          // Truck is stopped — don't advance position
          return;
        }
      }
      // ───────────────────────────────────────────────────────────────────────

      // ── Offline cycle (simulates intermittent GPS/connectivity dropout for TRP-105, TRP-106 & TRP-103) ──
      if (sim.tripId === 'TRP-105' || sim.tripId === 'TRP-106' || sim.tripId === 'TRP-103') {
        if (sim.isOnline && sim.nextOfflineAt > 0 && now >= sim.nextOfflineAt) {
          // Go offline for 30s
          sim.isOnline = false;
          sim.offlineUntil = now + 30_000;
          sim.speed = 0;
        } else if (!sim.isOnline && sim.offlineUntil > 0 && now >= sim.offlineUntil) {
          // Reconnect online
          sim.isOnline = true;
          sim.offlineUntil = 0;
          sim.nextOfflineAt = now + 65_000 + Math.random() * 20_000;
          sim.speed = 65;
        }

        if (!sim.isOnline) {
          // Offline driver — no GPS location updates
          return;
        }
      }
      // ───────────────────────────────────────────────────────────────────────

      // Realistic speed variation (55-85 km/h)
      const speedJitter = (Math.random() - 0.5) * 4;
      sim.speed = Math.max(55, Math.min(85, sim.speed + speedJitter));

      // Battery slowly drops
      sim.batteryLevel = Math.max(15, sim.batteryLevel - 0.005 * dt);

      // Distance to travel this tick in km (speed km/h → km/s × dt seconds)
      let remainingKm = (sim.speed / 3600) * dt;

      while (remainingKm > 0 && route.length >= 2) {
        const p1 = route[sim.currentSegmentIndex];
        const p2 = route[sim.currentSegmentIndex + 1];
        if (!p1 || !p2) {
          // Reached end — reverse direction
          sim.forward = !sim.forward;
          sim.route = [...route].reverse();
          sim.currentSegmentIndex = 0;
          sim.segmentProgress = 0;
          break;
        }

        const segLenKm = haversineDistance(p1[0], p1[1], p2[0], p2[1]);
        // How many km remain in this segment from the current progress position
        const segRemaining = segLenKm * (1 - sim.segmentProgress);

        if (remainingKm < segRemaining) {
          // Stay on this segment, advance fraction
          sim.segmentProgress += remainingKm / segLenKm;
          remainingKm = 0;
        } else {
          // Consume this segment and move to next
          remainingKm -= segRemaining;
          sim.currentSegmentIndex++;
          sim.segmentProgress = 0;

          if (sim.currentSegmentIndex >= route.length - 1) {
            // End of route — reverse
            sim.forward = !sim.forward;
            sim.route = [...route].reverse();
            sim.currentSegmentIndex = 0;
            sim.segmentProgress = 0;
            remainingKm = 0;
          }
        }
      }

      const p1 = route[sim.currentSegmentIndex];
      const p2 = route[sim.currentSegmentIndex + 1] || p1;
      sim.heading = calculateBearing(p1[0], p1[1], p2[0], p2[1]);
    });
  }

  // Get live active driver GPS coordinates for map and sidebar
  public getActiveTruckLocations() {
    this.tick();

    const activeTrips = this.trips.filter((t) => t.status === 'Trip in progress');

    return activeTrips.map((trip) => {
      const sim = this.simulations.get(trip.id);
      const locInfo = trip.location_info || {};
      const locations = locInfo.locations || [];
      const origin = locations[0]?.name || 'Origin';
      const destination = locations[locations.length - 1]?.name || 'Destination';

      let lat = locations[0]?.lat || 14.5995;
      let lng = locations[0]?.long || 120.9842;
      let speed = 65;
      let battery = 88;
      let heading = 0;

      if (sim && sim.route.length >= 2) {
        const p1 = sim.route[sim.currentSegmentIndex];
        const p2 = sim.route[sim.currentSegmentIndex + 1] || p1;
        lat = p1[0] + (p2[0] - p1[0]) * sim.segmentProgress;
        lng = p1[1] + (p2[1] - p1[1]) * sim.segmentProgress;
        speed = Math.round(sim.speed);
        battery = Math.round(sim.batteryLevel);
        heading = Math.round(sim.heading);
      }

      const isOnline = sim ? sim.isOnline : true;
      const isStopped = !!(sim && sim.stoppedUntil > 0);
      const stoppedForSeconds = isStopped && sim && sim.stoppedAt > 0
        ? Math.max(0, Math.floor((Date.now() - sim.stoppedAt) / 1000))
        : 0;

      const driverName =
        locInfo.driver?.full_name ||
        locInfo.driver?.username ||
        locInfo.driverName ||
        locInfo.driver_name ||
        'Assigned Driver';

      const truckName = locInfo.truck?.truck_name || 'Fleet Vehicle';
      const plateNumber = locInfo.truck?.plate_number || 'TRK-001';

      return {
        tripId: trip.id,
        driverName,
        lat: parseFloat(lat.toFixed(5)),
        lng: parseFloat(lng.toFixed(5)),
        lastUpdate: isOnline ? new Date().toISOString() : new Date(Date.now() - 240_000).toISOString(),
        batteryLevel: battery,
        speed: isOnline ? (isStopped ? 0 : speed) : 0,
        heading,
        truckName,
        plateNumber,
        origin,
        destination,
        isStopped,
        stoppedForSeconds,
        stoppedAt: isStopped && sim ? sim.stoppedAt : 0,
        isOnline,
      };
    });
  }

  // Spawns a new active trip created via /auth/plan-trip
  public createTrip(payload: any): any {
    const newId = `TRP-${Date.now().toString().slice(-4)}`;
    const now = new Date();

    const origin = payload.locationInfo?.locations?.[0] || { name: 'Origin Depot', lat: 14.5995, long: 120.9842 };
    const dest = payload.locationInfo?.locations?.[1] || { name: 'Destination Hub', lat: 13.7565, long: 121.0583 };

    // Mark vehicle as 'In Motion'
    const truckId = payload.locationInfo?.truckId || payload.locationInfo?.truck?.truck_id;
    if (truckId) {
      const truck = this.vehicles.find((v) => v.truck_id === truckId || v.id === truckId);
      if (truck) {
        truck.status = 'In Motion';
      }
    }

    // Mark driver as 'In Motion'
    const driverId = payload.locationInfo?.driverId || payload.locationInfo?.driver?.id;
    if (driverId) {
      const driver = this.drivers.find((d) => d.id === driverId || d.username === driverId);
      if (driver) {
        driver.status = 'In Motion';
      }
    }

    // Use provided road waypoints (e.g. TomTom routing) if available, otherwise interpolate
    const providedWaypoints = payload.locationInfo?.waypoints;
    const waypoints: [number, number][] = (Array.isArray(providedWaypoints) && providedWaypoints.length > 1)
      ? providedWaypoints
      : generateInterpolatedWaypoints(origin.lat, origin.long, dest.lat, dest.long, 20);

    const newTrip = {
      id: newId,
      status: 'Trip in progress',
      created_at: now.toISOString(),
      request_info: {
        requestDate: payload.requestInfo?.requestDate || now.toISOString().split('T')[0],
        requestTime: payload.requestInfo?.requestTime || '12:00',
        scheduledDeparture: payload.requestInfo?.scheduledDeparture || 'Now',
        travelPurpose: payload.requestInfo?.travelPurpose || 'Priority Logistics Delivery',
        requestedBy: payload.requestInfo?.requestedBy || 'Transport Manager',
        notes: payload.requestInfo?.notes || '',
      },
      location_info: {
        truckId: truckId || 'TRK-107',
        truck: payload.locationInfo?.truck || this.vehicles[6],
        driverId: driverId || 'drv-107',
        driverName: payload.locationInfo?.driverName || payload.locationInfo?.driver?.full_name || 'Carlos Gomez',
        driver: payload.locationInfo?.driver || this.drivers[6],
        locations: [
          { name: origin.name, order: 1, lat: origin.lat, long: origin.long },
          { name: dest.name, order: 2, lat: dest.lat, long: dest.long },
        ],
        estDistanceRequired: payload.locationInfo?.estDistanceRequired || [
          haversineDistance(origin.lat, origin.long, dest.lat, dest.long),
        ],
        applyToll: payload.locationInfo?.applyToll ?? true,
        waypoints,
      },
      inventory_items: payload.inventoryItems || [],
      fuel_requirement: payload.fuelRequirement || {
        distance: haversineDistance(origin.lat, origin.long, dest.lat, dest.long),
        estimatedTotalFuel: 20,
        finalFuelAmount: 22,
        fuelPrice: 62.5,
      },
      distance_travelled: [0],
      estimated_trip_time: payload.estimatedTripTime || ['1h 30m'],
      actual_trip_time: ['0m'],
      use_toll: payload.useToll ?? true,
    };

    // Prepend to trips
    this.trips.unshift(newTrip);

    // Register active simulation
    const p1 = waypoints[0];
    const p2 = waypoints[1] || p1;
    this.simulations.set(newId, {
      tripId: newId,
      route: waypoints,
      currentSegmentIndex: 0,
      segmentProgress: 0.05,
      speed: 70, // 65-75 km/h
      batteryLevel: 98,
      heading: calculateBearing(p1[0], p1[1], p2[0], p2[1]),
      forward: true,
      stoppedUntil: 0,
      stoppedAt: 0,
      nextStopAt: 0, // newly created trips don't stop
      isOnline: true,
      offlineUntil: 0,
      nextOfflineAt: 0,
    });

    // Add audit log
    this.addLog(`[INFO] New Trip ${newId} created. Vehicle ${truckId} en route ${origin.name} -> ${dest.name}.`, newId);

    return newTrip;
  }

  // --- Vehicles CRUD ---
  public getVehicles(opts?: { planner?: boolean; q?: string; limit?: number; page?: number }) {
    let result = [...this.vehicles];

    if (opts?.planner) {
      result = result.filter((v) => v.metric_type === 'km/L');
      // Prioritize available vehicles at the top
      result.sort((a, b) => {
        const aAvail = a.status === 'Pending Trip Assignment' ? 0 : 1;
        const bAvail = b.status === 'Pending Trip Assignment' ? 0 : 1;
        return aAvail - bAvail;
      });
    }

    if (opts?.q) {
      const qLower = opts.q.toLowerCase();
      result = result.filter(
        (v) =>
          v.truck_name.toLowerCase().includes(qLower) ||
          v.truck_id.toLowerCase().includes(qLower) ||
          (v.plate_number && v.plate_number.toLowerCase().includes(qLower))
      );
    }

    const total = result.length;

    if (opts?.page && opts?.limit) {
      const from = (opts.page - 1) * opts.limit;
      result = result.slice(from, from + opts.limit);
    } else if (opts?.limit) {
      result = result.slice(0, opts.limit);
    }

    return { data: result, count: total };
  }

  public getFleetStats() {
    return {
      active: this.vehicles.filter((v) => v.status === 'Assigned Trip').length,
      idle: this.vehicles.filter((v) => v.status === 'Pending Trip Assignment').length,
      maintenance: this.vehicles.filter((v) => v.status === 'Maintenance').length,
      inMotion: this.vehicles.filter((v) => v.status === 'In Motion').length,
      total: this.vehicles.length,
    };
  }

  public addVehicle(truckData: Partial<TruckRecord>): TruckRecord {
    const newTruck: TruckRecord = {
      id: truckData.truck_id || `TRK-${100 + this.vehicles.length + 1}`,
      truck_id: truckData.truck_id || `TRK-${100 + this.vehicles.length + 1}`,
      truck_name: truckData.truck_name || 'Fleet Truck Unit',
      driver: truckData.driver || 'Unassigned',
      driverId: truckData.driverId,
      fuel_efficiency: truckData.fuel_efficiency || 4.5,
      metric_type: truckData.metric_type || 'km/L',
      engine_type: truckData.engine_type || 'Diesel Standard',
      status: truckData.status || 'Pending Trip Assignment',
      plate_number: truckData.plate_number || 'NBD-0000',
      created_at: new Date().toISOString(),
    };
    this.vehicles.unshift(newTruck);
    this.addLog(`[INFO] Vehicle ${newTruck.truck_id} (${newTruck.truck_name}) added to fleet inventory.`);
    return newTruck;
  }

  public updateVehicle(truckId: string, updates: Partial<TruckRecord>): TruckRecord | null {
    const idx = this.vehicles.findIndex((v) => v.truck_id === truckId || v.id === truckId);
    if (idx === -1) return null;
    this.vehicles[idx] = { ...this.vehicles[idx], ...updates };
    this.addLog(`[INFO] Vehicle ${truckId} specifications updated.`);
    return this.vehicles[idx];
  }

  public deleteVehicle(truckId: string): boolean {
    const initialLen = this.vehicles.length;
    this.vehicles = this.vehicles.filter((v) => v.truck_id !== truckId && v.id !== truckId);
    if (this.vehicles.length < initialLen) {
      this.addLog(`[WARN] Vehicle ${truckId} decommissioned from fleet.`);
      return true;
    }
    return false;
  }

  // --- Drivers CRUD ---
  public getDrivers(opts?: { planner?: boolean; q?: string; limit?: number }) {
    let result = [...this.drivers];

    if (opts?.planner) {
      // Prioritize available drivers at the top
      result.sort((a, b) => {
        const aAvail = a.status === 'Pending Trip Assignment' ? 0 : 1;
        const bAvail = b.status === 'Pending Trip Assignment' ? 0 : 1;
        return aAvail - bAvail;
      });
    }

    if (opts?.q) {
      const qLower = opts.q.toLowerCase();
      result = result.filter(
        (d) =>
          d.username.toLowerCase().includes(qLower) ||
          (d.full_name && d.full_name.toLowerCase().includes(qLower))
      );
    }

    if (opts?.limit) {
      result = result.slice(0, opts.limit);
    }

    return result;
  }

  public createDriver(driverData: Partial<Driver>): Driver {
    const newDriver: Driver = {
      id: driverData.id || `drv-${100 + this.drivers.length + 1}`,
      username: driverData.username || `driver${this.drivers.length + 1}`,
      full_name: driverData.full_name || `${driverData.first_name || 'Driver'} ${driverData.last_name || ''}`.trim(),
      first_name: driverData.first_name || 'Driver',
      last_name: driverData.last_name || '',
      email: driverData.email || 'driver@demofleet.ph',
      status: driverData.status || 'Pending Trip Assignment',
      license_number: driverData.license_number || 'N01-26-009988',
      phone_number: driverData.phone_number || '+63 917 000 0000',
      created_at: new Date().toISOString(),
    };
    this.drivers.unshift(newDriver);
    this.addLog(`[INFO] Driver ${newDriver.full_name} (${newDriver.username}) added to driver roster.`);
    return newDriver;
  }

  // --- Locations CRUD ---
  public getLocations(): DemoLocation[] {
    return [...this.locations];
  }

  public addLocation(locationData: { name: string; lat: number; long: number }): DemoLocation {
    const newLoc: DemoLocation = {
      id: `loc-${Date.now().toString().slice(-4)}`,
      name: locationData.name,
      lat: locationData.lat,
      long: locationData.long,
      created_at: new Date().toISOString(),
    };
    this.locations.push(newLoc);
    this.addLog(`[INFO] New logistics location saved: "${newLoc.name}" (${newLoc.lat}, ${newLoc.long}).`);
    return newLoc;
  }

  public deleteLocation(locationId: string): boolean {
    const initialLen = this.locations.length;
    this.locations = this.locations.filter((l) => l.id !== locationId && l.name !== locationId);
    return this.locations.length < initialLen;
  }

  // --- Trip History & Details ---
  public getTrips(opts?: { page?: number; limit?: number; searchQuery?: string; status?: string }) {
    let result = [...this.trips];

    if (opts?.status && opts.status !== 'All') {
      if (opts.status.toLowerCase() === 'flagged') {
        result = result.filter(
          (t) => Boolean(t.isFlagged) || (this.driverFlags.get(t.id)?.length ?? 0) > 0
        );
      } else {
        result = result.filter((t) => t.status?.toLowerCase() === opts.status?.toLowerCase());
      }
    }

    if (opts?.searchQuery) {
      const qLower = opts.searchQuery.toLowerCase();
      result = result.filter((t) => {
        const vehicle = t.location_info?.truck?.truck_name || '';
        const driver = t.location_info?.driverName || t.location_info?.driver?.full_name || '';
        const origin = t.location_info?.locations?.[0]?.name || '';
        const dest = t.location_info?.locations?.[t.location_info?.locations?.length - 1]?.name || '';
        return (
          t.id.toLowerCase().includes(qLower) ||
          vehicle.toLowerCase().includes(qLower) ||
          driver.toLowerCase().includes(qLower) ||
          origin.toLowerCase().includes(qLower) ||
          dest.toLowerCase().includes(qLower)
        );
      });
    }

    const total = result.length;
    const page = opts?.page || 1;
    const limit = opts?.limit || 10;
    const from = (page - 1) * limit;
    const pagedTrips = result.slice(from, from + limit);

    // Format output matching Trip interface
    const formatted = pagedTrips.map((trip) => {
      const locs = trip.location_info?.locations || [];
      const hasFlags = Boolean(trip.isFlagged) || ((this.driverFlags.get(trip.id)?.length ?? 0) > 0);
      return {
        trip_id: trip.id,
        when: trip.request_info?.requestDate || trip.created_at?.split('T')[0],
        scheduled_departure: trip.request_info?.scheduledDeparture || 'N/A',
        vehicle_name: trip.location_info?.truck?.truck_name || 'Fleet Truck',
        first_location: locs[0]?.name || 'N/A',
        last_location: locs[locs.length - 1]?.name || 'N/A',
        total_distance: trip.fuel_requirement?.distance || 0,
        status: trip.status || 'Completed',
        isFlagged: hasFlags,
      };
    });

    return { data: formatted, count: total };
  }

  public getTripDetail(tripId: string) {
    const trip = this.trips.find((t) => t.id === tripId);
    if (!trip) return null;

    return {
      id: trip.id,
      requestInfo: trip.request_info,
      locationInfo: trip.location_info,
      inventoryItems: trip.inventory_items || [],
      fuelRequirement: trip.fuel_requirement,
      status: trip.status,
      tripStart: trip.trip_start || ['08:00 AM'],
      tripEnd: trip.trip_end || ['10:30 AM'],
      estDistanceRequired: trip.location_info?.estDistanceRequired || [trip.fuel_requirement?.distance || 100],
      distanceTravelled: trip.distance_travelled || [trip.fuel_requirement?.distance || 100],
      actualTripTime: trip.actual_trip_time || ['2h 15m'],
      estimatedTripTime: trip.estimated_trip_time || ['2h 00m'],
      useToll: trip.use_toll ?? true,
      isFlagged: Boolean(trip.isFlagged) || ((this.driverFlags.get(tripId)?.length ?? 0) > 0),
    };
  }

  public getDriverFlags(tripId: string): DriverFlag[] {
    return this.driverFlags.get(tripId) || [];
  }

  public addDriverFlag(flag: DriverFlag) {
    const existing = this.driverFlags.get(flag.trip_id) || [];
    existing.push(flag);
    this.driverFlags.set(flag.trip_id, existing);
  }

  public getTripCoordinates(tripId: string) {
    const trip = this.trips.find((t) => t.id === tripId);
    if (!trip) return [];

    const sim = this.simulations.get(tripId);
    const routeKey = trip.route_key;
    const waypoints =
      sim?.route ||
      PRECONFIGURED_ROUTES[tripId] ||
      (routeKey && PRECONFIGURED_ROUTES[routeKey]) ||
      generateInterpolatedWaypoints(
        trip.location_info?.locations?.[0]?.lat || 14.5995,
        trip.location_info?.locations?.[0]?.long || 120.9842,
        trip.location_info?.locations?.[1]?.lat || 13.7565,
        trip.location_info?.locations?.[1]?.long || 121.0583,
        25
      );

    return [
      {
        leg: 1,
        coordinates: waypoints.map((pt, idx) => ({
          lat: pt[0],
          lng: pt[1],
          batteryLevel: 90 - (idx % 20),
          createdAt: new Date(Date.now() - (waypoints.length - idx) * 60000).toISOString(),
        })),
      },
    ];
  }

  public cancelTrip(tripId: string): boolean {
    const trip = this.trips.find((t) => t.id === tripId);
    if (!trip) return false;
    trip.status = 'Cancelled';
    this.simulations.delete(tripId);
    this.addLog(`[WARN] Trip ${tripId} cancelled by dispatcher.`, tripId);
    return true;
  }

  public endTrip(tripId: string): boolean {
    const trip = this.trips.find((t) => t.id === tripId);
    if (!trip) return false;
    trip.status = 'Completed';
    this.simulations.delete(tripId);
    this.addLog(`[INFO] Trip ${tripId} marked as completed. All cargo unloaded.`, tripId);
    return true;
  }

  // --- Analytics ---
  public getAnalytics(opts?: { from?: string; to?: string; truckId?: string; driverId?: string }) {
    const completed = this.trips.filter((t) => t.status === 'Completed');
    let data = generateAnalyticsData(completed);

    if (opts?.from) {
      data = data.filter((d) => d.date >= opts.from!);
    }
    if (opts?.to) {
      data = data.filter((d) => d.date <= opts.to!);
    }
    if (opts?.truckId) {
      data = data.filter((d) => d.truck.includes(opts.truckId!));
    }
    if (opts?.driverId) {
      data = data.filter((d) => d.driver_name.includes(opts.driverId!));
    }

    return data;
  }

  // --- Logs ---
  public getLogs(opts?: {
    page?: number;
    limit?: number;
    search?: string;
    trip_id?: string;
    level?: string;
    sort?: string;
    from?: string;
    to?: string;
  }) {
    let result = [...this.logs];

    if (opts?.search) {
      const sLower = opts.search.toLowerCase();
      result = result.filter((l) => l.message.toLowerCase().includes(sLower));
    }

    if (opts?.trip_id) {
      result = result.filter((l) => l.trip_id === opts.trip_id);
    }

    if (opts?.level && opts.level !== 'all') {
      result = result.filter((l) => l.message.includes(`[${opts.level}]`));
    }

    if (opts?.from) {
      result = result.filter((l) => l.created_at >= `${opts.from}T00:00:00.000Z`);
    }

    if (opts?.to) {
      result = result.filter((l) => l.created_at <= `${opts.to}T23:59:59.999Z`);
    }

    result.sort((a, b) => {
      return opts?.sort === 'asc'
        ? a.created_at.localeCompare(b.created_at)
        : b.created_at.localeCompare(a.created_at);
    });

    const total = result.length;
    const page = opts?.page || 1;
    const limit = opts?.limit || 50;
    const from = (page - 1) * limit;
    const pagedLogs = result.slice(from, from + limit);

    return { data: pagedLogs, count: total };
  }

  public addLog(message: string, tripId: string | null = null) {
    this.logs.unshift({
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      created_at: new Date().toISOString(),
      trip_id: tripId,
      message,
    });
  }

  // Geocoding and route fallback for plan-trip
  public geocode(query: string) {
    const qLower = query.toLowerCase();
    const match = this.locations.find((l) => l.name.toLowerCase().includes(qLower));
    if (match) {
      return {
        lat: match.lat,
        lon: match.long,
        formatted: match.name,
      };
    }
    // Default Manila Center coordinates fallback
    return {
      lat: 14.5995,
      lon: 120.9842,
      formatted: query,
    };
  }

  public calculateRouteDistance(fromLat: number, fromLon: number, toLat: number, toLon: number) {
    // Haversine straight line multiplied by 1.25 road curvature coefficient
    const straightKm = haversineDistance(fromLat, fromLon, toLat, toLon);
    const roadKm = Math.round(straightKm * 1.25 * 10) / 10;
    const timeMinutes = Math.round((roadKm / 55) * 60);
    const hours = Math.floor(timeMinutes / 60);
    const mins = timeMinutes % 60;
    const timeString = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

    return {
      distanceKm: roadKm,
      timeString,
      waypoints: generateInterpolatedWaypoints(fromLat, fromLon, toLat, toLon, 15),
    };
  }
}

// Global Singleton instance across Hot-Module Reloads in development
const globalForDemo = globalThis as unknown as { demoStore?: DemoStore; demoStoreVersion?: string };
const DEMO_STORE_VERSION = 'v4_two_offline_drivers';

if (!globalForDemo.demoStore || globalForDemo.demoStoreVersion !== DEMO_STORE_VERSION) {
  globalForDemo.demoStore = new DemoStore();
  globalForDemo.demoStoreVersion = DEMO_STORE_VERSION;
}

export const demoStore = globalForDemo.demoStore;
