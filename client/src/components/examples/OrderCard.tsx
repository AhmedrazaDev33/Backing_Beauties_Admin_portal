import OrderCard from '../OrderCard';

export default function OrderCardExample() {
  // todo: remove mock functionality
  return (
    <div className="max-w-md">
      <OrderCard
        id="001"
        customerName="Sarah Johnson"
        cakeImage="https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop"
        writingOnCake="Happy Birthday Emma!"
        orderDate="2024-01-15"
        deliveryDate="2024-01-20"
        price={85.50}
        status="Pending"
        notes="Customer requested pink roses decoration"
        onEdit={(id) => console.log('Edit order:', id)}
        onView={(id) => console.log('View order:', id)}
      />
    </div>
  );
}