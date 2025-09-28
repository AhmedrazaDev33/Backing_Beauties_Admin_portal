import CustomerCard from '../CustomerCard';

export default function CustomerCardExample() {
  // todo: remove mock functionality
  return (
    <div className="max-w-md">
      <CustomerCard
        id="001"
        name="Emma Thompson"
        phone="+1 (555) 123-4567"
        email="emma.thompson@email.com"
        address="123 Main Street, Downtown, NY 10001"
        totalOrders={8}
        onView={(id) => console.log('View customer:', id)}
      />
    </div>
  );
}