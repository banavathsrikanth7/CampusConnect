import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  AlertTriangle,
  Key,
  HardDrive,
  Cpu,
  RefreshCw,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';
import { ConfigStatus } from '../types.ts';
import { resetDemoData } from '../lib/api.ts';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  config: ConfigStatus | null;
  onDataReset: () => void;
}

export const ApiStatusModal: React.FC<Props> = ({ isOpen, onClose, config, onDataReset }) => {
  const [resetting, setResetting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  if (!isOpen) return null;

  const handleReset = async () => {
    try {
      setResetting(true);
      await resetDemoData();
      setResetSuccess(true);
      onDataReset();
      setTimeout(() => setResetSuccess(false), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Cpu className="w-5 h-5 text-blue-400" />
            <h2 className="font-semibold text-base">CampusConnect AI Architecture & Integration</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto text-sm">
          {/* Sarvam AI Status */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-semibold text-slate-800">
                <Key className="w-4 h-4 text-blue-600" />
                <span>Sarvam AI Service</span>
              </div>
              {config?.hasSarvamKey ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Connected (Live APIs)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Awaiting SARVAM_API_KEY
                </span>
              )}
            </div>
            <p className="text-xs text-slate-600">
              Primary provider for multilingual speech-to-text (<strong>saaras:v2</strong>) and structured complaint categorization (<strong>sarvam-2b</strong>).
            </p>
            {!config?.hasSarvamKey && (
              <div className="mt-2 text-xs bg-white p-3 rounded-lg border border-slate-200 space-y-1.5 text-slate-700">
                <p className="font-medium text-slate-900">How to configure live Sarvam AI:</p>
                <ol className="list-decimal pl-4 space-y-1 text-slate-600">
                  <li>Get an API key from <a href="https://dashboard.sarvam.ai" target="_blank" rel="noreferrer" className="text-blue-600 underline inline-flex items-center gap-0.5">dashboard.sarvam.ai <ExternalLink className="w-3 h-3" /></a></li>
                  <li>Set environment variable <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-900 font-mono">SARVAM_API_KEY=your_key</code> in AI Studio Secrets or <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">.env</code></li>
                  <li>Restart server. The system automatically switches to live Sarvam speech and LLM processing!</li>
                </ol>
                <p className="text-[11px] text-amber-700 pt-1">
                  * Currently running in <strong>Intelligent Rule Engine Mode</strong> with pre-configured heuristics so you can fully test voice recordings, form reviews, and ticket tracking without billing.
                </p>
              </div>
            )}
          </div>

          {/* Database Persistence */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-semibold text-slate-800">
                <HardDrive className="w-4 h-4 text-indigo-600" />
                <span>Database & Persistence</span>
              </div>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-300">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Local File System Storage
              </span>
            </div>
            <p className="text-xs text-slate-600">
              Data is stored persistently on the server filesystem in <code className="bg-white px-1 py-0.5 rounded font-mono border border-slate-200 text-slate-800">data/complaints.json</code> and <code className="bg-white px-1 py-0.5 rounded font-mono border border-slate-200 text-slate-800">data/lost_found.json</code>. Ticket updates and new reports survive server reloads.
            </p>
            <p className="text-[11px] text-slate-500">
              For production cloud deployments, Firebase Firestore can be provisioned by enabling Google Cloud Firestore rules and SDK credentials.
            </p>
          </div>

          {/* Authentication & Security Notice */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
            <div className="flex items-center gap-2 font-semibold text-slate-800">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              <span>Authentication & Access Control</span>
            </div>
            <p className="text-xs text-slate-600">
              Currently operating in <strong>Role-Based Demo Mode</strong>. You can switch between student personas (Arjun Patel, Priya Sharma) and Campus Administrator (Estate Office / Warden) using the user switcher in the navigation bar to test access restrictions.
            </p>
          </div>

          {/* Seed Data Reset Action */}
          <div className="pt-2 flex items-center justify-between">
            <span className="text-xs text-slate-500">Hackathon demo helper:</span>
            <button
              onClick={handleReset}
              disabled={resetting}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-300 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${resetting ? 'animate-spin' : ''}`} />
              <span>{resetSuccess ? 'Reset Complete!' : 'Reset Seed Complaints'}</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-100 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
