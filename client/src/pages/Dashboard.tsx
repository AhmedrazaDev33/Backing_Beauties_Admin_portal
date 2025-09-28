import DashboardMetrics from "@/components/DashboardMetrics";
import UpcomingOrdersAlert from "@/components/UpcomingOrdersAlert";
import DateRangeFilter from "@/components/DateRangeFilter";
import OrderCard from "@/components/OrderCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Filter } from "lucide-react";
import { useState } from "react";
import { DateRange } from "react-day-picker";

export default function Dashboard() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  
  // todo: remove mock functionality
  const mockUpcomingOrders = [
    {
      id: "001",
      customerName: "Sarah Johnson",
      deliveryDate: "Jan 20, 2024",
      daysTillDelivery: 0
    },
    {
      id: "002", 
      customerName: "Mike Wilson",
      deliveryDate: "Jan 21, 2024",
      daysTillDelivery: 1
    }
  ];

  const mockRecentOrders = [
    {
      id: "003",
      customerName: "Emma Thompson",
      cakeImage: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop",
      writingOnCake: "Happy Anniversary!",
      orderDate: "2024-01-15",
      deliveryDate: "2024-01-22",
      price: 125.00,
      status: "Pending" as const,
      notes: "Customer wants pink and white roses"
    },
    {
      id: "004",
      customerName: "David Chen",
      cakeImage: "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=400&h=300&fit=crop",
      writingOnCake: "Happy Birthday Sophie!",
      orderDate: "2024-01-14",
      deliveryDate: "2024-01-21",
      price: 85.50,
      status: "Completed" as const
    }
  ];

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
      <UpcomingOrdersAlert
        upcomingOrders={mockUpcomingOrders}
        onViewOrder={handleViewOrder}
        onDismiss={() => console.log('Alert dismissed')}
      />

      {/* Metrics */}
      <DashboardMetrics
        totalOrders={156}
        totalRevenue={8420}
        upcomingOrders={7}
        totalCustomers={42}
      />

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
          {mockRecentOrders.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {mockRecentOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  {...order}
                  onEdit={handleEditOrder}
                  onView={handleViewOrder}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No orders found for the selected date range.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}