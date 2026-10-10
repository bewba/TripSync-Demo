# Context Prompt: Fleet Manager Landing Page

You are an expert product marketer, UI/UX designer, and frontend architect. 
I am building a high-converting, modern landing page for an existing SaaS web application called "Fleet Manager" (LTC FuelApp / Logistics Telemetry & Fuel Management System). 

Here is the full context of the application:

---
### 1. PRODUCT OVERVIEW & VALUE PROPOSITION
- Product Name: Fleet Manager (LTC Logistics & Fuel App)
- Core Purpose: An enterprise fleet operations, dispatch, and fuel-intelligence platform tailored for freight and transport logistics operators.
- Primary Problem Solved: In logistics, fuel theft, unauthorized detours, untracked prolonged vehicle stoppages, and GPS signal dropouts bleed operating margins. Fleet Manager provides end-to-end trip planning with automated fuel estimation, live highway route tracking, and automated anomaly flagging.
- Target Audience: Logistics managers, fleet operators, dispatch controllers, freight companies, and supply chain coordinators.

---
### 2. CORE FEATURES & MODULES TO SHOWCASE
1. Live Interactive Fleet Telemetry ("Active Drivers Map"):
   - Real-time road-following vehicle tracking along major expressways and arterial freight routes (utilizing high-precision TomTom polyline routing).
   - Visualized vehicle telemetry: live driver status ("In Motion", "Available"), battery percentage, real-time speed, and origin-to-destination progression.
   - Smooth map centering and dynamic driver roster cards.

2. Smart Multi-Step Trip Planning & Fuel Forecasting:
   - 4-step dispatch wizard:
     1. Driver & Truck allocation.
     2. Origin & Destination location selection (via interactive map pin dropping or saved logistics hubs/geofenced terminals).
     3. Automated fuel consumption computation & distance routing based on vehicle specs and road geometry.
     4. Inventory/cargo specification and instant dispatch simulation.
   - Eliminates manual distance calculation and prevents fuel over-allocation.

3. Automated Anomaly Detection & Stoppage / GPS-Off Flags:
   - Automated detection and visual mapping of critical en-route incidents:
     - Code 0 (Stoppage Events): Exact duration and location of unauthorized stops or toll delays.
     - Code 1 (GPS Signal Dropouts): Alerts on signal blind spots or tampering attempts.
   - Dedicated "Flagged Trips" filtering and deep-dive route replay with breadcrumb telemetry.

4. Fleet Telemetry & Fuel Consumption Analytics:
   - High-level dashboards visualizing fuel requested vs. fuel consumed, mileage trends, efficiency metrics, and vehicle health.
   - Helps management spot efficiency leaks across trucks and routes.

5. Operations & Asset Management:
   - Vehicle Directory: Fuel capacity, odometer, active status, and maintenance stats.
   - Driver Directory: Assigned assets, status, contacts, and trip histories.
   - Saved Logistics Hubs: Ports, warehouses, distribution centers, and bulk terminals.
   - Formal PDF / Printable Trip Manifests and audit-ready reporting.

---
### 3. TECHNICAL & DESIGN IDENTITY
- Tech Stack Used in App: Next.js (App/Pages), Tailwind CSS, Framer Motion, Leaflet / React-Leaflet, Lucide Icons, Recharts.
- Visual Aesthetic & Color Palette:
  - Primary Accent: Deep Blue (#2563eb / #1e40af) & Emerald Green (#059669 / #10b981 for active motion & efficiency).
  - Anomaly / Alert Colors: Rose / Crimson (#e11d48 / #f43f5e for stoppages) and Amber (#f59e0b for GPS drops).
  - Backgrounds & Surface: Clean corporate slate/white (#f8fafc, #ffffff) with subtle slate borders and modern card elevations.
- Brand Tone: Professional, reliable, data-driven, mission-critical, enterprise-grade.

---
### 4. GOAL FOR THE LANDING PAGE
I need a comprehensive plan and structure for the landing page:
1. Recommended Section Architecture (Hero, Live Demo/Interactive Preview, Core Value Pillars, Feature Deep Dives, Real-Time Flagging Spotlight, Analytics Dashboard Showcase, Social Proof/Stats, Final Call-To-Action).
2. Compelling Headlines, Subheadlines, and Feature Copy tailored to logistics operators.
3. Interactive Component Ideas (e.g., interactive route demo widget, fuel savings calculator, or side-by-side trip flag viewer).
4. Tech & Component Checklist for implementation in Next.js + Tailwind CSS.
