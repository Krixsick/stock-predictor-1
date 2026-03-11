import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as api from '../lib/api'

export function useTickers() {
  return useQuery({
    queryKey: ['tickers'],
    queryFn: api.fetchTickers,
    staleTime: Infinity,
  })
}

export function useHistory(ticker: string, days?: number) {
  return useQuery({
    queryKey: ['history', ticker, days],
    queryFn: () => api.fetchHistory(ticker, days),
    staleTime: 5 * 60 * 1000,
  })
}

export function usePrediction(ticker: string) {
  return useQuery({
    queryKey: ['prediction', ticker],
    queryFn: () => api.fetchPrediction(ticker),
    staleTime: 5 * 60 * 1000,
  })
}

export function useMetrics(ticker: string) {
  return useQuery({
    queryKey: ['metrics', ticker],
    queryFn: () => api.fetchMetrics(ticker),
    staleTime: 30 * 60 * 1000,
  })
}

export function useIndicators(ticker: string, days = 252) {
  return useQuery({
    queryKey: ['indicators', ticker, days],
    queryFn: () => api.fetchIndicators(ticker, days),
    staleTime: 5 * 60 * 1000,
  })
}

export function useRefresh() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.refreshData,
    onSuccess: () => {
      qc.invalidateQueries()
    },
  })
}
