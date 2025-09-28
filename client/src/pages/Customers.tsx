import CustomerCard from "@/components/CustomerCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, Search, Users } from "lucide-react";
import { useState } from "react";

export default function Customers() {
  const [searchTerm, setSearchTerm] = useState("");

  // todo: remove mock functionality
  const mockCustomers = [
    {
      id: "001",
      name: "Sarah Johnson",
      phone: "+1 (555) 123-4567",
      email: "sarah.johnson@email.com",
      address: "123 Oak Street, Downtown, NY 10001",
      totalOrders: 8
    },
    {
      id: "002",
      name: "Mike Wilson",
      phone: "+1 (555) 234-5678",
      email: "mike.wilson@email.com",
      address: "456 Pine Avenue, Midtown, NY 10002",
      totalOrders: 3
    },
    {
      id: "003",
      name: "Emma Thompson",
      phone: "+1 (555) 345-6789",
      email: "emma.thompson@email.com",
      address: "789 Maple Drive, Uptown, NY 10003",
      totalOrders: 12
    },
    {
      id: "004",
      name: "David Chen",
      phone: "+1 (555) 456-7890",
      address: "321 Birch Lane, Suburb, NY 10004",
      totalOrders: 5
    },
    {
      id: "005",
      name: "Lisa Martinez",
      phone: "+1 (555) 567-8901",
      email: "lisa.martinez@email.com",
      address: "654 Cedar Court, Downtown, NY 10005",
      totalOrders: 15
    },
    {
      id: "006",
      name: "Robert Taylor",
      phone: "+1 (555) 678-9012",
      totalOrders: 2
    }
  ];

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

  const filteredCustomers = mockCustomers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm) ||
    customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.id.includes(searchTerm)
  );

  const totalCustomers = mockCustomers.length;
  const totalOrders = mockCustomers.reduce((sum, customer) => sum + customer.totalOrders, 0);
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
      {filteredCustomers.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredCustomers.map((customer) => (
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
              No customers found matching your search.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Try adjusting your search term or add a new customer.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}