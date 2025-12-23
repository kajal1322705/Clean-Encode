import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, ArrowUpDown, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  type FieldMap,
  getTableColumns,
  formatFieldValue,
  getConditionalClass,
  getStatusClass,
} from "@/data/fieldMapper";
import { cn } from "@/lib/utils";

interface EntityTableProps<T> {
  data: T[];
  fieldMap: FieldMap;
  isLoading?: boolean;
  onRowClick?: (row: T) => void;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  actions?: Array<{
    label: string;
    onClick: (row: T) => void;
    icon?: React.ReactNode;
  }>;
  idField?: string;
}

export function EntityTable<T extends Record<string, unknown>>({
  data,
  fieldMap,
  isLoading = false,
  onRowClick,
  onEdit,
  onDelete,
  actions = [],
  idField = "id",
}: EntityTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [filters, setFilters] = useState<Record<string, string>>({});

  const columns = getTableColumns(fieldMap);
  const filterableColumns = columns.filter(c => c.filterable);

  const filteredData = useMemo(() => {
    let result = [...data];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(row =>
        columns.some(col => {
          const value = row[col.id];
          return value && String(value).toLowerCase().includes(term);
        })
      );
    }

    Object.entries(filters).forEach(([field, value]) => {
      if (value && value !== "all") {
        result = result.filter(row => row[field] === value);
      }
    });

    if (sortField) {
      result.sort((a, b) => {
        const aVal = a[sortField];
        const bVal = b[sortField];
        if (aVal === null || aVal === undefined) return 1;
        if (bVal === null || bVal === undefined) return -1;
        const comparison = String(aVal).localeCompare(String(bVal));
        return sortDirection === "asc" ? comparison : -comparison;
      });
    }

    return result;
  }, [data, searchTerm, filters, sortField, sortDirection, columns]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(d => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const renderCellValue = (column: typeof columns[0], row: T) => {
    const value = row[column.id];
    const formatted = formatFieldValue(column, value);
    const conditionalClass = getConditionalClass(column, value, row);

    if (column.type === "select" && column.conditionalClass) {
      return (
        <Badge variant="secondary" className={cn("capitalize", conditionalClass)}>
          {String(value).replace(/_/g, " ")}
        </Badge>
      );
    }

    return <span className={conditionalClass}>{formatted}</span>;
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  const hasActions = onEdit || onDelete || actions.length > 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-9"
            data-testid="input-table-search"
          />
        </div>

        {filterableColumns.map(col => (
          <Select
            key={col.id}
            value={filters[col.id] || "all"}
            onValueChange={value => setFilters(f => ({ ...f, [col.id]: value }))}
          >
            <SelectTrigger className="w-[150px]" data-testid={`filter-${col.id}`}>
              <SelectValue placeholder={col.label} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All {col.label}</SelectItem>
              {col.options?.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ))}
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map(col => (
                <TableHead
                  key={col.id}
                  className={cn(col.sortable && "cursor-pointer select-none")}
                  onClick={() => col.sortable && handleSort(col.id)}
                >
                  <div className="flex items-center gap-1">
                    {col.label}
                    {col.sortable && (
                      <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
                    )}
                  </div>
                </TableHead>
              ))}
              {hasActions && <TableHead className="w-[50px]">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (hasActions ? 1 : 0)}
                  className="h-24 text-center text-muted-foreground"
                >
                  No results found
                </TableCell>
              </TableRow>
            ) : (
              filteredData.map(row => (
                <TableRow
                  key={row[idField] as string}
                  className={cn(onRowClick && "cursor-pointer")}
                  onClick={() => onRowClick?.(row)}
                  data-testid={`row-${row[idField]}`}
                >
                  {columns.map(col => (
                    <TableCell key={col.id}>{renderCellValue(col, row)}</TableCell>
                  ))}
                  {hasActions && (
                    <TableCell onClick={e => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" data-testid={`actions-${row[idField]}`}>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {onEdit && (
                            <DropdownMenuItem onClick={() => onEdit(row)} data-testid={`edit-${row[idField]}`}>
                              Edit
                            </DropdownMenuItem>
                          )}
                          {actions.map((action, i) => (
                            <DropdownMenuItem key={i} onClick={() => action.onClick(row)}>
                              {action.icon}
                              {action.label}
                            </DropdownMenuItem>
                          ))}
                          {onDelete && (
                            <DropdownMenuItem
                              onClick={() => onDelete(row)}
                              className="text-destructive"
                              data-testid={`delete-${row[idField]}`}
                            >
                              Delete
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="text-sm text-muted-foreground">
        Showing {filteredData.length} of {data.length} records
      </div>
    </div>
  );
}
