import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.craftus.app',
  appName: 'Craftus',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    GoogleAuth: {
      scopes: ['profile', 'email'],
      serverClientId: '397850525521-jn28irio01k8kc57dbncuslnb8qi7tq3.apps.googleusercontent.com',
      forceCodeForRefreshToken: true,
    }
  },
  android: {
    buildOptions: {
      keystorePath: 'app/craftus-release-key.keystore',
      keystoreAlias: 'craftus-key',
    }
  }
};

export default config;

