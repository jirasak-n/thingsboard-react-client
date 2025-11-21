export interface LoginResponse {
  token: string;
  refreshToken: string;
  scope?: string;
}

export interface AuthUser {
  sub: string; // email or username
  scopes: string[];
  userId: string;
  firstName?: string;
  lastName?: string;
  enabled: boolean;
  tenantId: string;
  customerId: string;
  isPublic: boolean;
  authority: string;
}

export interface RequestConfig {
  ignoreLoading?: boolean;
  ignoreErrors?: boolean;
  resendRequest?: boolean;
}

