import React, { useState } from 'react';
import { X, CheckCircle, ShieldCheck, RefreshCw } from 'lucide-react';
import { ComplaintTicket, ComplaintStatus } from '../types.ts';
import { updateComplaintStatus } from '../lib/api.ts';

interface Props {
  ticket: ComplaintTicket | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdated: (updatedTicket: ComplaintTicket) => void;
}

const DEPARTMENTS = [
  'Hostel Maintenance',
  'Electrical Division',
  'Plumbing Division',
  'Campus IT & Wi-Fi',
  'Sanitation & Hygiene',
  'Campus Security',
  'Academic Facilities',
  'Transport & Logistics',
  'Estate Office',
];

const STATUSES: ComplaintStatus[] = [
  'Submitted',
  'Under Review',
  'Assigned',
  'In Progress',
  'Resolved',
  'Rejected',
];

export const AdminStatusModal: React.FC<Props> = ({ ticket, isOpen, onClose, onUpdated }) => {
  if (!isOpen || !ticket) return null;

  const [status, setStatus] = useState<ComplaintStatus>(ticket.status);
  const [department, setDepartment] = useState(ticket.department);
  const [note, setNote] = useState('');
  const [internalNotes, setInternalNotes] = useState(ticket.internalNotes || '');
  const [resolutionNotes, setResolutionNotes] = useState(ticket.resolutionNotes || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const updated = await updateComplaintStatus(ticket.id, {
        status,
        department,
        note: note.trim() || `Status updated to ${status} by Estate Administrator`,
        internalNotes: internalNotes.trim(),
        resolutionNotes: resolutionNotes.trim(),
        actor: 'Campus Administrator (Estate Office)',
      });

      onUpdated(updated);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update ticket status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-400" />
            <div>
              <h3 className="font-semibold text-sm">Administrator Ticket Update</h3>
              <p className="text-xs text-slate-400">Updating Ticket ID: {ticket.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block font-medium text-slate-700 mb-1">Update Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ComplaintStatus)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 font-medium text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Assigned Department</label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 font-medium text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Public Timeline Update Note (Visible to Student)
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Technician dispatched with replacement parts"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {status === 'Resolved' && (
            <div>
              <label className="block font-medium text-emerald-700 mb-1">
                Resolution Summary & Student Closure Notes
              </label>
              <textarea
                rows={2}
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                placeholder="Explain what repair or work was completed..."
                className="w-full bg-emerald-50/40 border border-emerald-200 rounded-lg p-2.5 text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          )}

          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Internal Administrator Log (Confidential)
            </label>
            <textarea
              rows={2}
              value={internalNotes}
              onChange={(e) => setInternalNotes(e.target.value)}
              placeholder="Internal vendor details, technician names, cost tracking..."
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
              disabled={loading}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold shadow-sm disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Update Ticket</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
