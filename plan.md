# Plan Trip Demo Feature - Implementation Plan & Checklist

## Objective
Implement the Plan Trip demo feature using the existing 3/4-step wizard:
- User picks 2 locations (Origin & Destination) via Map Pin Drop or Saved Locations.
- When viewing the Map in the picker, the search input says `"This feature is not available in the demo"`.
- User assigns an available sample driver & vehicle.
- Distance & Fuel are computed using TomTom routing geometry.
- On trip submission, dispatch the sample driver, create an active road simulation in `demoStore`, and redirect to `/auth/active-drivers?tripId=TRP-XXXX` to watch the sample driver drive live in real time.

---

## Tasks & Progress Checklist

- [x] **Task 1: LocationInput & MapPicker Adjustments**
  - [x] When on map view, set search placeholder to `"This feature is not available in the demo"` and prevent search query.
  - [x] Add fallback in `handleMapChange` if reverse geocode does not return address.
  - [x] Ensure default sample truck and driver (e.g., Carlos Gomez / TRK-107) are pre-selected if none chosen.

- [x] **Task 2: Fuel Step & Road Coordinates Propagation**
  - [x] In `FuelRequirementStep.tsx`, preserve the TomTom road waypoints from `/api/auth/distance` so they are sent in `locationInfo.waypoints`.

- [x] **Task 3: Backend DemoStore Simulation**
  - [x] In `lib/demoStore.ts`, use the road waypoints for the newly created trip simulation so the truck follows actual streets/highways.
  - [x] Mark the selected driver and truck as `'In Motion'`.
  - [x] Set realistic demo speed (65-75 km/h) with real-time waypoint progression.

- [x] **Task 4: Plan Trip Submission & Redirect**
  - [x] In `pages/auth/plan-trip/index.tsx`, on successful submission, redirect to `/auth/active-drivers?tripId=${result.data.id}`.

- [x] **Task 5: Active Drivers Map Auto-Focus**
  - [x] In `pages/auth/active-drivers/index.tsx`, read `router.query.tripId` and select the newly dispatched driver.
  - [x] In `components/auth/active-drivers/ActiveDriversMap.tsx`, smooth `flyTo` when driver is selected on load.

- [x] **Task 6: Verification & Testing**
  - [x] Run `npx tsc --noEmit`.
  - [x] Run `npm run build`.
  - [x] Test end-to-end user flow.
