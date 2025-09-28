import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { CustomerWithOrderCount, Customer, InsertCustomer, UpdateCustomer, OrderWithCustomer } from "@shared/schema";

// Get all customers with optional search
export function useCustomers(search?: string) {
  const params = new URLSearchParams();
  if (search) params.append('search', search);
  
  const queryString = params.toString();
  const queryKey = ['customers', search];
  
  return useQuery<CustomerWithOrderCount[]>({
    queryKey,
    queryFn: () => fetch(`/api/customers${queryString ? `?${queryString}` : ''}`).then(res => res.json()),
  });
}

// Get single customer
export function useCustomer(customerId: string) {
  return useQuery<Customer>({
    queryKey: ['customers', customerId],
    queryFn: () => fetch(`/api/customers/${customerId}`).then(res => res.json()),
    enabled: !!customerId,
  });
}

// Get customer's orders
export function useCustomerOrders(customerId: string) {
  return useQuery<OrderWithCustomer[]>({
    queryKey: ['customers', customerId, 'orders'],
    queryFn: () => fetch(`/api/customers/${customerId}/orders`).then(res => res.json()),
    enabled: !!customerId,
  });
}

// Create customer mutation
export function useCreateCustomer() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: InsertCustomer) =>
      apiRequest('POST', '/api/customers', data),
    onSuccess: () => {
      // Invalidate and refetch customers
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
}

// Update customer mutation
export function useUpdateCustomer() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCustomer }) =>
      apiRequest('PUT', `/api/customers/${id}`, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customers', id] });
    },
  });
}

// Delete customer mutation
export function useDeleteCustomer() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) =>
      apiRequest('DELETE', `/api/customers/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
}