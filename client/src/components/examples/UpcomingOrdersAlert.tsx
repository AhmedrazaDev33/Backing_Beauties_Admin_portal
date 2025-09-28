import UpcomingOrdersAlert from '../UpcomingOrdersAlert';

export default function UpcomingOrdersAlertExample() {
  // todo: remove mock functionality
  const mockOrders = [
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
    },
    {
      id: "003",
      customerName: "Emma Davis",
      deliveryDate: "Jan 23, 2024", 
      daysTillDelivery: 3
    }
  ];

  return (
    <UpcomingOrdersAlert
      upcomingOrders={mockOrders}
      onDismiss={() => console.log('Alert dismissed')}
      onViewOrder={(id) => console.log('View order:', id)}
    />
  );
}