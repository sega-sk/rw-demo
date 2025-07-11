import { useState, useEffect } from 'react';
import { cacheManager } from '../services/cache';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseApiOptions {
  immediate?: boolean;
  cacheKey?: string;
  cacheTTL?: number;
  staleWhileRevalidate?: boolean;
  skipCache?: boolean;
  fallbackData?: any;
}

export function useApi<T>(
  apiCall: () => Promise<T>,
  options: UseApiOptions = { immediate: true, staleWhileRevalidate: true }
) {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = async () => {
    if (options.cacheKey) {
      try {
        setState(prev => ({ ...prev, loading: true, error: null }));
        
        const result = await cacheManager.get(
          options.cacheKey!,
          apiCall,
          {
            ttl: options.cacheTTL,
            staleWhileRevalidate: options.staleWhileRevalidate,
            skipCache: options.skipCache
          }
        );
        
        setState({ data: result, loading: false, error: null });
        return result;
      } catch (error) {
        // Use fallback data if provided
        if (options.fallbackData) {
          setState({ data: options.fallbackData, loading: false, error: null });
          return options.fallbackData;
        }
        const errorMessage = error instanceof Error ? error.message : 'An error occurred';
        setState({ data: null, loading: false, error: errorMessage });
        throw error;
      }
    } else {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      try {
        const result = await apiCall();
        setState({ data: result, loading: false, error: null });
        return result;
      } catch (error) {
        // Use fallback data if provided
        if (options.fallbackData) {
          setState({ data: options.fallbackData, loading: false, error: null });
          return options.fallbackData;
        }
        const errorMessage = error instanceof Error ? error.message : 'An error occurred';
        setState({ data: null, loading: false, error: errorMessage });
        throw error;
      }
    }
  };

  const reset = () => {
    setState({ data: null, loading: false, error: null });
  };

  useEffect(() => {
    if (options.immediate) {
      execute().catch(() => {
        // Error already handled in execute function
      });
    }
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
}

export function useMutation<T, P = void>(
  apiCall: (params: P) => Promise<T>
) {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const mutate = async (params: P) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const result = await apiCall(params);
      setState({ data: result, loading: false, error: null });
      
      // Invalidate related cache entries after successful mutations
      if (typeof params === 'object' && params !== null) {
        const paramObj = params as any;
        if (paramObj.invalidateCache) {
          cacheManager.invalidatePattern(paramObj.invalidateCache);
        }
      }
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      setState({ data: null, loading: false, error: errorMessage });
      throw error;
    }
  };

  const reset = () => {
    setState({ data: null, loading: false, error: null });
  };

  return {
    ...state,
    mutate,
    reset,
  };
}