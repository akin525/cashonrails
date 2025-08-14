import { ChevronIcon } from '@icons/index'

import { CustomDropdown, DropdownItem } from '@/components/dropDown';
import React, { useState } from 'react'
import Modal from '@/components/modal';
import FormInputs, { FormInputsTextArea, FormSelect } from '@/components/formInputs/formInputs';
import { FileUpload } from '@/components/fileUpload';

const Header = () => {
    const customTrigger = ({ isOpen }: { isOpen: boolean }) => (
        <button className="flex items-center text-white rounded-lg p-2 bg-[#01AB79] gap-2">
            Review Chargeback
            <ChevronIcon className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} stroke='white' />
        </button>
    );
    const [visibleModal, setVisibleModal] = useState<"approve" | "dispute" | null>(null)

    return (
        <div className="flex items-center justify-between h-[96px] px-2 border-b border-[#E4E7EC]">
            <div className="flex items-center space-x-4">
                <a href="#" className="text-[#00000080] text-lg">Settlements</a>
                <span className="text-gray-400 font-medium">/</span>
                <a href="#" className="text-black hover:text-gray-900 font-medium text-lg">Settlement Details</a>
            </div>
            <div className='flex gap-2 items-cente relative'>
                <CustomDropdown
                    trigger={customTrigger}
                    dropdownClassName="bg-gray-50 rounded-lg"
                >
                    <DropdownItem
                        icon={() => <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M13.749 7.49902C13.749 4.04724 10.9508 1.24902 7.49902 1.24902C4.04724 1.24902 1.24902 4.04724 1.24902 7.49902C1.24902 10.9508 4.04724 13.749 7.49902 13.749C10.9508 13.749 13.749 10.9508 13.749 7.49902Z" fill="#01AB79" />
                            <path d="M4.99902 7.81348L6.56152 9.37598L9.99902 5.62598" stroke="white" strokeWidth="0.9375" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                        onClick={() => setVisibleModal('approve')}
                    >
                        <p className='text-xs py-2'>Approve Refund</p>

                    </DropdownItem>
                    <DropdownItem
                        icon={() => <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M13.7498 7.5C13.7498 4.04822 10.9515 1.25 7.49976 1.25C4.04797 1.25 1.24976 4.04822 1.24976 7.5C1.24976 10.9517 4.04797 13.75 7.49976 13.75C10.9515 13.75 13.7498 10.9517 13.7498 7.5Z" fill="#FF5656" />
                            <path d="M9.37463 9.375L5.625 5.625M5.6254 9.375L9.375 5.625" stroke="white" strokeWidth="0.9375" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                        onClick={() => setVisibleModal('dispute')}
                    >
                        <p className='text-xs py-2'>Dispute Chargeback</p>
                    </DropdownItem>
                </CustomDropdown>
            </div>
            <Modal isOpen={visibleModal === "approve"} onClose={function (): void {
                setVisibleModal(null)
            }} >
                <div className='space-y-4'>
                    <div>
                        <p>Approve Refund </p>
                    </div>
                    <FormInputs label={'Transaction ID'} disabled name={'transactionId'} defaultValue={"TRF-653287468"} />
                    <FormSelect name={'Chargeback Amount'} options={[]} />
                    <FormInputsTextArea label={'Notes'} name={''} />
                    <button className='bg-[#01AB79] text-white w-full p-2 rounded-lg'>
                        Proceed
                    </button>
                </div>
            </Modal>
            <Modal isOpen={visibleModal === "dispute"} onClose={function (): void {
                setVisibleModal(null)
            }} >
                <div className='space-y-4'>
                    <div>
                        <p>Dispute Chargeback </p>
                    </div>
                    <FormInputs label={'Transaction ID'} disabled name={'transactionId'} defaultValue={"TRF-653287468"} />
                    <FileUpload initiateUpload={true} type={'evidence'} label='Upload Evidence'  maxFiles={1}/>
                    <FormInputsTextArea label={'Notes'} name={''} />
                    <button className='bg-[#01AB79] text-white w-full p-2 rounded-lg'>
                        Proceed
                    </button>
                </div>
            </Modal>
        </div>
    )
}

export default Header