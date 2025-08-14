import React from 'react';
interface InfoItemProps {
    file: {
        name: string;
        url: string
    }
}
const DocumentNode: React.FC<InfoItemProps> = ({ file }) => (
    <div>
        <div className="font-medium bg-[#F9FCFB] p-2 border border-[#DBE0EA] rounded-lg flex items-center">
            <span>
                <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="2" y="2" width="32" height="32" rx="16" fill="#F1FDF6" />
                    <rect x="2" y="2" width="32" height="32" rx="16" stroke="#F1FDF6" strokeWidth="4" />
                    <path d="M24.3757 16.875V16.5C24.3757 13.6716 24.3757 12.2574 23.497 11.3787C22.6183 10.5 21.2041 10.5 18.3757 10.5H17.6257C14.7974 10.5 13.3832 10.5 12.5045 11.3787C11.6258 12.2573 11.6258 13.6715 11.6258 16.4999L11.6257 19.875C11.6257 22.3405 11.6257 23.5734 12.3066 24.4031C12.4313 24.5551 12.5706 24.6943 12.7225 24.8191C13.5523 25.5 14.7851 25.5 17.2507 25.5" stroke="#01AB79" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M14.625 14.25H21.375" stroke="#01AB79" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M14.625 18H19.125" stroke="#01AB79" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M24.3735 24V21.75C24.3735 20.6779 23.3662 19.5 22.1235 19.5C20.8809 19.5 19.8735 20.6779 19.8735 21.75V24.375C19.8735 24.9963 20.3772 25.5 20.9985 25.5C21.6198 25.5 22.1235 24.9963 22.1235 24.375V21.75" stroke="#01AB79" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </span>
            {file.name}</div>
    </div>
);

interface SectionProps {
    title: string;
    children: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({ children, title }) => (
    <div className="py-6 bg-white">
        <h3 className="text-lg font-medium mb-4">{title}</h3>
        <div className="space-y-6">{children}</div>
    </div>
);
const Page = () => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10 border-y pb-4 border-[#E4E7EC] pt-5">
            <div className="border-r border-[#E4E7EC] pr-5">
                <h2 className="text-lg font-medium mb-6">Chargeback Summary</h2>

                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-[#00000066] text-sm">Reason Code</p>
                            <p className="font-medium">Product not delivered</p>
                        </div>
                        <div>
                            <p className="text-[#00000066] text-sm">Payment Method</p>
                            <p className="font-medium">Card</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-[#00000066] text-sm">Transaction ID</p>
                            <p className="font-medium">TRF262528902</p>
                            <button className='text-[#01AB79] flex items-center gap-1'>
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M9.24897 2.5C6.20816 2.50548 4.61582 2.58014 3.59819 3.59793C2.5 4.6963 2.5 6.4641 2.5 9.99965C2.5 13.5352 2.5 15.3031 3.59819 16.4014C4.69638 17.4998 6.46389 17.4998 9.99897 17.4998C13.5339 17.4998 15.3015 17.4998 16.3996 16.4014C17.4172 15.3837 17.4919 13.791 17.4974 10.7497" stroke="#01AB79" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M17.1298 2.91219L9.20703 10.8809M17.1298 2.91219C16.7181 2.50002 13.945 2.53843 13.3588 2.54678M17.1298 2.91219C17.5414 3.32438 17.503 6.10103 17.4947 6.68804" stroke="#01AB79" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                View Transaction
                            </button>
                        </div>
                        <div>
                            <p className="text-[#00000066] text-sm">Refund Requested</p>
                            <p className="font-medium">₦25,000.23</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1">
                        <div>
                            <p className="text-[#00000066] text-sm">Customer Notes</p>
                            <p className="font-medium">I never received the product I ordered.</p>
                        </div>
                    </div>
                </div>
                {/*  Doc section */}
                <br />
                <hr />
                <Section title="Documents Uploaded">
                    <DocumentNode file={{ name: "Certificate_of_incorporation.pdf", url: "" }} />
                    <DocumentNode file={{ name: "Certificate_of_incorporation.pdf", url: "" }} />
                    <DocumentNode file={{ name: "Certificate_of_incorporation.pdf", url: "" }} />
                    <DocumentNode file={{ name: "Certificate_of_incorporation.pdf", url: "" }} />
                    <DocumentNode file={{ name: "Certificate_of_incorporation.pdf", url: "" }} />
                </Section>
            </div>
            <div className="">
                <h2 className="text-lg font-medium">Customer Information</h2>
                <div className="space-y-4 pb-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-[#00000066] text-sm">First Name</p>
                            <p className="font-medium">Jayden</p>
                        </div>
                        <div>
                            <p className="text-[#00000066] text-sm">Last Name</p>
                            <p className="font-medium">Bamidele</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-[#00000066] text-sm">Email Address</p>
                            <p className="font-medium">jaydenbamidele@gmail.com</p>
                        </div>
                        <div>
                            <p className="text-[#00000066] text-sm">Refund Requested</p>
                            <p className="font-medium">₦25,000.23</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-4 border-t border-[#E4E7EC] py-6">
                    <h2 className="text-lg font-medium mb-6">Merchant Information</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-[#00000066] text-sm">Merchant Name</p>
                            <p className="font-medium">Solomon Adeleke</p>
                        </div>
                        <div>
                            <p className="text-[#00000066] text-sm">Merchant ID</p>
                            <p className="font-medium">#428390</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Page;