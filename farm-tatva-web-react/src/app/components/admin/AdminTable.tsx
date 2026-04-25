import { ReactNode } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Search, Filter, Download } from "lucide-react";

interface Column {
  key: string;
  header: string;
  render?: (value: any, row: any) => ReactNode;
}

interface AdminTableProps {
  columns: Column[];
  data: any[];
  title?: string;
  searchable?: boolean;
  onSearch?: (query: string) => void;
  onFilter?: () => void;
  onExport?: () => void;
  loading?: boolean;
  emptyMessage?: string;
}

export function AdminTable({
  columns,
  data,
  title,
  searchable = true,
  onSearch,
  onFilter,
  onExport,
  loading = false,
  emptyMessage = "No data available"
}: AdminTableProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {(title || searchable || onFilter || onExport) && (
        <div className="border-b border-gray-200 px-4 py-4 sm:px-6">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            {title && <h3 className="text-lg font-medium text-gray-900">{title}</h3>}
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              {searchable && (
                <div className="relative w-full sm:w-72">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search..."
                    className="w-full pl-10"
                    onChange={(e) => onSearch?.(e.target.value)}
                  />
                </div>
              )}
              {onFilter && (
                <Button variant="outline" size="sm" onClick={onFilter} className="w-full sm:w-auto">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              )}
              {onExport && (
                <Button variant="outline" size="sm" onClick={onExport} className="w-full sm:w-auto">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column.key} className="font-semibold">
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-8">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-gray-600">Loading...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-8 text-gray-500">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, index) => (
                <TableRow key={index} className="hover:bg-gray-50">
                  {columns.map((column) => (
                    <TableCell key={column.key}>
                      {column.render
                        ? column.render(row[column.key], row)
                        : row[column.key]
                      }
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
