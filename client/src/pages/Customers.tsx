import CustomerCard from "@/components/CustomerCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, Search, Users } from "lucide-react";
import { useState, useMemo } from "react";
import { useCustomers } from "@/hooks/useCustomers";

export default function Customers() {
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch customers from API
  const { data: customers = [], isLoading: customersLoading } = useCustomers(searchTerm);

  const handleNewCustomer = () => {
    console.log('New customer button clicked');
  };

  const handleViewCustomer = (customerId: string) => {
    console.log('View customer:', customerId);
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    console.log('Search term:', value);
  };

  // Calculate stats from real data
  const totalCustomers = customers.length;
  const totalOrders = customers.reduce((sum, customer) => sum + customer.totalOrders, 0);
  const avgOrdersPerCustomer = totalCustomers > 0 ? (totalOrders / totalCustomers).toFixed(1) : "0";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" data-testid="text-customers-title">
            Customers Management
          </h1>
          <p className="text-muted-foreground">
            Manage your customer database and view their order history.
          </p>
        </div>
        <Button onClick={handleNewCustomer} data-testid="button-new-customer">
          <Plus className="mr-2 h-4 w-4" />
          New Customer
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Customers
            </CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-customers">
              {totalCustomers}
            </div>
            <p className="text-xs text-muted-foreground">Registered customers</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Orders
            </CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-customer-orders">
              {totalOrders}
            </div>
            <p className="text-xs text-muted-foreground">From all customers</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg. Orders per Customer
            </CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-avg-orders">
              {avgOrdersPerCustomer}
            </div>
            <p className="text-xs text-muted-foreground">Average orders</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Customers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search by name, phone, email, or customer ID..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
              data-testid="input-search-customers"
            />
          </div>
        </CardContent>
      </Card>

      {/* Customers Grid */}
      {customersLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-1/2 mb-4"></div>
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-muted rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : customers.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {customers.map((customer) => (
            <CustomerCard
              key={customer.id}
              {...customer}
              onView={handleViewCustomer}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              {searchTerm ? 'No customers found matching your search.' : 'No customers yet.'}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              {searchTerm ? 'Try adjusting your search term or add a new customer.' : 'Add your first customer to get started.'}
            </p>
            <Button 
              onClick={handleNewCustomer}
              className="mt-4"
              data-testid="button-create-first-customer"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Customer
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}