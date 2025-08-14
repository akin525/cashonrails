import React, { memo, useCallback, useState, useEffect } from 'react';
import Pagination from "@/components/pagination";
import Link from 'next/link';
import { TableSkeleton } from './loaders';
import moment from 'moment';
import { useTheme } from 'next-themes';
import { StringUtils } from '@/helpers/extras';

// Types
interface BaseColumn<T> {
    id: keyof T;
    label: string;
    minWidth?: number;
    maxWidth?: number;
    align?: "right" | "left" | "center";
    format?: (value: any) => string;
    fixed?: 'left' | 'right';
    sortable?: boolean;
    sortType?: 'string' | 'number' | 'date' | 'currency' | 'custom';
    customSort?: (a: any, b: any) => number;
}

interface TextColumn<T> extends BaseColumn<T> {
    type?: "text";
}

interface LinkColumn<T> extends BaseColumn<T> {
    type: "link";
}

interface DateColumn<T> extends BaseColumn<T> {
    type: "date";
}
interface DateTimeColumn<T> extends BaseColumn<T> {
    type: "dateTime";
}

interface AmountColumn<T> extends BaseColumn<T> {
    type: "amount";
}

interface CustomColumn<T> extends BaseColumn<T> {
    type: "custom";
    renderCustom?: (value: T) => React.ReactNode;
}



export type Column<T> = TextColumn<T> | LinkColumn<T> | CustomColumn<T> | DateColumn<T> | AmountColumn<T>  | DateTimeColumn<T>;

interface BaseData {
    id: string;
}

interface Data extends BaseData {
    childData?: Record<string, unknown>;
}

type SortDirection = 'asc' | 'desc' | null;

interface SortState {
    field: string | null;
    direction: SortDirection;
}

type TableProps<T> = {
    headers: Column<T>[];
    data: T[];
    pagination?: {
        totalItems: number;
        limit: number;
        totalPages: number;
    };
    onPaginate?: (page: number) => void;
    limit: number;
    onRowClick?: (row: T) => void;
    loading?: boolean | React.ReactNode;
    showPagination?: boolean;
};

// Utility functions
const sortingUtils = {
    currency: (value: string) => {
        return Number(value.replace(/[^0-9.-]+/g, ''));
    },

    extractNumber: (value: string) => {
        const match = value.match(/[\d,.]+/);
        return match ? Number(match[0].replace(/,/g, '')) : 0;
    }
};

// Components
const TableHeader = memo<{ 
    headers: Column<any>[],
    onSort?: (field: string) => void,
    sortState: SortState
}>(({ headers, onSort, sortState }) => {
    const renderSortIcon = (field: string, sortType?: string) => {
        if (sortState.field !== field) {
            return (
                <span className="ml-1 text-gray-400 text-xs flex items-center gap-1">
                    ↕
                    {sortType && <span className="text-gray-400">({sortType})</span>}
                </span>
            );
        }
        return (
            <span className="ml-1 flex items-center gap-1">
                {sortState.direction === 'asc' ? '↑' : '↓'}
                {sortType && <span className="text-gray-400 text-xs">({sortType})</span>}
            </span>
        );
    };

    return (
        <thead>
            <tr className="text-xs uppercase">
                {headers.map((header, index) => (
                    <th
                        key={index}
                        className={`py-2 px-4 text-left font-normal tracking-wide min-w-[120px]
                            ${header.fixed === 'left' ? 'sticky left-0 z-20 bg-white' : ''}
                            ${header.fixed === 'right' ? 'sticky right-0 z-20 bg-white' : ''}
                            ${header.sortable ? 'cursor-pointer hover:bg-gray-50' : ''}`}
                        style={{
                            minWidth: header.minWidth,
                            maxWidth: header.maxWidth,
                            textAlign: header.align || 'left'
                        }}
                        onClick={() => header.sortable && onSort?.(header.id as string)}
                    >
                        <div className="flex items-center gap-1">
                            {header.label}
                            {header.sortable && renderSortIcon(header.id as string, header.sortType)}
                        </div>
                    </th>
                ))}
            </tr>
        </thead>
    );
});

TableHeader.displayName = 'TableHeader';

const TableCell = memo<{
    column: Column<any>;
    value: any;
    row: any;
}>(({ column, value, row }) => {
    const content = (() => {
        switch (column.type) {
            case "custom":
                return column.renderCustom ? column.renderCustom(row) : "N/A";
            case "link":
                return <Link href={value}>{value}</Link>;
            case "amount":
                return <p>{StringUtils.formatWithCommas(value)}</p>;
            case "date":
                return moment(value).isValid() ? 
                    moment(value).format("MMM DD, YYYY") : "N/A";
           case "dateTime":
                return moment(value).isValid() 
                    ? moment(value).format("MMM DD, YYYY, hh:mm A") 
                    : "N/A";

            case "text":
            default:
                if (column.sortType === 'currency' && value) {
                    return typeof value === 'number' ? 
                        value.toLocaleString('en-US', { 
                            style: 'currency', 
                            currency: 'USD' 
                        }) : value;
                }
                return column.format ? column.format(value) : value ?? "N/A";
        }
    })();

    return (
        <td
            className={`py-3 px-4 text-left text-sm tracking-wide whitespace-nowrap min-w-[120px]
                ${column.fixed === 'left' ? 'sticky left-0 z-10 bg-white' : ''}
                ${column.fixed === 'right' ? 'sticky right-0 z-10 bg-white' : ''}`}
            style={{
                minWidth: column.minWidth,
                maxWidth: column.maxWidth,
                textAlign: column.align || 'left'
            }}
        >
            {content}
        </td>
    );
});

TableCell.displayName = 'TableCell';

const TableRow = memo<{
    row: any;
    headers: Column<any>[];
    onRowClick?: (row: any) => void;
}>(({ row, onRowClick, headers }) => {
    const { theme } = useTheme();

    return (
    <tr
        className={`border-b border-gray-200 ${onRowClick ?`'cursor-pointer ${theme === "light" ? 'hover:bg-gray-50': 'hover:bg-gray-700'}  ` : ''}`}
        onClick={() => onRowClick?.(row)}
    >
        {headers.map((column, index) => (
            <TableCell
                key={index}
                column={column}
                value={row[column.id]}
                row={row}
            />
        ))}
    </tr>
    )}
)

TableRow.displayName = 'TableRow';

const Table = <T extends Data>({
    headers,
    data,
    pagination,
    onPaginate,
    limit,
    onRowClick,
    loading: controlledLoading,
    showPagination = true
}: TableProps<T>) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [sortState, setSortState] = useState<SortState>({
        field: null,
        direction: null
    });

    const compareValues = (aValue: any, bValue: any, header: BaseColumn<T>) => {
        if (aValue === null || aValue === undefined) return 1;
        if (bValue === null || bValue === undefined) return -1;

        switch (header.sortType) {
            case 'currency':
                return sortingUtils.currency(aValue) - sortingUtils.currency(bValue);
                
            case 'number':
                const aNum = typeof aValue === 'number' ? aValue : sortingUtils.extractNumber(String(aValue));
                const bNum = typeof bValue === 'number' ? bValue : sortingUtils.extractNumber(String(bValue));
                return aNum - bNum;

            case 'date':
                return moment(aValue).valueOf() - moment(bValue).valueOf();

            case 'string':
                return String(aValue).toLowerCase().localeCompare(String(bValue).toLowerCase());

            case 'custom':
                const header_typed = header as BaseColumn<T>;
                return header_typed.customSort ? header_typed.customSort(aValue, bValue) : 0;

            default:
                if (typeof aValue === 'number' && typeof bValue === 'number') {
                    return aValue - bValue;
                }
                if (moment(aValue, moment.ISO_8601, true).isValid() && 
                    moment(bValue, moment.ISO_8601, true).isValid()) {
                    return moment(aValue).valueOf() - moment(bValue).valueOf();
                }
                return String(aValue).toLowerCase().localeCompare(String(bValue).toLowerCase());
        }
    };

    const handleSort = useCallback((field: string) => {
        setSortState(prevState => ({
            field,
            direction:
                prevState.field === field
                    ? prevState.direction === 'asc'
                        ? 'desc'
                        : prevState.direction === 'desc'
                            ? null
                            : 'asc'
                    : 'asc',
        }));
    }, []);


    const sortedData = useCallback(() => {
        if (!data || data.length === 0) return [];

        if (!sortState.field || !sortState.direction) {
            return data;
        }

        const currentHeader = headers.find(h => h.id === sortState.field);
        if (!currentHeader) return data;

        return [...data].sort((a, b) => {
            const aValue = a[sortState.field as keyof T];
            const bValue = b[sortState.field as keyof T];

            const comparison = compareValues(aValue, bValue, currentHeader);
            return sortState.direction === 'asc' ? comparison : -comparison;
        });
    }, [data, sortState, headers]);

    useEffect(() => {
        onPaginate && onPaginate(currentPage);
    }, [currentPage, onPaginate]);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    if (controlledLoading) {
        return (
            <div className="flex justify-center py-4">
                {typeof controlledLoading === 'boolean' ? <TableSkeleton /> : controlledLoading}
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="overflow-x-auto p-1 relative">
                <table className="table-auto w-full" role="grid" aria-label="Data table">
                    <TableHeader
                        headers={headers}
                        onSort={handleSort}
                        sortState={sortState}
                    />
                    <tbody>
                    {(() => {
                        const tableData = sortedData();

                        return tableData.length === 0 ? (
                            <tr>
                                <td colSpan={headers.length} className="text-center py-4">
                                    No data available
                                </td>
                            </tr>
                        ) : (
                            tableData.map((row, index) => (
                                <TableRow
                                    key={row.id || index}
                                    row={row}
                                    headers={headers}
                                    onRowClick={onRowClick}
                                />
                            ))
                        );
                    })()}
                    </tbody>

                </table>
            </div>
            {showPagination && pagination && pagination.totalPages > 0 && (
                <Pagination
                    totalPages={pagination.totalPages}
                    currentPage={currentPage}
                    limit={limit}
                    onChange={handlePageChange}
                />
            )}
        </div>
    );
};

export default memo(Table) as typeof Table;