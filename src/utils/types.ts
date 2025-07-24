export interface StrapiCredentials {
  identifier: string;
  password?: string;
}

export interface StrapiUser {
  id: number;
  username: string;
  email: string;
  provider: string;
  confirmed: boolean;
  blocked: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StrapiAuthResponse {
  jwt: string;
  user: StrapiUser;
} 