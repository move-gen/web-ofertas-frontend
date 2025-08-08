import { StrapiAuthResponse, StrapiCredentials } from './types';
import Cookies from 'js-cookie';

export async function login(
  credentials: StrapiCredentials
): Promise<StrapiAuthResponse> {
  try {
    const response = await fetch(`/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.error?.message || 'Failed to login. Please check your credentials.'
      );
    }

    const data: StrapiAuthResponse = await response.json();
    if (data.jwt) {
      Cookies.set('authToken', data.jwt, { expires: 7, secure: true, sameSite: 'strict' });
    }
    return data;
  } catch (error) {
    console.error('Login failed:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unexpected error occurred during login.');
  }
}

export function logout(): void {
  Cookies.remove('authToken');
}

export function getToken(): string | undefined {
  return Cookies.get('authToken');
}
