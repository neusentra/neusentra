export interface TokenPayload {
  loginId: string;
  userId: string;
  name: string;
  role: string;
}

export interface RefreshTokenPayload extends TokenPayload {
  refresh_token: string;
}
