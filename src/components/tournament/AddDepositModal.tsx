import React from 'react';
import { AddDepositForm } from './AddDepositForm';
import { X, Wallet } from 'lucide-react';

interface AddDepositModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddDepositModal: React.FC<AddDepositModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-[#0c1220] border border-cyan-500/30 w-full max-w-4xl rounded-3xl p-5 sm:p-8 shadow-2xl relative my-auto max-h-[90vh] overflow-y-auto">
        <button
          type="button"
          onClick={onClose}
          id="close-add-deposit-modal-btn"
          className="absolute top-5 right-5 text-zinc-400 hover:text-white p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.1] transition-colors cursor-pointer z-20"
          title="Close Deposit Window"
        >
          <X className="w-5 h-5" />
        </button>

        <AddDepositForm
          isModal={true}
          onSuccess={() => {
            // Optional auto close or keep open for user confirmation
          }}
        />
      </div>
    </div>
  );
};
