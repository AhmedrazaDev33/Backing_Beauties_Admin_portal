import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarDays, X } from "lucide-react";
import { useState } from "react";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";

interface DateRangeFilterProps {
  onDateRangeChange?: (dateRange: DateRange | undefined) => void;
  placeholder?: string;
}

export default function DateRangeFilter({ 
  onDateRangeChange, 
  placeholder = "Select date range" 
}: DateRangeFilterProps) {
  const [date, setDate] = useState<DateRange | undefined>();
  const [isOpen, setIsOpen] = useState(false);

  const handleDateChange = (newDate: DateRange | undefined) => {
    setDate(newDate);
    onDateRangeChange?.(newDate);
    console.log('Date range changed:', newDate);
  };

  const clearDateRange = () => {
    setDate(undefined);
    onDateRangeChange?.(undefined);
    console.log('Date range cleared');
  };

  const getDisplayText = () => {
    if (!date?.from) return placeholder;
    if (!date.to) return format(date.from, "MMM dd, yyyy");
    return `${format(date.from, "MMM dd")} - ${format(date.to, "MMM dd, yyyy")}`;
  };

  return (
    <div className="flex items-center gap-2">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-auto justify-start text-left font-normal"
            data-testid="button-date-range-picker"
          >
            <CalendarDays className="mr-2 h-4 w-4" />
            <span data-testid="text-date-range-display">{getDisplayText()}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={handleDateChange}
            numberOfMonths={2}
            data-testid="calendar-date-range"
          />
        </PopoverContent>
      </Popover>
      
      {date?.from && (
        <Button
          variant="ghost"
          size="icon"
          onClick={clearDateRange}
          className="h-9 w-9"
          data-testid="button-clear-date-range"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}