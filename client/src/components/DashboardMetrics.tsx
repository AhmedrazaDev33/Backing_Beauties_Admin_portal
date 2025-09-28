import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, DollarSign, Clock, Users } from "lucide-react";

interface DashboardMetricsProps {
  totalOrders: number;
  totalRevenue: number;
  upcomingOrders: number;
  totalCustomers: number;
}

export default function DashboardMetrics({ 
  totalOrders, 
  totalRevenue, 
  upcomingOrders, 
  totalCustomers 
}: DashboardMetricsProps) {
  const metrics = [
    {
      title: "Total Orders",
      value: totalOrders,
      icon: Package,
      description: "All time orders"
    },
    {
      title: "Total Revenue",
      value: `$${totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      description: "Total earnings"
    },
    {
      title: "Upcoming Orders",
      value: upcomingOrders,
      icon: Clock,
      description: "Orders to deliver"
    },
    {
      title: "Total Customers",
      value: totalCustomers,
      icon: Users,
      description: "Registered customers"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map((metric) => {
        const IconComponent = metric.icon;
        return (
          <Card key={metric.title} className="hover-elevate" data-testid={`metric-${metric.title.toLowerCase().replace(' ', '-')}`}>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {metric.title}
              </CardTitle>
              <IconComponent className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid={`text-${metric.title.toLowerCase().replace(' ', '-')}-value`}>
                {metric.value}
              </div>
              <p className="text-xs text-muted-foreground">
                {metric.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}