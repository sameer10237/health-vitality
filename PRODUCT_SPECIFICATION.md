# Vitalis Health Engine: Product Specification & Architectural Blueprint

## 1. Product Vision & Target Audience
- Core Value Proposition: Unified zero-trust health cockpit bridging everyday wellness telemetry with physician-ready diagnostic metrics.
- Primary User Personas:
  1. The Longevity & Fitness Optimizer (Alex, 32)
  2. The Proactive Chronic Tracker (Elena, 58)
  3. The Stress & Sleep Recovery Seeker (Marcus, 44)

## 2. Core Biometric & Clinical Tracking Modules
- Activity & Workouts (GPS, METs, Heart Rate Zones 1-5)
- Nutrition & Hydration (Macros, Micros, Smart Water Scheduling)
- Clinical Vitals (AHA 2026 Blood Pressure, Fasting & Post-Prandial Glucose, SpO2, Core Body Temperature)
- Sleep & Recovery Index (Deep/REM architecture, rMSSD HRV weighting)

## 3. Ecosystem Integration & BLE 5.2 Specifications
- Apple HealthKit native background delivery via HKObserverQuery and anchor deltas
- Google Health Connect Android 14+ Jetpack client
- Direct Bluetooth Low Energy (BLE 5.2) GATT Profiles:
  - 0x180D (Heart Rate Service)
  - 0x1810 (Blood Pressure Service)
  - 0x1808 (Glucose Service)
- Deduplication Matrix: Direct Hardware BLE > HealthKit > Health Connect > Manual Log
