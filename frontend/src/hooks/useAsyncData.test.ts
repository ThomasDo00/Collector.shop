import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useAsyncData } from './useAsyncData';

describe('useAsyncData', () => {
  it('should load data successfully', async () => {
    const mockData = { id: 1, name: 'Test' };
    const fetchFn = vi.fn().mockResolvedValue(mockData);

    const { result } = renderHook(() =>
      useAsyncData({
        fetchFn,
        errorMessage: 'Failed to load',
      })
    );

    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBe(null);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual(mockData);
    expect(result.current.error).toBe(null);
    expect(fetchFn).toHaveBeenCalledTimes(1);
  });

  it('should handle errors', async () => {
    const error = new Error('Network error');
    const fetchFn = vi.fn().mockRejectedValue(error);

    const { result } = renderHook(() =>
      useAsyncData({
        fetchFn,
        errorMessage: 'Failed to load',
      })
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toBe(null);
    expect(result.current.error).toEqual(error);
  });

  it('should not fetch immediately when immediate is false', () => {
    const fetchFn = vi.fn().mockResolvedValue({ data: 'test' });

    const { result } = renderHook(() =>
      useAsyncData({
        fetchFn,
        immediate: false,
        errorMessage: 'Failed',
      })
    );

    expect(result.current.loading).toBe(false);
    expect(fetchFn).not.toHaveBeenCalled();
  });

  it('should allow manual refetch', async () => {
    const mockData = { id: 1, name: 'Test' };
    const fetchFn = vi.fn().mockResolvedValue(mockData);

    const { result } = renderHook(() =>
      useAsyncData({
        fetchFn,
        immediate: false,
        errorMessage: 'Failed',
      })
    );

    expect(fetchFn).not.toHaveBeenCalled();

    await result.current.refetch();

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.data).toEqual(mockData);
    });

    expect(fetchFn).toHaveBeenCalledTimes(1);
  });
});
