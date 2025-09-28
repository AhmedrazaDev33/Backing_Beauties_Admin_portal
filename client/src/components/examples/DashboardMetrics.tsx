import DashboardMetrics from '../DashboardMetrics';

export default function DashboardMetricsExample() {
  // todo: remove mock functionality
  return (
    <DashboardMetrics 
      totalOrders={156}
      totalRevenue={8420}
      upcomingOrders={7}
      totalCustomers={42}
    />
  );
}