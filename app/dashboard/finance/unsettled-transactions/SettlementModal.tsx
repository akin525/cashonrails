import React, { useState } from 'react';
import Modal from "@/components/modal";
import { Chip } from "@/components/chip";
import { StringUtils } from "@/helpers/extras";
import moment from 'moment';

interface SettlementModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: {
    id: string;
    currency: string;
    amount: string;
    fee: string;
    stamp_duty: string;
    sys_fee: string;
    channel: string;
    status: string;
    created_at: string;
    settled_at: string | null;
  };
  onConfirm: () => void;
}

const SettlementModal: React.FC<SettlementModalProps> = ({
  isOpen, 
  onClose, 
  transaction,
  onConfirm 
}) => {
  const [isSettling, setIsSettling] = useState(false);

  if (!transaction) return null;


  const totalFees = (
    Number(transaction.fee) + 
    Number(transaction.stamp_duty) + 
    Number(transaction.sys_fee)
  ).toLocaleString();

  const handleConfirm = async () => {
    try {
      setIsSettling(true);
      await onConfirm();
    } finally {
      setIsSettling(false);
    }
  };
  return (
    <Modal 
      isOpen={isOpen} 
      title="Confirm Settlement"
      onClose={onClose}
    >
      <div className="rounded-lg">
        <div className="space-y-4 p-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-sm text-gray-500">Transaction ID</div>
            <div className="text-right font-medium">{transaction.id}</div>
            
            <div className="text-sm text-gray-500">Amount</div>
            <div className="text-right font-medium text-lg">
              {transaction.currency} {Number(transaction.amount).toLocaleString()}
            </div>
            
            <div className="text-sm text-gray-500">Status</div>
            <div className="text-right">
              <Chip variant={transaction.status}>
                {StringUtils.capitalizeWords(transaction.status)}
              </Chip>
            </div>
            
            <div className="text-sm text-gray-500">Channel</div>
            <div className="text-right font-medium">{StringUtils.capitalizeWords(transaction.channel)}</div>
            
            <div className="text-sm text-gray-500">Created Date</div>
            <div className="text-right font-medium">
              {moment(transaction.created_at).format('MMMM Do YYYY, h:mm:ss A')}
            </div>
            
            <div className="text-sm text-gray-500">Settled Date</div>
            <div className="text-right font-medium">
              {moment(transaction.settled_at).isValid() ? moment(transaction.settled_at).format('MMMM Do YYYY, h:mm:ss A') : 'N/A'}
            </div>
            <div className="text-sm text-gray-500">Total Fees</div>
            <div className="text-right font-medium">
              {transaction.currency} {totalFees}
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6 border-t pt-4">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 px-4 py-2 bg-[#01AB79] text-white rounded-md hover:bg-[#028A58] transition-colors duration-300 ease-in-out"
          >
            {isSettling ? 'Settling...' : 'Confirm Settlement'}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default SettlementModal;