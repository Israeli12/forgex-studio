export const PLAN_LIMITS = {
  free: { builds_per_month: 10, storage_bytes: 500 * 1024 * 1024 },
  pro: { builds_per_month: 100, storage_bytes: 5 * 1024 * 1024 * 1024 },
  team: { builds_per_month: 500, storage_bytes: 20 * 1024 * 1024 * 1024 },
} as const;

export const FRAMEWORKS = [
  { id: 'flutter', name: 'Flutter', icon: 'Box' },
  { id: 'react-native', name: 'React Native', icon: 'Code' },
  { id: 'cordova', name: 'Cordova', icon: 'Smartphone' },
  { id: 'ionic', name: 'Ionic', icon: 'Zap' },
  { id: 'capacitor', name: 'Capacitor', icon: 'Layers' },
] as const;
