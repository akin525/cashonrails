import React from 'react';

interface TableLoaderProps {
  rows?: number; // Number of rows in the table
  columns?: number; // Number of columns in the table
}

export const TableSkeleton: React.FC<TableLoaderProps> = ({ rows = 5, columns = 8 }) => {
  // Function to generate the rows of the table dynamically based on the given number of rows and columns
  const renderTableRows = () => {
    return Array(rows)
      .fill(null)
      .map((_, rowIndex) => (
        <tr key={rowIndex}>
          {Array(columns)
            .fill(null)
            .map((_, colIndex) => (
              <td key={colIndex} className="p-2 text-gray-800">
                <div className="line"></div>
              </td>
            ))}
        </tr>
      ));
  };

  return (
    <div className="w-full h-screen flex justify-center items-start">
      <table className="border-collapse w-full">
        <thead>
          <tr>
            {Array(columns)
              .fill(null)
              .map((_, index) => (
                <th key={index} className="p-2 text-gray-800 bg-gray-100">
                  <div className="line"></div>
                </th>
              ))}
          </tr>
        </thead>
        <tbody>{renderTableRows()}</tbody>
      </table>
    </div>
  );
};


export const TableDetailSkeleton: React.FC = () => (
  <div className="p-6">
    <div className="space-y-1">
      {/* Skeleton for Title */}
      <div className="h-6 w-40 bg-gray-300 animate-pulse rounded"></div>
      {/* Skeleton for Paragraph */}
      <div className="h-4 w-60 bg-gray-200 animate-pulse rounded"></div>
    </div>

    <div className="flex items-start mt-10 gap-20">
      <div className="grid grid-cols-2 max-w-[400px] w-full">
        {/* Skeleton for Left List */}
        <ul className="text-sm text-[#00000080] font-medium space-y-2">
          {Array(4)
            .fill(null)
            .map((_, index) => (
              <li key={index} className="h-4 bg-gray-200 animate-pulse rounded w-40"></li>
            ))}
        </ul>
        {/* Skeleton for Right List */}
        <ul className="text-sm space-y-2">
          {Array(4)
            .fill(null)
            .map((_, index) => (
              <li key={index} className="h-4 bg-gray-200 animate-pulse rounded w-32"></li>
            ))}
        </ul>
      </div>
    </div>
  </div>
);

export const MetricCardSkeleton: React.FC = () => (
  <div className="rounded-lg border-bar flex flex-col justify-between h-full cursor-pointer bg-[#F9FCFB]">
    <div className="border-[#E4E7EC] border rounded-xl p-3 flex flex-col justify-between space-y-4">
      {/* Title Skeleton */}
      <div className="w-1/3 h-4 bg-gray-200 rounded-md animate-pulse"></div>

      <div>
        {/* Count Skeleton */}
        <div className="w-2/3 h-6 bg-gray-200 rounded-md animate-pulse"></div>

        {/* Trend Skeleton */}
        <div className="flex items-center gap-2 mt-2">
          <div className="w-4 h-4 bg-gray-200 rounded-full animate-pulse"></div>
          <div className="w-1/4 h-3 bg-gray-200 rounded-md animate-pulse"></div>
        </div>
      </div>
    </div>
  </div>
);

export const CardSkeleton: React.FC = () => (
  <div className="p-4 bg-white rounded-lg shadow-sm animate-pulse space-y-4">
    {/* Skeleton for Image */}
    <div className="h-40 bg-gray-300 rounded"></div>
    {/* Skeleton for Title */}
    <div className="h-6 w-48 bg-gray-300 rounded"></div>
    {/* Skeleton for Paragraph */}
    <div className="h-4 w-32 bg-gray-200 rounded"></div>
    <div className="h-4 w-40 bg-gray-200 rounded"></div>
  </div>
);

export const FormSkeleton: React.FC = () => (
  <div className="space-y-6 p-6 bg-white rounded-lg shadow-md animate-pulse">
    {Array(3)
      .fill(null)
      .map((_, index) => (
        <div key={index} className="space-y-2">
          {/* Skeleton for Label */}
          <div className="h-4 w-32 bg-gray-200 rounded"></div>
          {/* Skeleton for Input */}
          <div className="h-10 bg-gray-300 rounded"></div>
        </div>
      ))}
    {/* Skeleton for Submit Button */}
    <div className="h-10 w-full bg-gray-400 rounded"></div>
  </div>
);

export const ChartSkeleton: React.FC = () => (
  <div className="p-4 bg-white rounded-lg shadow-md animate-pulse space-y-4">
    {/* Skeleton for Title */}
    <div className="h-6 w-48 bg-gray-300 rounded"></div>
    {/* Skeleton for Chart Area */}
    <div className="h-64 bg-gray-200 rounded"></div>
  </div>
);

export const ListSkeleton: React.FC = () => (
  <div className="space-y-4 animate-pulse">
    {Array(5)
      .fill(null)
      .map((_, index) => (
        <div key={index} className="flex items-center gap-4">
          <div className="h-10 w-10 bg-gray-300 rounded-full"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-300 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      ))}
  </div>
);
