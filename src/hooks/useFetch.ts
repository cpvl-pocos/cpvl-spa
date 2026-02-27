import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { getHeaderOptions } from '../services';
import { useNavigate } from 'react-router-dom';

interface IProps {
  method?: 'POST' | 'GET' | 'PATCH' | 'PUT' | 'DELETE';
  url?: string;
  body?: any;
  options?: RequestInit;
}

interface FetchError extends Error {
  status?: number;
  response?: any;
}

const useFetch = <T>({ method = 'GET', url, body, options }: IProps) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<FetchError | null>(null);

  const [, setIsLogged] = useLocalStorage(
    (import.meta.env.VITE_LOGGED_KEY || 'APP_LOGGED') as string,
    false
  );
  const navigate = useNavigate();
  const abortController = useRef<AbortController | null>(null);

  const doFetch = useCallback(
    async ({
      url: fetchUrl,
      body: fetchBody,
      method: fetchMethod = method
    }: {
      url: string;
      body?: any;
      method?: 'POST' | 'GET' | 'PATCH' | 'PUT' | 'DELETE';
    }) => {
      setLoading(true);
      setError(null);

      // cancela requisição anterior se ainda estiver ativa
      if (abortController.current) {
        abortController.current.abort();
      }
      abortController.current = new AbortController();

      try {
        const response = await fetch(fetchUrl, {
          method: fetchMethod,
          ...(fetchBody && { body: JSON.stringify(fetchBody) }),
          ...getHeaderOptions(),
          ...options,
          signal: abortController.current.signal
        });

        if (!response.ok) {
          let errorMessage = response.statusText || 'Erro na requisição';
          try {
            const errorJson = await response.json();
            errorMessage = errorJson.message || errorMessage;
          } catch (e) {
            // Se não for JSON, ignora e usa o statusText
          }

          const fetchError: FetchError = new Error(errorMessage);
          fetchError.status = response.status;
          throw fetchError;
        }

        const json = await response.json();

        // normaliza resposta no formato `{ data: ... }`
        const normalized = json!.data || json;

        setData(normalized);
        return normalized as T;
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          setError(err);

          if (err.status === 401) {
            setIsLogged(false);
          }
          if (err.status === 403) {
            navigate('/');
          }
        }
      } finally {
        setLoading(false);
      }
    },
    [method, navigate, options, setIsLogged]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // efeito inicial caso `url` seja passado direto
  useEffect(() => {
    if (url) {
      doFetch({ url, body, method });
    }
    return () => {
      if (abortController.current) {
        abortController.current.abort();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, body, method]);

  return { doFetch, data, error, loading, clearError };
};

export default useFetch;
