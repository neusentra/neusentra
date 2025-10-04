export interface TokenPayload {
  loginId: string;
  userId: string;
  name: string;
  role: string;
}

export interface RefreshTokenPayload extends TokenPayload {
  refreshToken: string;
}
