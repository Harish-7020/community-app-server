import { User } from '../entities/user.entity';
import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { SignOptions } from 'jsonwebtoken';
import { AccessTokenJWTPayloadInterface } from '../interfaces/jwt/access-token-jwt-payload.interface';
import { RefreshTokenJWTPayloadInterface } from '../interfaces/jwt/refresh-token-jwt-payload.interface';

@Injectable()
export class JWTService {
  constructor() { }

  generateAccessToken = (
    user: User ,
  ): string => {
    const options: SignOptions = {
      expiresIn: (process.env.ACCESS_TOKEN_EXPIRY || '15m') as any,
    };
    return jwt.sign(
      {
        userID: user.userID,
      } as AccessTokenJWTPayloadInterface,
      process.env.ACCESS_TOKEN_SECRET as string,
      options,
    );
  };

  generateRefreshToken = async (
    user: User ,
  ): Promise<string> => {
    return jwt.sign(
      {
        userID: user.userID,
      } as RefreshTokenJWTPayloadInterface,
      process.env.REFRESH_TOKEN_SECRET as string,
    );
  };

  verifyAccessTokenAndGetPayload(
    token: string,
  ): AccessTokenJWTPayloadInterface {
    // Handle Bearer prefix if present
    if (token && token.startsWith('Bearer ')) {
      token = token.split(' ')[1];
    }
    if (!token) throw new Error('INVALID_ACCESS_TOKEN');
    const { userID }: any = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET as string,
    );
    return { userID };
  }

  verifyRefreshTokenAndGetPayload(
    token: string,
  ): RefreshTokenJWTPayloadInterface {
    // Handle Bearer prefix if present
    if (token && token.startsWith('Bearer ')) {
      token = token.split(' ')[1];
    }
    if (!token) throw new Error('INVALID_REFRESH_TOKEN');
    const { userID }: any = jwt.verify(
      token,
      process.env.REFRESH_TOKEN_SECRET as string,
    );
    return { userID };
  }
}
