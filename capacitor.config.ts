import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'PointToPoint',
  webDir: 'dist'
,
    android: {
       buildOptions: {
          keystorePath: 'c:\Users\Zsolt\Documents\poinnttopoint_keystore.jks',
          keystoreAlias: 'Test',
       }
    }
  };

export default config;
