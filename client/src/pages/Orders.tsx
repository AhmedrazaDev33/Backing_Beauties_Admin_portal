import OrderCard, { OrderStatus } from "@/components/OrderCard";
import DateRangeFilter from "@/components/DateRangeFilter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Plus, Search, Filter } from "lucide-react";
import { useState } from "react";
import { DateRange } from "react-day-picker";

export default function Orders() {
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [activeTab, setActiveTab] = useState("all");

  // todo: remove mock functionality
  const mockOrders = [
    {
      id: "001",
      customerName: "Sarah Johnson",
      cakeImage: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop",
      writingOnCake: "Happy Birthday Emma!",
      orderDate: "2024-01-15",
      deliveryDate: "2024-01-20",
      price: 85.50,
      status: "Pending" as OrderStatus,
      notes: "Customer requested pink roses decoration"
    },
    {
      id: "002",
      customerName: "Mike Wilson",
      cakeImage: "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=400&h=300&fit=crop",
      writingOnCake: "Congratulations!",
      orderDate: "2024-01-14",
      deliveryDate: "2024-01-19",
      price: 120.00,
      status: "Completed" as OrderStatus
    },
    {
      id: "003",
      customerName: "Emma Thompson",
      cakeImage: "https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?w=400&h=300&fit=crop",
      writingOnCake: "Happy Anniversary!",
      orderDate: "2024-01-12",
      deliveryDate: "2024-01-18",
      price: 95.00,
      status: "Cancelled" as OrderStatus,
      notes: "Customer cancelled due to change of plans"
    },
    {
      id: "004",
      customerName: "David Chen",
      cakeImage: "https://images.unsplash.com/photo-1557925923-cd4648e8ac1d?w=400&h=300&fit=crop",
      orderDate: "2024-01-13",
      deliveryDate: "2024-01-21",
      price: 75.00,
      status: "Pending" as OrderStatus
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

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    console.log('Search term:', value);
  };

  const filteredOrders = mockOrders.filter(order => {
    const matchesTab = activeTab === "all" || order.status.toLowerCase() === activeTab;
    const matchesSearch = order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.id.includes(searchTerm);
    return matchesTab && matchesSearch;
  });

  const getOrderCounts = () => {
    return {
      all: mockOrders.length,
      pending: mockOrders.filter(o => o.status === "Pending").length,
      completed: mockOrders.filter(o => o.status === "Completed").length,
      cancelled: mockOrders.filter(o => o.status === "Cancelled").length
    };
  };

  const counts = getOrderCounts();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" data-testid="text-orders-title">
            Orders Management
          </h1>
          <p className="text-muted-foreground">
            Manage all your bakery orders and track their status.
          </p>
        </div>
        <Button onClick={handleNewOrder} data-testid="button-new-order">
          <Plus className="mr-2 h-4 w-4" />
          New Order
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search by customer name or order ID..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
              data-testid="input-search-orders"
            />
          </div>
          <DateRangeFilter
            onDateRangeChange={setDateRange}
            placeholder="Filter by date range"
          />
        </CardContent>
      </Card>

      {/* Orders Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4" data-testid="tabs-order-status">
          <TabsTrigger value="all" data-testid="tab-all-orders">
            All ({counts.all})
          </TabsTrigger>
          <TabsTrigger value="pending" data-testid="tab-pending-orders">
            Pending ({counts.pending})
          </TabsTrigger>
          <TabsTrigger value="completed" data-testid="tab-completed-orders">
            Completed ({counts.completed})
          </TabsTrigger>
          <TabsTrigger value="cancelled" data-testid="tab-cancelled-orders">
            Cancelled ({counts.cancelled})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {filteredOrders.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  {...order}
                  onEdit={handleEditOrder}
                  onView={handleViewOrder}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-muted-foreground text-lg">
                  No orders found matching your criteria.
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Try adjusting your search or date filters.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}