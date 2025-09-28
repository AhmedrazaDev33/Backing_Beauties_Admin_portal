import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { OrderWithCustomer, InsertOrder, UpdateOrder, OrderStatus } from "@shared/schema";

// Get all orders with optional filters
export function useOrders(filters?: {
  status?: OrderStatus;
  customerId?: string;
  startDate?: string;
  endDate?: string;
  upcomingDays?: number;
}) {
  const params = new URLSearchParams();
  if (filters?.status) params.append('status', filters.status);
  if (filters?.customerId) params.append('customer_id', filters.customerId);
  if (filters?.startDate) params.append('start_date', filters.startDate);
  if (filters?.endDate) params.append('end_date', filters.endDate);
  if (filters?.upcomingDays) params.append('upcoming_days', filters.upcomingDays.toString());
  
  const queryString = params.toString();
  const queryKey = ['orders', filters];
  
  return useQuery<OrderWithCustomer[]>({
    queryKey,
    queryFn: () => fetch(`/api/orders${queryString ? `?${queryString}` : ''}`).then(res => res.json()),
  });
}

// Get single order
export function useOrder(orderId: string) {
  return useQuery<OrderWithCustomer>({
    queryKey: ['orders', orderId],
    queryFn: () => fetch(`/api/orders/${orderId}`).then(res => res.json()),
    enabled: !!orderId,
  });
}

// Create order mutation
export function useCreateOrder() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: InsertOrder) =>
      apiRequest('POST', '/api/orders', data),
    onSuccess: () => {
      // Invalidate and refetch orders
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
}

// Update order mutation
export function useUpdateOrder() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateOrder }) =>
      apiRequest('PUT', `/api/orders/${id}`, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['orders', id] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
}

// Update order status mutation
export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) =>
      apiRequest('PATCH', `/api/orders/${id}/status`, { status }),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['orders', id] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
}

// Delete order mutation
export function useDeleteOrder() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) =>
      apiRequest('DELETE', `/api/orders/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
}