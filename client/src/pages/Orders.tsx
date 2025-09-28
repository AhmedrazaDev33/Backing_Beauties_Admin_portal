import OrderCard, { OrderStatus } from "@/components/OrderCard";
import DateRangeFilter from "@/components/DateRangeFilter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Plus, Search, Filter } from "lucide-react";
import { useState, useMemo } from "react";
import { DateRange } from "react-day-picker";
import { useOrders } from "@/hooks/useOrders";
import { format } from "date-fns";
import OrderDialog from "@/components/OrderDialog";

export default function Orders() {
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [activeTab, setActiveTab] = useState<"all" | OrderStatus>("all");
  const [showOrderDialog, setShowOrderDialog] = useState(false);
  const [editingOrder, setEditingOrder] = useState<any>(null);

  // Prepare filters for API call
  const filters = useMemo(() => {
    const result: any = {};
    
    if (activeTab !== "all") {
      result.status = activeTab;
    }
    
    if (dateRange?.from && dateRange?.to) {
      result.startDate = format(dateRange.from, 'yyyy-MM-dd');
      result.endDate = format(dateRange.to, 'yyyy-MM-dd');
    }
    
    return Object.keys(result).length > 0 ? result : undefined;
  }, [activeTab, dateRange]);

  // Fetch orders from API
  const { data: allOrders = [], isLoading: ordersLoading } = useOrders(filters);

  const handleNewOrder = () => {
    setShowOrderDialog(true);
    setEditingOrder(null);
  };

  const handleViewOrder = (orderId: string) => {
    console.log('View order:', orderId);
  };

  const handleEditOrder = (orderId: string) => {
    const order = filteredOrders.find(o => o.id === orderId);
    if (order) {
      setEditingOrder(order);
      setShowOrderDialog(true);
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    console.log('Search term:', value);
  };

  // Filter orders by search term (local filtering after API fetch)
  const filteredOrders = useMemo(() => {
    if (!searchTerm) return allOrders;
    
    const term = searchTerm.toLowerCase();
    return allOrders.filter(order =>
      order.customer.name.toLowerCase().includes(term) ||
      order.id.toLowerCase().includes(term) ||
      order.customer.phone.includes(term)
    );
  }, [allOrders, searchTerm]);

  // Calculate counts for all tabs (we need to fetch all orders for this)
  const { data: allOrdersForCounts = [] } = useOrders();
  
  const getOrderCounts = () => {
    return {
      all: allOrdersForCounts.length,
      Pending: allOrdersForCounts.filter(o => o.status === "Pending").length,
      Completed: allOrdersForCounts.filter(o => o.status === "Completed").length,
      Cancelled: allOrdersForCounts.filter(o => o.status === "Cancelled").length
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
          <TabsTrigger value="Pending" data-testid="tab-pending-orders">
            Pending ({counts.Pending})
          </TabsTrigger>
          <TabsTrigger value="Completed" data-testid="tab-completed-orders">
            Completed ({counts.Completed})
          </TabsTrigger>
          <TabsTrigger value="Cancelled" data-testid="tab-cancelled-orders">
            Cancelled ({counts.Cancelled})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {ordersLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-4 bg-muted rounded w-1/2 mb-4"></div>
                    <div className="h-32 bg-muted rounded mb-4"></div>
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredOrders.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredOrders.map((order) => (
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
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-muted-foreground text-lg">
                  No orders found matching your criteria.
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Try adjusting your search or date filters, or create your first order.
                </p>
                <Button 
                  onClick={handleNewOrder}
                  className="mt-4"
                  data-testid="button-create-first-order"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Order
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <OrderDialog
        open={showOrderDialog}
        onOpenChange={(open) => {
          setShowOrderDialog(open);
          if (!open) setEditingOrder(null);
        }}
        mode={editingOrder ? "edit" : "create"}
        initialData={editingOrder}
      />
    </div>
  );
}