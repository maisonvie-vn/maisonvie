import React from "react";
import Skeleton from "./Skeleton";

export interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
  sortable?: boolean;
  sortKey?: string;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  pagination?: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    totalCount: number;
  };
  sort?: {
    column: string | null;
    direction: "asc" | "desc";
    onSortChange: (column: string, direction: "asc" | "desc") => void;
  };
  onRowClick?: (row: T) => void;
}

export function DataTable<T extends { id: string | number }>({
  columns,
  data,
  loading = false,
  pagination,
  sort,
  onRowClick,
}: DataTableProps<T>) {
  const handleSortClick = (columnKey: string) => {
    if (!sort) return;
    const direction =
      sort.column === columnKey && sort.direction === "asc" ? "desc" : "asc";
    sort.onSortChange(columnKey, direction);
  };

  return (
    <div className="w-full flex flex-col space-y-4">
      {/* Table Container */}
      <div className="w-full overflow-x-auto rounded-2xl glass-panel">
        <table className="min-w-full divide-y divide-gray-100 text-left text-sm font-light">
          <thead className="bg-[#F9F5EE]/50 text-xs font-medium text-gray-500 uppercase tracking-wider">
            <tr>
              {columns.map((column, idx) => (
                <th
                  key={idx}
                  className={`px-6 py-4 cursor-pointer select-none transition-colors duration-150 ${
                    column.sortable ? "hover:bg-gray-100" : ""
                  } ${column.className || ""}`}
                  onClick={() =>
                    column.sortable &&
                    column.sortKey &&
                    handleSortClick(column.sortKey)
                  }
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.header}</span>
                    {column.sortable &&
                      column.sortKey &&
                      sort?.column === column.sortKey && (
                        <span className="text-[#C89A3D]">
                          {sort.direction === "asc" ? " ↑" : " ↓"}
                        </span>
                      )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100/50 bg-white/20">
            {loading ? (
              Array.from({ length: 5 }).map((_, rIdx) => (
                <tr key={rIdx}>
                  {columns.map((_, cIdx) => (
                    <td key={cIdx} className="px-6 py-4">
                      <Skeleton variant="text" className="h-4 w-3/4" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-12 text-center text-gray-400 font-light"
                >
                  Không tìm thấy dữ liệu tương thích.
                </td>
              </tr>
            ) : (
              data.map((row) => (
                <tr
                  key={row.id}
                  onClick={() => onRowClick && onRowClick(row)}
                  className={`transition-colors duration-150 hover:bg-white/40 ${
                    onRowClick ? "cursor-pointer" : ""
                  }`}
                >
                  {columns.map((column, cIdx) => {
                    const content =
                      typeof column.accessor === "function"
                        ? column.accessor(row)
                        : (row[column.accessor] as React.ReactNode);

                    return (
                      <td
                        key={cIdx}
                        className={`px-6 py-4 text-gray-700 ${column.className || ""}`}
                      >
                        {content}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between px-2 text-sm text-gray-500 font-light">
          <div>
            Hiển thị trang{" "}
            <span className="font-normal text-gray-700">
              {pagination.currentPage}
            </span>{" "}
            trên tổng số{" "}
            <span className="font-normal text-gray-700">
              {pagination.totalPages}
            </span>{" "}
            trang ({pagination.totalCount} bản ghi)
          </div>
          <div className="flex items-center space-x-2">
            <button
              disabled={pagination.currentPage === 1}
              onClick={() =>
                pagination.onPageChange(pagination.currentPage - 1)
              }
              className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white/50 text-gray-600 disabled:opacity-40 hover:bg-white transition-colors"
            >
              Trước
            </button>
            {Array.from({ length: pagination.totalPages }).map((_, idx) => {
              const pageNum = idx + 1;
              const isCurrent = pageNum === pagination.currentPage;
              return (
                <button
                  key={pageNum}
                  onClick={() => pagination.onPageChange(pageNum)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                    isCurrent
                      ? "border-[#C89A3D] bg-[#C89A3D] text-white"
                      : "border-gray-200 bg-white/50 text-gray-600 hover:bg-white"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              disabled={pagination.currentPage === pagination.totalPages}
              onClick={() =>
                pagination.onPageChange(pagination.currentPage + 1)
              }
              className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white/50 text-gray-600 disabled:opacity-40 hover:bg-white transition-colors"
            >
              Sau
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
export default DataTable;
