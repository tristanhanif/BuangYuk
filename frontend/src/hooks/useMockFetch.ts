"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface UseMockFetchOptions {
  delayMs?: number;
  errorRate?: number;
}

interface MockFetchState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Simulasi network delay + kemungkinan error, supaya state loading/error
 * beneran bisa di-test, bukan cuma dummy statis yang selalu sukses instan.
 */
export function useMockFetch<T>(mockData: T, options?: UseMockFetchOptions): MockFetchState<T> {
  const { delayMs = 600, errorRate = 0 } = options ?? {};
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      const shouldError = Math.random() < errorRate;
      if (shouldError) {
        setError("Gagal memuat data. Coba lagi, ya.");
        setData(null);
        setIsLoading(false);
        return;
      }
      setData(mockData);
      setIsLoading(false);
    }, delayMs);
  }, [mockData, delayMs, errorRate]);

  const load = useCallback(() => {
    setIsLoading(true);
    setError(null);
    startTimer();
  }, [startTimer]);

  useEffect(() => {
    startTimer();
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [startTimer]);

  return { data, isLoading, error, refetch: load };
}
