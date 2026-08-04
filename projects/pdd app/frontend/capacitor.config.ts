import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.neurosignal.app',
  appName: 'NeuroSignal',
  webDir: 'out',
  server: {
    androidScheme: 'https'
  }
};

export default config;
