"use client"
import { FormSelect } from '@/components/formInputs/formInputs';
import Table, { Column } from '@/components/table';
import { useUI } from '@/contexts/uiContext';
import React, { useEffect, useState } from 'react';
import Header from './Header';

interface MerchantData {
  id: string;
  name: string;
  value: string;
  isEditing: boolean;
}

const Page = () => {
  const MERCHANT_DATA_COLUMNS: Column<MerchantData>[] = [
    { id: "name", label: "" },
    {
      id: "value",
      label: "",
      type: "custom",
      renderCustom: (row: MerchantData) => (
        row.isEditing ? (
          <div className="flex items-center gap-1">
            <p>₦</p>
            <input
              type="text"
              className="border px-2 py-2.5 rounded"
              value={row.value}
              onChange={(e) => handleChange(e, row.id, 'value', 'collection')}
            />
          </div>
        ) : (
          <span className='flex items-center'><p>₦</p>{row.value}</span>
        )
      )
    },
  ];


  const { setShowHeader, setHeaderTitle } = useUI();
  const [collectionFeeData, setCollectionFeeData] = useState<MerchantData[]>([]);
  const [payoutFeeData, setPayoutFeeData] = useState<MerchantData[]>([]);

  // Track temporary edits to allow cancellation
  const [tempCollectionFeeData, setTempCollectionFeeData] = useState<MerchantData[]>([]);
  const [tempPayoutFeeData, setTempPayoutFeeData] = useState<MerchantData[]>([]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    id: string,
    field: 'value' | 'capValue',
    type: 'collection' | 'payout'
  ) => {
    const updatedValue = e.target.value;
    if (type === 'collection') {
      setTempCollectionFeeData(tempCollectionFeeData.map(data =>
        data.id === id ? { ...data, [field]: updatedValue } : data
      ));
    } else {
      setTempPayoutFeeData(tempPayoutFeeData.map(data =>
        data.id === id ? { ...data, [field]: updatedValue } : data
      ));
    }
  };

  useEffect(() => {
    setShowHeader(false);

    // Generate mock data for Collection Fees
    const initialCollectionFeeData: MerchantData[] = [
      { name: "Transaction Count", id: "1", value: "5", isEditing: false },
      { name: "Minimum Transaction Amount", id: "2", value: "3.5", isEditing: false },
      { name: "Single Transaction Limit ", id: "3", value: "50", isEditing: false },
      { name: "Daily Cumulative Limit", id: "4", value: "2", isEditing: false },
    ];
    setCollectionFeeData(initialCollectionFeeData);
    setTempCollectionFeeData(initialCollectionFeeData);

    // Generate mock data for Payout Fees
    const initialPayoutFeeData = [
      { name: "Transaction Count", id: "1", value: "5", isEditing: false },
      { name: "Minimum Transaction Amount", id: "2", value: "3.5", isEditing: false },
      { name: "Single Transaction Limit ", id: "3", value: "50", isEditing: false },
      { name: "Daily Cumulative Limit", id: "4", value: "2", isEditing: false },
    ];
    setPayoutFeeData(initialPayoutFeeData);
    setTempPayoutFeeData(initialPayoutFeeData);

    return () => setShowHeader(false);
  }, [setHeaderTitle, setShowHeader]);

  const handleEditFee = (type: 'collection' | 'payout') => {
    if (type === 'collection') {
      const updatedCollectionFeeData = collectionFeeData.map(data => ({ ...data, isEditing: true }));
      setCollectionFeeData(updatedCollectionFeeData);
      setTempCollectionFeeData(updatedCollectionFeeData);
    } else {
      const updatedPayoutFeeData = payoutFeeData.map(data => ({ ...data, isEditing: true }));
      setPayoutFeeData(updatedPayoutFeeData);
      setTempPayoutFeeData(updatedPayoutFeeData);
    }
  };

  const handleSaveFee = (type: 'collection' | 'payout') => {
    if (type === 'collection') {
      const updatedCollectionFeeData = collectionFeeData.map(data => ({ ...data, isEditing: false }));
      setCollectionFeeData(updatedCollectionFeeData);
      setTempCollectionFeeData(updatedCollectionFeeData);
    } else {
      const updatedPayoutFeeData = payoutFeeData.map(data => ({ ...data, isEditing: false }));
      setPayoutFeeData(updatedPayoutFeeData);
      setTempPayoutFeeData(updatedPayoutFeeData);
    }
  };


  const handleCancelEditFee = (type: 'collection' | 'payout') => {
    if (type === 'collection') {
      const updatedCollectionFeeData = collectionFeeData.map(data => ({ ...data, isEditing: false }));
      setCollectionFeeData(updatedCollectionFeeData);
      setTempCollectionFeeData(updatedCollectionFeeData);
    } else {
      const updatedCollectionFeeData = collectionFeeData.map(data => ({ ...data, isEditing: false }));
      setPayoutFeeData(updatedCollectionFeeData);
    }
  };


  return (
    <>
      <Header headerTitle={'Limits'} />
      <div className='max-w-2xl w-full h-full min-h-screen'>
        {/* Collection Fees Section */}
        <div className='flex items-center justify-between gap-2 mt-10 mb-5'>
          <p className='font-medium text-xl'>Collection</p>
          <div className='flex items-center gap-2'>
            {collectionFeeData.some(data => data.isEditing) ? (
              // Show Save and Cancel buttons when in edit mode
              <>
                <button
                  onClick={() => handleSaveFee("collection")}
                  className='flex items-center border rounded-md p-2.5 gap-2 text-white bg-[#01AB79]'
                >
                  <p className='text-sm font-medium'>Save Changes</p>
                </button>
                <button
                  onClick={() => handleCancelEditFee("collection")}
                  className='flex items-center border rounded-md p-2.5 gap-2 border-red-500 text-red-500 hover:bg-red-50'
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <p className='text-sm font-medium'>Cancel</p>
                </button>
              </>
            ) : (
              // Show Edit button when not in edit mode
              <>
                <button
                  onClick={() => handleEditFee("collection")}
                  className='flex items-center border rounded-md p-2.5 gap-2 border-[#D0D5DD]'
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M13.6882 3.83757L14.5132 3.01258C15.1967 2.32914 16.3048 2.32914 16.9882 3.01258C17.6716 3.69603 17.6716 4.80411 16.9882 5.48756L16.1632 6.31255M13.6882 3.83757L8.1388 9.387C7.71587 9.81 7.41585 10.3398 7.27079 10.9201L6.66748 13.3333L9.08073 12.73C9.66098 12.585 10.1908 12.2849 10.6138 11.862L16.1632 6.31255M13.6882 3.83757L16.1632 6.31255" stroke="black" strokeWidth="1.25" strokeLinejoin="round" />
                    <path d="M15.8333 11.2501C15.8333 13.9897 15.8333 15.3594 15.0767 16.2814C14.9382 16.4502 14.7834 16.6049 14.6146 16.7434C13.6927 17.5001 12.3228 17.5001 9.58325 17.5001H9.16667C6.02397 17.5001 4.45263 17.5001 3.47632 16.5237C2.50002 15.5475 2.5 13.9761 2.5 10.8334V10.4167C2.5 7.67718 2.5 6.30741 3.25662 5.38545C3.39514 5.21666 3.54992 5.06189 3.7187 4.92336C4.64066 4.16675 6.01043 4.16675 8.75 4.16675" stroke="black" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <p className='text-sm font-medium'>Edit</p>
                </button>
                <FormSelect name={''}
                  defaultValue={"NGN"}
                  placeholder={{
                    label: "NGN",
                    value: "ngn"
                  }}
                  options={[{
                    label: "NGN",
                    value: "ngn"
                  }]}
                />
              </>
            )}
          </div>
        </div>

        <Table<MerchantData>
          headers={MERCHANT_DATA_COLUMNS}
          data={tempCollectionFeeData}
          limit={20}
          showPagination={false} pagination={{
            totalItems: 0,
            limit: 0,
            totalPages: 0
          }} onPaginate={() => null}
        />
        <div className='flex items-center justify-between gap-2 mt-10 mb-5'>
          <p className='font-medium text-xl'>Payout</p>
          <div className='flex items-center gap-2'>
            {payoutFeeData.some(data => data.isEditing) ? (
              // Show Save and Cancel buttons when in edit mode
              <>
                <button
                  onClick={() => handleSaveFee("payout")}
                  className='flex items-center border rounded-md p-2.5 gap-2 text-white bg-[#01AB79]'
                >
                  <p className='text-sm font-medium'>Save Changes</p>
                </button>
                <button
                  onClick={() => handleCancelEditFee("payout")}

                  className='flex items-center border rounded-md p-2.5 gap-2 border-red-500 text-red-500 hover:bg-red-50'
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <p className='text-sm font-medium'>Cancel</p>
                </button>
              </>
            ) : (
              // Show Edit button when not in edit mode
              <>
                <button
                  onClick={() => handleEditFee("payout")}
                  className='flex items-center border rounded-md p-2.5 gap-2 border-[#D0D5DD]'
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M13.6882 3.83757L14.5132 3.01258C15.1967 2.32914 16.3048 2.32914 16.9882 3.01258C17.6716 3.69603 17.6716 4.80411 16.9882 5.48756L16.1632 6.31255M13.6882 3.83757L8.1388 9.387C7.71587 9.81 7.41585 10.3398 7.27079 10.9201L6.66748 13.3333L9.08073 12.73C9.66098 12.585 10.1908 12.2849 10.6138 11.862L16.1632 6.31255M13.6882 3.83757L16.1632 6.31255" stroke="black" strokeWidth="1.25" strokeLinejoin="round" />
                    <path d="M15.8333 11.2501C15.8333 13.9897 15.8333 15.3594 15.0767 16.2814C14.9382 16.4502 14.7834 16.6049 14.6146 16.7434C13.6927 17.5001 12.3228 17.5001 9.58325 17.5001H9.16667C6.02397 17.5001 4.45263 17.5001 3.47632 16.5237C2.50002 15.5475 2.5 13.9761 2.5 10.8334V10.4167C2.5 7.67718 2.5 6.30741 3.25662 5.38545C3.39514 5.21666 3.54992 5.06189 3.7187 4.92336C4.64066 4.16675 6.01043 4.16675 8.75 4.16675" stroke="black" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <p className='text-sm font-medium'>Edit</p>
                </button>
                <FormSelect name={''}
                  defaultValue={"USD"}
                  placeholder={{
                    label: "USD",
                    value: "usd"
                  }}
                  options={[{
                    label: "USD",
                    value: "usd"
                  }]}
                />
              </>
            )}
          </div>
        </div>
        <Table<MerchantData>
          headers={MERCHANT_DATA_COLUMNS}
          data={payoutFeeData}
          limit={20}
          showPagination={false} pagination={{
            totalItems: 0,
            limit: 0,
            totalPages: 0
          }} onPaginate={()=> null}      />
      </div>
    </>
  )
}

export default Page