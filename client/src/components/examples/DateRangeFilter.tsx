import DateRangeFilter from '../DateRangeFilter';

export default function DateRangeFilterExample() {
  return (
    <div className="p-4">
      <DateRangeFilter
        onDateRangeChange={(range) => console.log('Date range selected:', range)}
        placeholder="Filter by date range"
      />
    </div>
  );
}