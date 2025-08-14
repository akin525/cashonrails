// import React, { memo, useCallback, useMemo, useState, useEffect } from 'react';
// import Pagination from "@/components/pagination"
// import Link from 'next/link';
// import 'react-loading-skeleton/dist/skeleton.css'
// import { TableSkeleton } from './loaders';

// interface BaseColumn<T> {
//     id: keyof T;
//     label: string;
//     minWidth?: number;
//     maxWidth?: number;
//     align?: "right" | "left" | "center";
//     format?: (value: any) => string;
// }

// interface TextColumn<T> extends BaseColumn<T> {
//     type?: "text";
// }

// interface LinkColumn<T> extends BaseColumn<T> {
//     type: "link";
// }

// interface CustomColumn<T> extends BaseColumn<T> {
//     type: "custom";
//     renderCustom?: (value: T) => React.ReactNode;
// }

// export type Column<T> = TextColumn<T> | LinkColumn<T> | CustomColumn<T>;

// interface BaseData {
//     id: string;
// }

// interface Data extends BaseData {
//     childData?: Record<string, unknown>;
// }

// type TableProps<T> = {
//     headers: Column<T>[];
//     data: T[];
//     total: number;
//     limit: number;
//     fetchData?: (page: number, limit: number) => Promise<T[]>;
//     onPageChange?: (page: number) => void;
//     onRowClick?: (row: T) => void;
//     loading?: boolean | React.ReactNode;
//     showPagination?: boolean;
// }

// // Memoized table header component
// const TableHeader = memo<{ headers: Column<any>[] }>(({ headers }) => (
//     <thead>
//         <tr className="text-xs uppercase">
//             {headers.map((header, index) => (
//                 <th
//                     key={index}
//                     className="py-2 pr-8 text-left font-normal tracking-wider min-w-[120px]"
//                     style={{
//                         minWidth: header.minWidth,
//                         maxWidth: header.maxWidth,
//                         textAlign: header.align || 'left'
//                     }}
//                 >
//                     {header.label}
//                 </th>
//             ))}
//         </tr>
//     </thead>
// ));

// TableHeader.displayName = 'TableHeader';

// // Memoized table cell component
// const TableCell = memo<{
//     column: Column<any>;
//     value: any;
//     row: any;
// }>(({ column, value, row }) => {
//     const content = (() => {
//         switch (column.type) {
//             case "custom":
//                 return column.renderCustom ? column.renderCustom(row) : null;
//             case "link":
//                 return <Link href={value}>{value}</Link>;
//             case "text":
//             default:
//                 return column.format ? column.format(value) : value;
//         }
//     })();

//     return (
//         <td
//             className="py-4 pr-8 text-left text-sm font-normal tracking-wider whitespace-nowrap min-w-[120px]"
//             style={{
//                 minWidth: column.minWidth,
//                 maxWidth: column.maxWidth,
//                 textAlign: column.align || 'left'
//             }}
//         >
//             {content}
//         </td>
//     );
// });

// TableCell.displayName = 'TableCell';

// // Memoized table row component
// const TableRow = memo<{
//     row: any;
//     headers: Column<any>[];
//     onRowClick?: (row: any) => void;
// }>(({ row, onRowClick, headers }) => (
//     <tr
//         className={`border-b border-[#0000000d] ${onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''}`}
//         onClick={() => onRowClick?.(row)}
//     >
//         {headers.map((column, index) => (
//             <TableCell
//                 key={index}
//                 column={column}
//                 value={row[column.id]}
//                 row={row}
//             />
//         ))}
//     </tr>
// ));

// TableRow.displayName = 'TableRow';

// const Table2 = <T extends Data>({
//     headers,
//     data,
//     total,
//     limit,
//     fetchData,
//     onPageChange,
//     onRowClick,
//     loading = false,
//     showPagination = true
// }: TableProps<T>) => {
//     const [currentPage, setCurrentPage] = useState(1);
//     const [isLoading, setIsLoading] = useState(false);

//     // Memoize page change handler
//     const handlePageChange = useCallback(async (page: number) => {
//         setCurrentPage(page);
        
//         // If fetchData is provided, trigger data fetch
//         if (fetchData) {
//             try {
//                 setIsLoading(true);
//                 await fetchData(page, limit);
//             } catch (error) {
//                 console.error('Error fetching data:', error);
//             } finally {
//                 setIsLoading(false);
//             }
//         }

//         // Call optional page change callback
//         onPageChange?.(page);
//     }, [fetchData, limit, onPageChange]);

//     // Render loading state
//     if (loading || isLoading) {
//         return (
//             <div className="flex justify-center py-4">
//                 {typeof loading === 'boolean' ? <TableSkeleton /> : loading}
//             </div>
//         );
//     }

//     return (
//         <div className="flex flex-col gap-4">
//             <div className="overflow-x-auto p-1">
//                 <table
//                     id="responsive-table"
//                     className="table-auto w-full"
//                     role="grid"
//                     aria-label="Data table"
//                 >
//                     <TableHeader headers={headers} />
//                     <tbody>
//                         {data.length === 0 ? (
//                             <tr>
//                                 <td colSpan={headers.length} className="text-center py-4">
//                                     No data available
//                                 </td>
//                             </tr>
//                         ) : (
//                             data.map((row, index) => (
//                                 <TableRow
//                                     key={index}
//                                     row={row}
//                                     headers={headers}
//                                     onRowClick={onRowClick}
//                                 />
//                             ))
//                         )}
//                     </tbody>
//                 </table>
//             </div>
//             {showPagination && (
//                 <Pagination
//                     total={total}
//                     current={currentPage}
//                     limit={limit}
//                     onChange={handlePageChange}
//                 />
//             )}
//         </div>
//     );
// };

// export default memo(Table2) as typeof Table2;