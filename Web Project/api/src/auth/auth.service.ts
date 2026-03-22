import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class AuthService {
  constructor() {
    if (!admin.apps.length) {
      admin.initializeApp({
        // Service account will be loaded from env
        credential: admin.credential.applicationDefault(),
      });
    }
  }

  async validateToken(token: string): Promise<any> {
    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      return decodedToken;
    } catch (error) {
       // For dev mode, if firebase is not configured, we'll allow mock token
       if (process.env.NODE_ENV === 'development' && token === 'mock-token') {
         return { uid: 'mock-user-123', email: 'user@example.com' };
       }
       throw new UnauthorizedException('Invalid Firebase Token');
    }
  }
}
