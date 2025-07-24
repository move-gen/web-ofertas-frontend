import { StrapiAuthResponse, StrapiCredentials } from './types';

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
      localStorage.setItem('authToken', data.jwt);
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
  localStorage.removeItem('authToken');
}

export function getToken(): string | null {
  return localStorage.getItem('authToken');
} 