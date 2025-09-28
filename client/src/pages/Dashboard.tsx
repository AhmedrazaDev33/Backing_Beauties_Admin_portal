import DashboardMetrics from "@/components/DashboardMetrics";
import UpcomingOrdersAlert from "@/components/UpcomingOrdersAlert";
import DateRangeFilter from "@/components/DateRangeFilter";
import OrderCard from "@/components/OrderCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Filter } from "lucide-react";
import { useState } from "react";
import { DateRange } from "react-day-picker";
import { useDashboardMetrics, useUpcomingReminders } from "@/hooks/useAnalytics";
import { useOrders } from "@/hooks/useOrders";
import { format } from "date-fns";

export default function Dashboard() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  
  // Fetch real data from API
  const { data: metrics, isLoading: metricsLoading } = useDashboardMetrics();
  const { data: upcomingReminders = [], isLoading: remindersLoading } = useUpcomingReminders(2);
  
  // Get recent orders with date filtering
  const ordersFilter = dateRange?.from && dateRange?.to 
    ? {
        startDate: format(dateRange.from, 'yyyy-MM-dd'),
        endDate: format(dateRange.to, 'yyyy-MM-dd')
      }
    : undefined;
  
  const { data: recentOrders = [], isLoading: ordersLoading } = useOrders(ordersFilter);

  const handleNewOrder = () => {
    console.log('New order button clicked');
  };

  const handleViewOrder = (orderId: string) => {
    console.log('View order:', orderId);
  };

  const handleEditOrder = (orderId: string) => {
    console.log('Edit order:', orderId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" data-testid="text-dashboard-title">
            Dashboard
          </h1>
          <p className="text-muted-foreground">
            Welcome back! Here's what's happening with your bakery.
          </p>
        </div>
        <Button onClick={handleNewOrder} data-testid="button-new-order">
          <Plus className="mr-2 h-4 w-4" />
          New Order
        </Button>
      </div>

      {/* Upcoming Orders Alert */}
      {!remindersLoading && upcomingReminders.length > 0 && (
        <UpcomingOrdersAlert
          upcomingOrders={upcomingReminders}
          onViewOrder={handleViewOrder}
          onDismiss={() => console.log('Alert dismissed')}
        />
      )}

      {/* Metrics */}
      {metricsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-muted rounded w-3/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : metrics ? (
        <DashboardMetrics
          totalOrders={metrics.totalOrders}
          totalRevenue={metrics.totalRevenue}
          upcomingOrders={metrics.upcomingOrders}
          totalCustomers={metrics.totalCustomers}
        />
      ) : (
        <DashboardMetrics
          totalOrders={0}
          totalRevenue={0}
          upcomingOrders={0}
          totalCustomers={0}
        />
      )}

      {/* Filters */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-4">
          <CardTitle className="text-lg">Recent Orders</CardTitle>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <DateRangeFilter
              onDateRangeChange={setDateRange}
              placeholder="Filter by date"
            />
          </div>
        </CardHeader>
        <CardContent>
          {ordersLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[...Array(2)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-4 bg-muted rounded w-1/2 mb-4"></div>
                    <div className="h-32 bg-muted rounded mb-4"></div>
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : recentOrders.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {recentOrders.slice(0, 6).map((order) => (
                <OrderCard
                  key={order.id}
                  id={order.id}
                  customerName={order.customer.name}
                  cakeImage={order.cakeImage || undefined}
                  writingOnCake={order.writingOnCake || undefined}
                  orderDate={format(new Date(order.orderDate), 'yyyy-MM-dd')}
                  deliveryDate={format(new Date(order.deliveryDate), 'yyyy-MM-dd')}
                  price={parseFloat(order.price)}
                  status={order.status}
                  notes={order.notes || undefined}
                  onEdit={handleEditOrder}
                  onView={handleViewOrder}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No orders found for the selected date range.</p>
              <Button 
                onClick={handleNewOrder}
                className="mt-4"
                data-testid="button-create-first-order"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Order
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}