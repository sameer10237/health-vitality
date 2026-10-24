export type HealthMetricType = 'HR' | 'BP' | 'GLUCOSE' | 'SPO2' | 'SLEEP' | 'WATER' | 'WORKOUT';

export interface VitalsState {
  heartRate: number; // bpm
  restingHeartRate: number;
  hrv: number; // ms
  systolic: number; // mmHg
  diastolic: number; // mmHg
  glucose: number; // mg/dL
  glucoseContext: 'Fasting' | 'Post-Prandial' | 'Pre-Meal';
  spo2: number; // %
  recoveryScore: number; // 0-100
  sleepHours: number; // hrs
  sleepQuality: number; // %
  waterIntake: number; // ml
  waterGoal: number; // ml
  activeCalories: number;
  calorieGoal: number;
  stepCount: number;
  stepGoal: number;
  lastUpdated: string;
}

export interface MetricTrendPoint {
  time: string;
  hr: number;
  systolic: number;
  diastolic: number;
  glucose: number;
  recovery: number;
}

export interface DeviceConnection {
  id: string;
  name: string;
  type: 'BLE' | 'AppleHealth' | 'HealthConnect';
  status: 'connected' | 'syncing' | 'disconnected';
  battery: number;
  lastSync: string;
  protocol: string;
}

export interface HealthLogEntry {
  id: string;
  timestamp: string;
  category: 'Vitals' | 'Nutrition' | 'Activity' | 'Sleep';
  title: string;
  value: string;
  unit: string;
  status: 'optimal' | 'elevated' | 'critical' | 'normal';
  source: string;
  encrypted: boolean;
}
