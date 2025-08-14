"use client"
import { ChevronIcon } from '@/assets/icons';
import { Chip } from '@/components/chip';
import Table, { Column } from '@/components/table';
import { ToggleSwitch } from '@/components/utils';
import { useAuth } from '@/contexts/authContext';
import { useUI } from '@/contexts/uiContext';
import { ActiveShopIcon, DisabledShopIcon, NormalShopIcon, PendingShopIcon } from '@/public/assets/icons';
import { useRouter } from 'next/navigation';
import { Route, RouteLiteral } from 'nextjs-routes';
import React, { useEffect, useState } from 'react'
import BusinessTypeHeader from './Header';

interface DataType {
  id: string;
  businessDescription: string;
  status: 'Success' | 'Failed' | 'Pending';
  date: string;
  businessType: string
}

const columns: Column<DataType>[] = [
  { id: "businessType", label: "BUSINESS TYPE" },
  { id: "businessDescription", label: "BUSINESS DESCRIPTION" },
  {
    id: "status", label: "STATUS", type: "custom",
    renderCustom: (value) => (
      <ToggleSwitch enabled={false} onToggle={function (enabled: boolean): void {
        throw new Error('Function not implemented.');
      }} />
    ),
  },
  { id: "date", label: "DATE CREATED", minWidth: 120 },
];

const simulateData = (count: number): DataType[] => {
  const data: DataType[] = [];
  const randomStatus = ["Success", "Failed", "Pending", "Blacklisted"]

  for (let i = 1; i <= count; i++) {
    const newData: DataType = {
      date: new Date().toLocaleDateString(),
      id: `${i}`,
      status: randomStatus[Math.floor(Math.random() * randomStatus.length)] as DataType["status"],
      businessDescription: `Businesses involved in  betting, online gaming, or gambling activities.`,
      businessType: "Betting, Gambling, and Gaming",
    };
    data.push(newData);
  }
  return data;
};
const Page = () => {
  const router = useRouter();
  const [data, setData] = useState<DataType[]>([])

  const { setShowHeader } = useUI();
  useEffect(() => {
    setShowHeader(false)
    const generatedData = simulateData(50);
    setData(generatedData)
    // Optionally clean up on unmount
    return () => {
      setShowHeader(false);
    }; // Reset to default
  }, [setShowHeader]);
  const { setSearchQuery, showSearchQuery, headerTitle, setDateFilter, filterState, setFilterState } = useUI();
  console.log("filterState", filterState)
  useEffect(() => {

  }, [])


  return (
    <>
      <BusinessTypeHeader />
      <Table<DataType>
        headers={columns}
        data={data}
        limit={20}
        onRowClick={(row) => router.push(`/dashboard/operations/business-types/${row.id}` as RouteLiteral)} pagination={{
          totalItems: 0,
          limit: 0,
          totalPages: 0
        }} onPaginate={() => null} />
    </>
  )
}

export default Page