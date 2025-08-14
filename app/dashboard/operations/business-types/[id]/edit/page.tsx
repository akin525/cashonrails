import React from 'react'
import Header from './Header'
import FormInputs, { FormInputsTextArea } from '@/components/formInputs/formInputs'
import { PlusIcon } from '@/assets/icons'

const Page = () => {
    return (
        <div>
            <Header />
            <div className='py-8 px-2 max-w-2xl'>
                <div className='space-y-2'>
                    <h1 className='font-medium'>General Information</h1>
                    <p className='text-[#00000099]'>Provide basic details about the business type, including name and description.</p>
                </div>
                <div className='space-y-4 mt-10'>
                    <FormInputs label={'Business Type Name *'} name={'businessTypeName'} />
                    <FormInputsTextArea label={'Description *'} name={''} />
                    <p className='text-lg font-medium'>Document Required</p>
                    <p className='text-[#00000099]'>Specify which documents merchants in this category must submit for compliance</p>
                    <FormInputs label={'Document Name *'} name={''} />
                </div>
                <button className='flex items-center gap-2 mt-4'>
                    <span className='bg-[#01AB79] rounded-md p-1'>
                        <PlusIcon stroke='white' />
                    </span>
                    <p>Add Document</p>
                </button>
            </div>
        </div>
    )
}

export default Page