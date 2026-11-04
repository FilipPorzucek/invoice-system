import { FilterService } from 'primeng/api';

export const DATE_RANGE_FILTER = 'dateRange';

export interface DateRange {
  from: Date | null;
  to: Date | null;
}

const toIsoDate = (date: Date): string => {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
};

export function registerDateRangeFilter(filterService: FilterService): void {
  filterService.register(DATE_RANGE_FILTER, (value: string | null, range: DateRange | null): boolean => {
    if (!range || (!range.from && !range.to)) {
      return true;
    }
    if (!value) {
      return false;
    }
    const date = String(value).substring(0, 10);
    if (range.from && date < toIsoDate(range.from)) {
      return false;
    }
    if (range.to && date > toIsoDate(range.to)) {
      return false;
    }
    return true;
  });
}
