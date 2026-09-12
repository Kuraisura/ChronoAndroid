import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.chrono.app',
  appName: 'Chrono',
  webDir: 'dist',
  bundledWebRuntime: false,
  plugins: {
    LocalNotifications: {
      smallIcon: 'ic_stat_chrono',
      iconColor: '#00E5FF',
    },
  },
};

export default config;
