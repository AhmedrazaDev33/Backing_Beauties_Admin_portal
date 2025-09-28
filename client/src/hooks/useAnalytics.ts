import { useQuery } from "@tanstack/react-query";

interface DashboardMetrics {
  totalOrders: number;
  totalRevenue: number;
  upcomingOrders: number;
  totalCustomers: number;
}

interface UpcomingReminder {
  id: string;
  customerName: string;
  deliveryDate: string;
  daysTillDelivery: number;
}

// Get dashboard metrics
export function useDashboardMetrics() {
  return useQuery<DashboardMetrics>({
    queryKey: ['analytics', 'metrics'],
    queryFn: () => fetch('/api/analytics/metrics').then(res => res.json()),
  });
}

// Get revenue data with optional date range
export function useRevenue(startDate?: string, endDate?: string) {
  const params = new URLSearchParams();
  if (startDate) params.append('start_date', startDate);
  if (endDate) params.append('end_date', endDate);
  
  const queryString = params.toString();
  const queryKey = ['analytics', 'revenue', startDate, endDate];
  
  return useQuery<{ revenue: number }>({
    queryKey,
    queryFn: () => fetch(`/api/analytics/revenue${queryString ? `?${queryString}` : ''}`).then(res => res.json()),
  });
}

// Get upcoming reminders
export function useUpcomingReminders(days: number = 1) {
  return useQuery<UpcomingReminder[]>({
    queryKey: ['analytics', 'reminders', days],
    queryFn: () => fetch(`/api/analytics/upcoming-reminders?days=${days}`).then(res => res.json()),
  });
}