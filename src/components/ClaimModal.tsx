import React, { useState } from 'react';
import { X, Shield, Send, CheckCircle2 } from 'lucide-react';
import { LostFoundItem } from '../types.ts';

interface Props {
  item: LostFoundItem | null;
  isOpen: boolean;
  onClose: () => void;
  currentUser: { name: string; rollNumber: string };
}

export const ClaimModal: React.FC<Props> = ({ item, isOpen, onClose, currentUser }) => {
  const [claimDescription, setClaimDescription] = useState('');
  const [studentContact, setStudentContact] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen || !item) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const handleDone = () => {
    setSubmitted(false);
    setClaimDescription('');
    setStudentContact('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-400" />
            <div>
              <h3 className="font-semibold text-sm">Safe Claim Verification</h3>
              <p className="text-xs text-slate-400">{item.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="p-6 text-center space-y-4">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 text-base">Claim Request Sent!</h4>
              <p className="text-xs text-slate-600 mt-1">
                Your claim request and verification details have been routed securely to Campus Security Desk and the reporting user. Private details are protected.
              </p>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 text-left">
              <p className="font-medium text-slate-900">Next Steps:</p>
              <p className="mt-1">
                Bring your College ID card ({currentUser.rollNumber}) to the <strong>Campus Security Desk (Central Gate)</strong> or verify matching serial/marks for item collection.
              </p>
            </div>
            <button
              onClick={handleDone}
              className="w-full py-2.5 bg-blue-600 text-white font-semibold text-xs rounded-lg hover:bg-blue-700 transition-colors"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-slate-700">
              <p className="font-semibold text-blue-900 mb-0.5">Privacy Protected Claim</p>
              <p className="text-[11px] text-blue-800">
                To prevent false claims, provide verifying details that only the true owner would know (e.g. wallpapers, unique scratch, stickers, or brand receipt).
              </p>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Verifying Details & Description
              </label>
              <textarea
                required
                rows={3}
                value={claimDescription}
                onChange={(e) => setClaimDescription(e.target.value)}
                placeholder="e.g. The laptop bag has a green carabiner on the front zipper and my name tag inside the front sleeve..."
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Your Preferred Verification Contact
              </label>
              <input
                type="text"
                required
                value={studentContact}
                onChange={(e) => setStudentContact(e.target.value)}
                placeholder="Phone number or hostel room (only visible to security officer)"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Claim</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
