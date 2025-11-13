import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';
import { authService } from '../services/authService';

// Mock the authService
jest.mock('../services/authService');

const mockedAuthService = authService as jest.Mocked<typeof authService>;

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <AuthProvider>{children}</AuthProvider>
  );

  it('should initialize with no user', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('should login successfully', async () => {
    const mockUser = { id: 1, email: 'test@example.com' };
    const mockResponse = { user: mockUser, token: 'mock-token' };

    mockedAuthService.login.mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.login({ email: 'test@example.com', password: 'password' });
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAuthenticated).toBe(true);
    expect(localStorage.getItem('user')).toBe(JSON.stringify(mockUser));
  });

  it('should handle login failure', async () => {
    const mockError = {
      response: { data: { detail: 'Invalid credentials' } },
    };

    mockedAuthService.login.mockRejectedValue(mockError);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      try {
        await result.current.login({ email: 'test@example.com', password: 'wrong' });
      } catch (error) {
        // Expected to throw
      }
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.error).toBe('Invalid credentials');
  });

  it('should register successfully', async () => {
    const mockUser = { id: 1, email: 'newuser@example.com' };
    const mockResponse = { user: mockUser, token: 'mock-token' };

    mockedAuthService.register.mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.register({ email: 'newuser@example.com', password: 'password' });
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAuthenticated).toBe(true);
    expect(localStorage.getItem('user')).toBe(JSON.stringify(mockUser));
  });

  it('should logout successfully', async () => {
    const mockUser = { id: 1, email: 'test@example.com' };
    localStorage.setItem('user', JSON.stringify(mockUser));

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(localStorage.getItem('user')).toBeNull();
  });

  it('should restore user from localStorage on mount', async () => {
    const mockUser = { id: 1, email: 'test@example.com' };
    localStorage.setItem('user', JSON.stringify(mockUser));

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('should clear error', async () => {
    const mockError = {
      response: { data: { detail: 'Invalid credentials' } },
    };

    mockedAuthService.login.mockRejectedValue(mockError);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      try {
        await result.current.login({ email: 'test@example.com', password: 'wrong' });
      } catch (error) {
        // Expected to throw
      }
    });

    expect(result.current.error).toBe('Invalid credentials');

    act(() => {
      result.current.clearError();
    });

    expect(result.current.error).toBeNull();
  });
});
