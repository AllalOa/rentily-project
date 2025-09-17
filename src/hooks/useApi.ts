import { useState, useEffect, useCallback } from 'react'
import { ApiResponse } from '@/types'

interface UseApiState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

interface UseApiOptions {
  immediate?: boolean
  onSuccess?: (data: any) => void
  onError?: (error: string) => void
}

export function useApi<T>(
  apiCall: () => Promise<ApiResponse<T>>,
  options: UseApiOptions = {}
) {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  })

  const { immediate = false, onSuccess, onError } = options

  const execute = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      const response = await apiCall()
      setState({
        data: response.data,
        loading: false,
        error: null,
      })
      onSuccess?.(response.data)
      return response
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred'
      setState({
        data: null,
        loading: false,
        error: errorMessage,
      })
      onError?.(errorMessage)
      throw error
    }
  }, [apiCall, onSuccess, onError])

  useEffect(() => {
    if (immediate) {
      execute()
    }
  }, [immediate, execute])

  return {
    ...state,
    execute,
    refetch: execute,
  }
}

export function useApiMutation<T, P = any>(
  apiCall: (params: P) => Promise<ApiResponse<T>>,
  options: UseApiOptions = {}
) {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  })

  const { onSuccess, onError } = options

  const mutate = useCallback(async (params: P) => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      const response = await apiCall(params)
      setState({
        data: response.data,
        loading: false,
        error: null,
      })
      onSuccess?.(response.data)
      return response
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred'
      setState({
        data: null,
        loading: false,
        error: errorMessage,
      })
      onError?.(errorMessage)
      throw error
    }
  }, [apiCall, onSuccess, onError])

  return {
    ...state,
    mutate,
  }
}

export function usePagination<T>(
  apiCall: (page: number, limit: number) => Promise<ApiResponse<{ data: T[]; total: number; page: number; limit: number }>>,
  initialPage = 1,
  initialLimit = 10
) {
  const [state, setState] = useState({
    data: [] as T[],
    loading: false,
    error: null as string | null,
    page: initialPage,
    limit: initialLimit,
    total: 0,
    hasMore: false,
  })

  const fetchData = useCallback(async (page: number, reset = false) => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      const response = await apiCall(page, state.limit)
      const { data, total, page: currentPage, limit } = response.data
      
      setState(prev => ({
        data: reset ? data : [...prev.data, ...data],
        loading: false,
        error: null,
        page: currentPage,
        limit,
        total,
        hasMore: currentPage * limit < total,
      }))
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'An error occurred',
      }))
    }
  }, [apiCall, state.limit])

  const loadMore = useCallback(() => {
    if (!state.loading && state.hasMore) {
      fetchData(state.page + 1)
    }
  }, [state.loading, state.hasMore, state.page, fetchData])

  const refresh = useCallback(() => {
    fetchData(1, true)
  }, [fetchData])

  useEffect(() => {
    fetchData(initialPage, true)
  }, [fetchData, initialPage])

  return {
    ...state,
    loadMore,
    refresh,
  }
}
