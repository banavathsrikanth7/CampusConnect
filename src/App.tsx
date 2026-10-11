/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  PlusCircle,
  ListFilter,
  PackageSearch,
  Bell,
  ShieldCheck,
  Settings,
  Mic,
  FileText,
  Sparkles,
  ArrowRight,
  Search,
  CheckCircle2,
  Clock,
  ChevronRight,
  User,
  LogOut,
  Menu,
  X,
  Volume2,
  AlertCircle,
  ExternalLink,
  MapPin,
  Building,
  Calendar,
  Send,
  Zap,
  TrendingUp,
} from 'lucide-react';

import {
  ComplaintTicket,
  ComplaintAnalysisResult,
  LostFoundItem,
  LostFoundMatch,
  CampusAnnouncement,
  DashboardStats,
  ConfigStatus,
  UserProfile,
  ComplaintCategory,
  ComplaintPriority,
} from './types.ts';

import {
  fetchConfigStatus,
  fetchDashboardStats,
  fetchComplaints,
  fetchComplaintById,
  analyzeComplaint,
  createComplaint,
  addComplaintRemark,
  fetchLostFound,
  createLostFound,
  fetchLostFoundMatches,
  fetchAnnouncements,
} from './lib/api.ts';

import { StatusBadge } from './components/StatusBadge.tsx';
import { PriorityBadge, CategoryBadge } from './components/PriorityBadge.tsx';
import { VoiceRecorder } from './components/VoiceRecorder.tsx';
import { TicketTimeline } from './components/TicketTimeline.tsx';
import { CategoryChart } from './components/CategoryChart.tsx';
import { ApiStatusModal } from './components/ApiStatusModal.tsx';
import { AdminStatusModal } from './components/AdminStatusModal.tsx';
import { ClaimModal } from './components/ClaimModal.tsx';

// Preset mock profiles to test multi-user roles
const MOCK_PROFILES: UserProfile[] = [
  {
    id: 'student-1',
    name: 'Arjun Patel',
    rollNumber: '22CS084',
    email: 'arjun.p@campus.edu',
    role: 'student',
    hostelRoom: 'Hostel 3, Room 218',
    phone: '+91 98765 43210',
  },
  {
    id: 'student-2',
    name: 'Priya Sharma',
    rollNumber: '23EE019',
    email: 'priya.s@campus.edu',
    role: 'student',
    hostelRoom: 'Girls Hostel B, Room 104',
    phone: '+91 98123 45678',
  },
  {
    id: 'student-3',
    name: 'Kavya Reddy',
    rollNumber: '21ME045',
    email: 'kavya.r@campus.edu',
    role: 'student',
    hostelRoom: 'Girls Hostel A, Room 310',
    phone: '+91 97654 32109',
  },
  {
    id: 'admin-1',
    name: 'Dr. S. Ramanujan',
    rollNumber: 'FAC-802',
    email: 'estate.admin@campus.edu',
    role: 'admin',
    hostelRoom: 'Estate Office, Central Admin Block',
    phone: '+91 94440 11223',
  },
];

type ActiveTab =
  | 'landing'
  | 'dashboard'
  | 'report'
  | 'complaints'
  | 'ticket-details'
  | 'lost-found'
  | 'announcements'
  | 'admin'
  | 'settings';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile>(MOCK_PROFILES[0]);
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // System & API config
  const [config, setConfig] = useState<ConfigStatus | null>(null);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);

  // Dashboard state
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);

  // Complaints state
  const [complaints, setComplaints] = useState<ComplaintTicket[]>([]);
  const [loadingComplaints, setLoadingComplaints] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<ComplaintTicket | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Report Problem State
  const [reportMode, setReportMode] = useState<'text' | 'voice'>('text');
  const [selectedLanguage, setSelectedLanguage] = useState('en-IN');
  const [rawText, setRawText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<ComplaintAnalysisResult | null>(null);
  const [submittingTicket, setSubmittingTicket] = useState(false);
  const [createdTicketId, setCreatedTicketId] = useState<string | null>(null);
  const [analysisNotice, setAnalysisNotice] = useState<string | null>(null);

  // Editable Review Form state
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewSummary, setReviewSummary] = useState('');
  const [reviewCategory, setReviewCategory] = useState<ComplaintCategory>('Other');
  const [reviewPriority, setReviewPriority] = useState<ComplaintPriority>('Medium');
  const [reviewDepartment, setReviewDepartment] = useState('Hostel Maintenance');
  const [reviewLocation, setReviewLocation] = useState('Campus Premises');
  const [reviewSuggestedAction, setReviewSuggestedAction] = useState('');

  // Lost & Found state
  const [lostFoundItems, setLostFoundItems] = useState<LostFoundItem[]>([]);
  const [lostFoundMatches, setLostFoundMatches] = useState<LostFoundMatch[]>([]);
  const [lostFoundTab, setLostFoundTab] = useState<'all' | 'lost' | 'found' | 'matches'>('all');
  const [isPostLostModalOpen, setIsPostLostModalOpen] = useState(false);
  const [claimTargetItem, setClaimTargetItem] = useState<LostFoundItem | null>(null);
  const [newLfType, setNewLfType] = useState<'lost' | 'found'>('lost');
  const [newLfTitle, setNewLfTitle] = useState('');
  const [newLfCategory, setNewLfCategory] = useState('Accessories');
  const [newLfDescription, setNewLfDescription] = useState('');
  const [newLfLocation, setNewLfLocation] = useState('');
  const [newLfDate, setNewLfDate] = useState(new Date().toISOString().slice(0, 10));
  const [newLfContact, setNewLfContact] = useState('Security Desk / Portal');

  // Announcements state
  const [announcements, setAnnouncements] = useState<CampusAnnouncement[]>([]);

  // Admin modal state
  const [adminTargetTicket, setAdminTargetTicket] = useState<ComplaintTicket | null>(null);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

  // Student remarks state
  const [newRemarkText, setNewRemarkText] = useState('');
  const [submittingRemark, setSubmittingRemark] = useState(false);

  // Load initial system data
  useEffect(() => {
    loadConfig();
    loadDashboard();
    loadAnnouncementsData();
  }, []);

  // When user or tab changes, refresh data
  useEffect(() => {
    if (activeTab === 'dashboard') loadDashboard();
    if (activeTab === 'complaints') loadComplaintsList();
    if (activeTab === 'admin') loadComplaintsList();
    if (activeTab === 'lost-found') loadLostFoundData();
  }, [activeTab, currentUser]);

  useEffect(() => {
    if (selectedTicketId) {
      loadSingleTicket(selectedTicketId);
    }
  }, [selectedTicketId]);

  const loadConfig = async () => {
    try {
      const data = await fetchConfigStatus();
      setConfig(data);
    } catch (e) {
      console.error(e);
    }
  };

  const loadDashboard = async () => {
    setLoadingStats(true);
    try {
      const data = await fetchDashboardStats();
      setStats(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingStats(false);
    }
  };

  const loadComplaintsList = async () => {
    setLoadingComplaints(true);
    try {
      const isStudent = currentUser.role === 'student' && activeTab !== 'admin';
      const data = await fetchComplaints({
        userId: isStudent ? currentUser.id : undefined,
        role: isStudent ? 'student' : 'admin',
        status: statusFilter !== 'all' ? statusFilter : undefined,
      });
      setComplaints(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingComplaints(false);
    }
  };

  const loadSingleTicket = async (id: string) => {
    try {
      const data = await fetchComplaintById(id);
      setSelectedTicket(data);
    } catch (e) {
      console.error(e);
    }
  };

  const loadLostFoundData = async () => {
    try {
      const [items, matches] = await Promise.all([
        fetchLostFound(),
        fetchLostFoundMatches(),
      ]);
      setLostFoundItems(items);
      setLostFoundMatches(matches);
    } catch (e) {
      console.error(e);
    }
  };

  const loadAnnouncementsData = async () => {
    try {
      const list = await fetchAnnouncements();
      setAnnouncements(list);
    } catch (e) {
      console.error(e);
    }
  };

  // Complaint reporting workflow
  const handleAnalyzeText = async (textToAnalyze?: string) => {
    const text = textToAnalyze || rawText;
    if (!text || text.trim().length === 0) return;

    setIsAnalyzing(true);
    setAnalysisNotice(null);
    try {
      const result = await analyzeComplaint(text.trim(), selectedLanguage);
      setAnalysisResult(result);
      setReviewTitle(result.title);
      setReviewSummary(result.summary);
      setReviewCategory(result.category);
      setReviewPriority(result.priority);
      setReviewDepartment(result.department);
      setReviewLocation(result.location);
      setReviewSuggestedAction(result.suggestedAction);

      if (result.isDemoSimulation) {
        setAnalysisNotice(
          `Analysis processed via ${result.provider || 'Rule-Based Engine'}. Set SARVAM_API_KEY in environment for live Sarvam AI model output.`
        );
      } else {
        setAnalysisNotice(`Analyzed using live ${result.provider || 'Sarvam AI'}.`);
      }
    } catch (err: any) {
      console.error('Analysis failed:', err);
      setAnalysisNotice('Could not reach analysis engine. You can still fill out the form manually.');
      // Populate defaults
      setReviewTitle('Campus Maintenance Report');
      setReviewSummary(text.trim());
      setReviewCategory('Other');
      setReviewPriority('Medium');
      setReviewDepartment('Estate Office');
      setReviewLocation('Campus Premises');
      setReviewSuggestedAction('Review and assign technician');
      setAnalysisResult({
        title: 'Campus Maintenance Report',
        summary: text.trim(),
        category: 'Other',
        priority: 'Medium',
        department: 'Estate Office',
        location: 'Campus Premises',
        suggestedAction: 'Review and assign technician',
        isDemoSimulation: true,
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleTranscriptionComplete = (
    transcript: string,
    detectedLang?: string,
    isSimulation?: boolean,
    provider?: string
  ) => {
    setRawText(transcript);
    if (detectedLang) setSelectedLanguage(detectedLang);
    handleAnalyzeText(transcript);
  };

  const handleSubmitFinalTicket = async () => {
    if (!reviewTitle.trim() || !rawText.trim()) return;

    setSubmittingTicket(true);
    try {
      const newTicket = await createComplaint({
        title: reviewTitle.trim(),
        rawDescription: rawText.trim(),
        summary: reviewSummary.trim(),
        category: reviewCategory,
        priority: reviewPriority,
        department: reviewDepartment.trim(),
        location: reviewLocation.trim(),
        suggestedAction: reviewSuggestedAction.trim(),
        language: selectedLanguage,
        userId: currentUser.id,
        userName: currentUser.name,
        userRoll: currentUser.rollNumber,
        userContact: currentUser.phone,
        userHostelRoom: currentUser.hostelRoom,
        audioAttached: reportMode === 'voice',
        isDemoSimulation: analysisResult?.isDemoSimulation || false,
      });

      setCreatedTicketId(newTicket.id);
      loadDashboard();
    } catch (err: any) {
      alert(err.message || 'Failed to submit complaint');
    } finally {
      setSubmittingTicket(false);
    }
  };

  const handleResetReportForm = () => {
    setRawText('');
    setAnalysisResult(null);
    setCreatedTicketId(null);
    setAnalysisNotice(null);
    setReviewTitle('');
    setReviewSummary('');
    setReviewSuggestedAction('');
  };

  const handlePostLostFound = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLfTitle.trim() || !newLfDescription.trim() || !newLfLocation.trim()) return;

    try {
      await createLostFound({
        type: newLfType,
        title: newLfTitle.trim(),
        category: newLfCategory,
        description: newLfDescription.trim(),
        location: newLfLocation.trim(),
        date: newLfDate,
        userId: currentUser.id,
        userName: currentUser.name,
        contactMethod: newLfContact.trim(),
      });

      setIsPostLostModalOpen(false);
      setNewLfTitle('');
      setNewLfDescription('');
      setNewLfLocation('');
      loadLostFoundData();
    } catch (err: any) {
      alert(err.message || 'Failed to post item');
    }
  };

  const handleAddRemark = async () => {
    if (!newRemarkText.trim() || !selectedTicket) return;

    setSubmittingRemark(true);
    try {
      const updated = await addComplaintRemark(
        selectedTicket.id,
        newRemarkText.trim(),
        `${currentUser.name} (${currentUser.role === 'admin' ? 'Admin' : currentUser.rollNumber})`
      );
      setSelectedTicket(updated);
      setNewRemarkText('');
      loadComplaintsList();
    } catch (e) {
      console.error(e);
    } finally {
      setSubmittingRemark(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-slate-900 text-white border-b border-slate-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Tagline */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('landing')}
              className="flex items-center gap-2.5 text-left group"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md group-hover:bg-blue-500 transition-colors">
                <Mic className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-base sm:text-lg tracking-tight text-white block leading-tight">
                  CampusConnect <span className="text-blue-400">AI</span>
                </span>
                <span className="text-[11px] text-slate-400 hidden sm:block">
                  Your voice. Your campus. Your solution.
                </span>
              </div>
            </button>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2.5 sm:gap-4">
            {/* Sarvam AI Status Pill */}
            <button
              onClick={() => setIsConfigModalOpen(true)}
              className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                config?.hasSarvamKey
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/80 hover:bg-emerald-900'
                  : 'bg-amber-950/80 text-amber-300 border-amber-700/80 hover:bg-amber-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{config?.hasSarvamKey ? 'Sarvam AI Active' : 'Sarvam: Demo Fallback'}</span>
              <span className="w-2 h-2 rounded-full bg-current animate-pulse ml-0.5" />
            </button>

            {/* Quick Report CTA */}
            <button
              onClick={() => {
                setActiveTab('report');
                handleResetReportForm();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition-all hover:scale-102"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden xs:inline">Report Problem</span>
            </button>

            {/* User Profile Selector (Demo Role Switcher) */}
            <div className="relative group">
              <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs cursor-pointer hover:bg-slate-750">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    currentUser.role === 'admin'
                      ? 'bg-rose-600 text-white'
                      : 'bg-blue-600 text-white'
                  }`}
                >
                  {currentUser.name.charAt(0)}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="font-semibold text-slate-200 leading-tight truncate max-w-[120px]">
                    {currentUser.name}
                  </p>
                  <p className="text-[10px] text-slate-400 capitalize">
                    {currentUser.role === 'admin' ? 'Campus Admin' : currentUser.rollNumber}
                  </p>
                </div>
              </div>

              {/* Dropdown for role switching */}
              <div className="absolute right-0 mt-1 w-64 bg-white text-slate-900 rounded-xl shadow-xl border border-slate-200 p-2 hidden group-hover:block hover:block z-50">
                <div className="px-2 py-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 mb-1">
                  Switch Demo Account
                </div>
                {MOCK_PROFILES.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setCurrentUser(p);
                      if (p.role === 'admin') setActiveTab('admin');
                      else if (activeTab === 'admin') setActiveTab('dashboard');
                    }}
                    className={`w-full text-left px-2.5 py-2 rounded-lg text-xs flex items-center justify-between transition-colors ${
                      currentUser.id === p.id
                        ? 'bg-blue-50 text-blue-900 font-semibold'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div>
                      <p className="font-medium">{p.name}</p>
                      <p className="text-[10px] text-slate-500">
                        {p.role === 'admin' ? 'Estate Admin Desk' : `Roll: ${p.rollNumber}`}
                      </p>
                    </div>
                    {currentUser.id === p.id && (
                      <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Layout Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1 flex flex-col lg:flex-row gap-6">
        {/* Desktop Sidebar Navigation */}
        <aside className="hidden lg:block w-64 shrink-0 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                activeTab === 'dashboard'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-blue-600" />
              <span>Student Dashboard</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('report');
                handleResetReportForm();
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                activeTab === 'report'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-700 hover:bg-blue-50/60 hover:text-blue-700'
              }`}
            >
              <div className="flex items-center gap-3">
                <PlusCircle className={`w-4 h-4 ${activeTab === 'report' ? 'text-white' : 'text-blue-600'}`} />
                <span>Report Problem</span>
              </div>
              <span className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-bold ${
                activeTab === 'report' ? 'bg-blue-700 text-white' : 'bg-blue-100 text-blue-700'
              }`}>
                AI Voice
              </span>
            </button>

            <button
              onClick={() => setActiveTab('complaints')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                activeTab === 'complaints'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <ListFilter className="w-4 h-4 text-indigo-600" />
              <span>My Complaints</span>
            </button>

            <button
              onClick={() => setActiveTab('lost-found')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                activeTab === 'lost-found'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <PackageSearch className="w-4 h-4 text-violet-600" />
                <span>Lost & Found</span>
              </div>
              {lostFoundMatches.length > 0 && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-violet-100 text-violet-700 font-bold">
                  {lostFoundMatches.length} AI matches
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('announcements')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                activeTab === 'announcements'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Bell className="w-4 h-4 text-amber-600" />
              <span>Campus Notices</span>
            </button>

            <div className="pt-3 pb-1 border-t border-slate-100">
              <span className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Administration
              </span>
              <button
                onClick={() => {
                  if (currentUser.role !== 'admin') {
                    // switch to admin user for smooth demo access
                    setCurrentUser(MOCK_PROFILES[3]);
                  }
                  setActiveTab('admin');
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                  activeTab === 'admin'
                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                    : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-4 h-4 text-rose-600" />
                  <span>Admin Desk</span>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono">
                  RBAC
                </span>
              </button>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <button
                onClick={() => setActiveTab('settings')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                  activeTab === 'settings'
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Settings className="w-4 h-4 text-slate-500" />
                <span>Settings & Status</span>
              </button>
            </div>
          </div>

          {/* Quick Info Card */}
          <div className="bg-gradient-to-br from-slate-900 to-blue-950 text-white rounded-2xl p-4 shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span className="text-xs font-semibold text-blue-200">Sarvam Multilingual</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Powered by Sarvam AI. Speak or write complaints in Hindi, Telugu, Tamil, Marathi, or English for instant automatic triage.
            </p>
            <button
              onClick={() => setIsConfigModalOpen(true)}
              className="text-[11px] font-semibold text-blue-300 hover:text-blue-200 underline inline-flex items-center gap-1"
            >
              <span>View System Diagnostics</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </aside>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex">
            <div className="w-72 bg-white h-full p-4 flex flex-col justify-between shadow-2xl">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Mic className="w-5 h-5 text-blue-600" />
                    <span className="font-bold text-sm text-slate-900">CampusConnect AI</span>
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1 rounded text-slate-400 hover:text-slate-700"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-1 text-xs font-medium">
                  <button
                    onClick={() => {
                      setActiveTab('dashboard');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 p-2.5 rounded-lg text-slate-700 hover:bg-slate-100"
                  >
                    <LayoutDashboard className="w-4 h-4 text-blue-600" />
                    <span>Student Dashboard</span>
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('report');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 p-2.5 rounded-lg bg-blue-600 text-white font-semibold"
                  >
                    <PlusCircle className="w-4 h-4 text-white" />
                    <span>Report a Problem (Voice)</span>
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('complaints');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 p-2.5 rounded-lg text-slate-700 hover:bg-slate-100"
                  >
                    <ListFilter className="w-4 h-4 text-indigo-600" />
                    <span>My Complaints</span>
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('lost-found');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 p-2.5 rounded-lg text-slate-700 hover:bg-slate-100"
                  >
                    <PackageSearch className="w-4 h-4 text-violet-600" />
                    <span>Lost & Found</span>
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('announcements');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 p-2.5 rounded-lg text-slate-700 hover:bg-slate-100"
                  >
                    <Bell className="w-4 h-4 text-amber-600" />
                    <span>Campus Notices</span>
                  </button>
                  <button
                    onClick={() => {
                      setCurrentUser(MOCK_PROFILES[3]);
                      setActiveTab('admin');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 p-2.5 rounded-lg text-rose-700 hover:bg-rose-50"
                  >
                    <ShieldCheck className="w-4 h-4 text-rose-600" />
                    <span>Admin Desk</span>
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 text-xs">
                <button
                  onClick={() => {
                    setIsConfigModalOpen(true);
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2 text-center text-slate-600 font-medium hover:text-slate-900"
                >
                  System & API Status
                </button>
              </div>
            </div>
            <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
          </div>
        )}

        {/* Content Area */}
        <main className="flex-1 min-w-0">
          {/* ======================================================== */}
          {/* VIEW 1: LANDING PAGE                                    */}
          {/* ======================================================== */}
          {activeTab === 'landing' && (
            <div className="space-y-8 animate-in fade-in duration-200">
              {/* Hero Banner */}
              <div className="relative overflow-hidden rounded-3xl bg-slate-900 text-white p-8 sm:p-12 border border-slate-800 shadow-xl">
                <div className="relative z-10 max-w-2xl space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-300 text-xs font-semibold">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Voice-First Campus Problem Solver</span>
                  </div>

                  <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
                    Your voice. <br />
                    Your campus. <br />
                    <span className="text-blue-400">Your solution.</span>
                  </h1>

                  <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                    Report hostel plumbing failures, electrical hazards, classroom projector faults, Wi-Fi drops, and lost items by speaking in your native language. Sarvam AI translates, categorizes, and dispatches to campus maintenance teams in real time.
                  </p>

                  <div className="pt-4 flex flex-wrap items-center gap-3">
                    <button
                      onClick={() => {
                        setActiveTab('report');
                        handleResetReportForm();
                      }}
                      className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-md flex items-center gap-2 transition-transform hover:scale-102"
                    >
                      <Mic className="w-4 h-4" />
                      <span>Report a Problem with Voice</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('dashboard')}
                      className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm border border-slate-700 flex items-center gap-2"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      <span>View Campus Dashboard</span>
                    </button>
                  </div>
                </div>

                {/* Ambient glow decoration */}
                <div className="absolute right-0 top-0 -mt-12 -mr-12 w-96 h-96 rounded-full bg-blue-600/20 blur-3xl pointer-events-none" />
              </div>

              {/* How it works grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">
                    1
                  </div>
                  <h3 className="font-bold text-slate-900 text-base">Speak or Type</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Describe any hostel or campus problem using your browser microphone or text in English, Hindi, Telugu, or regional languages.
                  </p>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm">
                    2
                  </div>
                  <h3 className="font-bold text-slate-900 text-base">Sarvam AI Triage</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    AI synthesizes a structured report: categorizing urgency, tagging location, and assigning the responsible campus division.
                  </p>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm">
                    3
                  </div>
                  <h3 className="font-bold text-slate-900 text-base">Track & Resolve</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Receive a verified unique ticket ID. Follow status updates along a clear timeline until the issue is repaired and resolved.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* VIEW 2: STUDENT DASHBOARD                               */}
          {/* ======================================================== */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Dashboard Welcome Header */}
              <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                    Welcome back, {currentUser.name}
                  </h1>
                  <p className="text-xs text-slate-500 mt-1">
                    Student Roll No: <strong className="text-slate-700">{currentUser.rollNumber}</strong> | Room: {currentUser.hostelRoom}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setActiveTab('report');
                      handleResetReportForm();
                    }}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm transition-all hover:scale-102"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Report a Problem</span>
                  </button>
                </div>
              </div>

              {/* Stat Cards Grid - Computed strictly from actual stored data */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <span className="text-xs font-medium text-slate-500 block">Total Complaints</span>
                  <div className="mt-2 flex items-baseline justify-between">
                    <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                      {stats ? stats.total : '...'}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-400">All Time</span>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <span className="text-xs font-medium text-amber-700 block">Open / Under Review</span>
                  <div className="mt-2 flex items-baseline justify-between">
                    <span className="text-2xl sm:text-3xl font-extrabold text-amber-600">
                      {stats ? stats.open : '...'}
                    </span>
                    <span className="text-[11px] font-semibold text-amber-700/80 bg-amber-50 px-2 py-0.5 rounded">
                      Action Pending
                    </span>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <span className="text-xs font-medium text-purple-700 block">In Progress</span>
                  <div className="mt-2 flex items-baseline justify-between">
                    <span className="text-2xl sm:text-3xl font-extrabold text-purple-600">
                      {stats ? stats.inProgress : '...'}
                    </span>
                    <span className="text-[11px] font-semibold text-purple-700/80 bg-purple-50 px-2 py-0.5 rounded">
                      Active Repairs
                    </span>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <span className="text-xs font-medium text-emerald-700 block">Resolved</span>
                  <div className="mt-2 flex items-baseline justify-between">
                    <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600">
                      {stats ? stats.resolved : '...'}
                    </span>
                    <span className="text-[11px] font-semibold text-emerald-700/80 bg-emerald-50 px-2 py-0.5 rounded">
                      Completed
                    </span>
                  </div>
                </div>
              </div>

              {/* Visual Category Breakdown & Campus Notices */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  {stats && (
                    <CategoryChart
                      categoryCounts={stats.categoryCounts}
                      priorityCounts={stats.priorityCounts}
                      total={stats.total}
                    />
                  )}
                </div>

                {/* Campus Announcements Widget */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-amber-600" />
                      <h3 className="font-semibold text-slate-900 text-sm">Campus Updates</h3>
                    </div>
                    <button
                      onClick={() => setActiveTab('announcements')}
                      className="text-xs text-blue-600 font-semibold hover:underline"
                    >
                      View All
                    </button>
                  </div>

                  <div className="space-y-3">
                    {announcements.slice(0, 3).map((ann) => (
                      <div
                        key={ann.id}
                        className="p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-semibold text-blue-700">{ann.department}</span>
                          <span className="text-slate-400">{ann.date}</span>
                        </div>
                        <p className="font-medium text-slate-900">{ann.title}</p>
                        <p className="text-slate-500 text-[11px] line-clamp-2">{ann.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recent Complaints Table */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">Recent Campus Complaints</h3>
                    <p className="text-xs text-slate-500">Live ticket pipeline across campus departments</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('complaints')}
                    className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
                  >
                    <span>View All Complaints</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 font-medium">
                        <th className="pb-3 font-semibold">Ticket ID</th>
                        <th className="pb-3 font-semibold">Title</th>
                        <th className="pb-3 font-semibold">Category</th>
                        <th className="pb-3 font-semibold">Priority</th>
                        <th className="pb-3 font-semibold">Status</th>
                        <th className="pb-3 font-semibold">Date</th>
                        <th className="pb-3 font-semibold text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {stats?.recentTickets.map((t) => (
                        <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 font-mono font-bold text-blue-700">{t.id}</td>
                          <td className="py-3 font-medium text-slate-900 max-w-xs truncate">
                            {t.title}
                          </td>
                          <td className="py-3">
                            <CategoryBadge category={t.category} />
                          </td>
                          <td className="py-3">
                            <PriorityBadge priority={t.priority} />
                          </td>
                          <td className="py-3">
                            <StatusBadge status={t.status} size="sm" />
                          </td>
                          <td className="py-3 text-slate-500">
                            {new Date(t.createdAt).toLocaleDateString('en-IN', {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </td>
                          <td className="py-3 text-right">
                            <button
                              onClick={() => {
                                setSelectedTicketId(t.id);
                                setActiveTab('ticket-details');
                              }}
                              className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] transition-colors"
                            >
                              Track
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* VIEW 3: REPORT A PROBLEM (VOICE & TEXT + AI REVIEW)      */}
          {/* ======================================================== */}
          {activeTab === 'report' && (
            <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-200">
              {/* Header */}
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Report Campus Problem</h1>
                <p className="text-xs text-slate-500 mt-1">
                  Describe the issue in your preferred language using voice or text. Sarvam AI will structure the report for you.
                </p>
              </div>

              {/* Success Confirmation Card if ticket just created */}
              {createdTicketId ? (
                <div className="bg-white rounded-2xl border border-emerald-200 p-8 shadow-sm text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-9 h-9" />
                  </div>

                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                      Ticket Generated
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2 font-mono">
                      {createdTicketId}
                    </h2>
                    <p className="text-xs text-slate-600 mt-2 max-w-md mx-auto">
                      Your complaint has been logged in persistent storage and assigned to campus maintenance. You can track its live timeline progress anytime.
                    </p>
                  </div>

                  <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                    <button
                      onClick={() => {
                        setSelectedTicketId(createdTicketId);
                        setActiveTab('ticket-details');
                      }}
                      className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm flex items-center gap-2"
                    >
                      <span>Track Status Timeline</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    <button
                      onClick={handleResetReportForm}
                      className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs"
                    >
                      Report Another Problem
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Mode Selector Tabs (Voice vs Text) */}
                  <div className="bg-slate-200/70 p-1 rounded-xl flex items-center max-w-xs">
                    <button
                      type="button"
                      onClick={() => setReportMode('text')}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all ${
                        reportMode === 'text'
                          ? 'bg-white text-slate-900 shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Text Mode</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setReportMode('voice')}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all ${
                        reportMode === 'voice'
                          ? 'bg-white text-blue-700 shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Mic className="w-3.5 h-3.5 text-blue-600" />
                      <span>Voice Mode</span>
                    </button>
                  </div>

                  {/* Mode 1: Voice Recorder Component */}
                  {reportMode === 'voice' && (
                    <VoiceRecorder
                      selectedLanguage={selectedLanguage}
                      onLanguageChange={setSelectedLanguage}
                      onTranscriptionComplete={handleTranscriptionComplete}
                      onFallbackToText={() => setReportMode('text')}
                      availableLanguages={config?.availableLanguages || [
                        { code: 'en-IN', sarvamCode: 'en-IN', label: 'English', nativeLabel: 'English', voiceSupported: true },
                        { code: 'hi-IN', sarvamCode: 'hi-IN', label: 'Hindi', nativeLabel: 'हिन्दी', voiceSupported: true },
                        { code: 'te-IN', sarvamCode: 'te-IN', label: 'Telugu', nativeLabel: 'తెలుగు', voiceSupported: true },
                      ]}
                    />
                  )}

                  {/* Mode 2: Text Area Input */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <label className="font-semibold text-slate-900 text-sm">
                        Describe the problem:
                      </label>
                      <span className="text-[11px] text-slate-500">
                        Supports English, Hindi, Telugu, Tamil, Marathi, etc.
                      </span>
                    </div>

                    <textarea
                      rows={4}
                      value={rawText}
                      onChange={(e) => setRawText(e.target.value)}
                      placeholder="e.g. The water supply in Hostel 3 2nd floor bathroom has not been working since early morning. No water in any taps or geysers."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />

                    {/* Quick-fill Example Chips */}
                    <div>
                      <span className="text-[11px] font-medium text-slate-500 block mb-1.5">
                        Quick test examples (click to fill):
                      </span>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setRawText('Hostel Block 3 washroom water pipe leaking and zero water supply.');
                            setSelectedLanguage('en-IN');
                          }}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] transition-colors"
                        >
                          💧 Hostel water shortage
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setRawText('Lecture Hall 102 ceiling projector flickering with pink lines.');
                            setSelectedLanguage('en-IN');
                          }}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] transition-colors"
                        >
                          📽️ Classroom projector
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setRawText('Room 214 main switchboard sparking and burning smell.');
                            setSelectedLanguage('en-IN');
                          }}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] transition-colors"
                        >
                          ⚡ Switchboard sparking
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setRawText('Library 3rd floor Wi-Fi access point disconnected.');
                            setSelectedLanguage('en-IN');
                          }}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] transition-colors"
                        >
                          📶 Library Wi-Fi outage
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setRawText('హాస్టల్ 3 బాత్రూంలో ఉదయం నుండి నీటి సరఫరా లేదు.');
                            setSelectedLanguage('te-IN');
                          }}
                          className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-[11px] transition-colors"
                        >
                          తెలుగు (Telugu report)
                        </button>
                      </div>
                    </div>

                    <div className="pt-2 flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleAnalyzeText()}
                        disabled={isAnalyzing || !rawText.trim()}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
                      >
                        <Sparkles className="w-4 h-4 text-blue-200" />
                        <span>{isAnalyzing ? 'Analyzing with Sarvam AI...' : 'Analyze with AI'}</span>
                      </button>
                    </div>
                  </div>

                  {/* AI Structured Review Form (Editable before submission) */}
                  {analysisResult && (
                    <div className="bg-white rounded-2xl border-2 border-blue-500/30 p-6 shadow-sm space-y-5 animate-in fade-in duration-150">
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                        <div>
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-blue-600" />
                            <h3 className="font-bold text-slate-900 text-sm">
                              AI-Generated Complaint Preview
                            </h3>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Review and correct any field before confirming ticket registration.
                          </p>
                        </div>

                        {analysisNotice && (
                          <span className="text-[11px] px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-medium">
                            {analysisNotice}
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                        {/* Title */}
                        <div className="sm:col-span-2">
                          <label className="block font-semibold text-slate-700 mb-1">
                            Complaint Title
                          </label>
                          <input
                            type="text"
                            value={reviewTitle}
                            onChange={(e) => setReviewTitle(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          />
                        </div>

                        {/* Summary */}
                        <div className="sm:col-span-2">
                          <label className="block font-semibold text-slate-700 mb-1">
                            Concise AI Summary
                          </label>
                          <textarea
                            rows={2}
                            value={reviewSummary}
                            onChange={(e) => setReviewSummary(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          />
                        </div>

                        {/* Category */}
                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">
                            Category
                          </label>
                          <select
                            value={reviewCategory}
                            onChange={(e) => setReviewCategory(e.target.value as ComplaintCategory)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          >
                            {[
                              'Electrical',
                              'Plumbing',
                              'Hostel',
                              'Cleaning',
                              'Internet',
                              'Security',
                              'Lost and Found',
                              'Academic',
                              'Transport',
                              'Other',
                            ].map((c) => (
                              <option key={c} value={c}>
                                {c}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Priority */}
                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">
                            Estimated Priority
                          </label>
                          <select
                            value={reviewPriority}
                            onChange={(e) => setReviewPriority(e.target.value as ComplaintPriority)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          >
                            {['Low', 'Medium', 'High', 'Critical'].map((p) => (
                              <option key={p} value={p}>
                                {p}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Department */}
                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">
                            Responsible Department
                          </label>
                          <input
                            type="text"
                            value={reviewDepartment}
                            onChange={(e) => setReviewDepartment(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          />
                        </div>

                        {/* Location */}
                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">
                            Campus Location
                          </label>
                          <input
                            type="text"
                            value={reviewLocation}
                            onChange={(e) => setReviewLocation(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          />
                        </div>

                        {/* Suggested Action */}
                        <div className="sm:col-span-2">
                          <label className="block font-semibold text-slate-700 mb-1">
                            Recommended Maintenance Action
                          </label>
                          <input
                            type="text"
                            value={reviewSuggestedAction}
                            onChange={(e) => setReviewSuggestedAction(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* Submitting Student Identity */}
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-600">
                        <div>
                          <span className="font-semibold text-slate-800">Submitting As: </span>
                          <span>
                            {currentUser.name} (Roll: {currentUser.rollNumber})
                          </span>
                        </div>
                        <div>
                          <span className="font-semibold text-slate-800">Room: </span>
                          <span>{currentUser.hostelRoom}</span>
                        </div>
                      </div>

                      {/* Final Confirm Button */}
                      <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => setAnalysisResult(null)}
                          className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 text-xs font-semibold"
                        >
                          Discard & Re-type
                        </button>

                        <button
                          type="button"
                          onClick={handleSubmitFinalTicket}
                          disabled={submittingTicket}
                          className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition-all hover:scale-102 flex items-center gap-2 disabled:opacity-50"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>
                            {submittingTicket ? 'Registering Ticket...' : 'Confirm & Submit Ticket'}
                          </span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* VIEW 4: MY COMPLAINTS / ALL COMPLAINTS                   */}
          {/* ======================================================== */}
          {activeTab === 'complaints' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                    {currentUser.role === 'admin' ? 'Campus Complaints' : 'My Complaints'}
                  </h1>
                  <p className="text-xs text-slate-500 mt-1">
                    {currentUser.role === 'admin'
                      ? 'All registered campus complaints and status logs'
                      : `Complaints submitted by ${currentUser.name} (${currentUser.rollNumber})`}
                  </p>
                </div>

                <button
                  onClick={() => {
                    setActiveTab('report');
                    handleResetReportForm();
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Report New Problem</span>
                </button>
              </div>

              {/* Filters and Search Bar */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 w-full sm:w-72">
                  <Search className="w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by ticket ID, title, room..."
                    className="bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none w-full"
                  />
                </div>

                <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
                  <span className="text-xs font-medium text-slate-500">Status:</span>
                  {['all', 'Submitted', 'Under Review', 'Assigned', 'In Progress', 'Resolved'].map(
                    (st) => (
                      <button
                        key={st}
                        onClick={() => setStatusFilter(st)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0 ${
                          statusFilter === st
                            ? 'bg-blue-600 text-white font-semibold shadow-sm'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {st === 'all' ? 'All' : st}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Complaints List Cards */}
              <div className="space-y-3">
                {complaints
                  .filter((c) => {
                    if (!searchQuery.trim()) return true;
                    const q = searchQuery.toLowerCase();
                    return (
                      c.id.toLowerCase().includes(q) ||
                      c.title.toLowerCase().includes(q) ||
                      c.location.toLowerCase().includes(q) ||
                      c.department.toLowerCase().includes(q)
                    );
                  })
                  .map((t) => (
                    <div
                      key={t.id}
                      onClick={() => {
                        setSelectedTicketId(t.id);
                        setActiveTab('ticket-details');
                      }}
                      className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group space-y-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                            {t.id}
                          </span>
                          <CategoryBadge category={t.category} />
                          <PriorityBadge priority={t.priority} />
                        </div>

                        <div className="flex items-center gap-2">
                          <StatusBadge status={t.status} />
                          <span className="text-xs text-slate-400">
                            {new Date(t.createdAt).toLocaleDateString('en-IN', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">
                          {t.title}
                        </h3>
                        <p className="text-xs text-slate-600 mt-1 line-clamp-2">{t.summary}</p>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between text-[11px] text-slate-500">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            <span>{t.location}</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <Building className="w-3.5 h-3.5 text-slate-400" />
                            <span>{t.department}</span>
                          </span>
                        </div>

                        <span className="font-semibold text-blue-600 group-hover:underline flex items-center gap-0.5">
                          <span>View Timeline</span>
                          <ChevronRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  ))}

                {complaints.length === 0 && (
                  <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
                    <CheckCircle2 className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                    <p className="font-medium text-slate-700">No complaints matching filter.</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Report a new problem to see your tickets listed here.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* VIEW 5: TICKET DETAILS & STATUS TIMELINE                 */}
          {/* ======================================================== */}
          {activeTab === 'ticket-details' && selectedTicket && (
            <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
              {/* Back button */}
              <button
                onClick={() => setActiveTab('complaints')}
                className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
              >
                <span>← Back to Complaints</span>
              </button>

              {/* Main Ticket Card */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
                {/* Header with ID and Status */}
                <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono font-bold text-sm px-2.5 py-1 rounded bg-blue-50 text-blue-800 border border-blue-200">
                        {selectedTicket.id}
                      </span>
                      <CategoryBadge category={selectedTicket.category} />
                      <PriorityBadge priority={selectedTicket.priority} />
                    </div>
                    <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-2">
                      {selectedTicket.title}
                    </h1>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <StatusBadge status={selectedTicket.status} size="lg" />
                    {currentUser.role === 'admin' && (
                      <button
                        onClick={() => {
                          setAdminTargetTicket(selectedTicket);
                          setIsAdminModalOpen(true);
                        }}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                        <span>Update Status (Admin)</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs">
                  <div>
                    <span className="text-slate-400 block">Reported By</span>
                    <span className="font-semibold text-slate-800 mt-0.5 block">
                      {selectedTicket.userName} ({selectedTicket.userRoll})
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block">Location</span>
                    <span className="font-semibold text-slate-800 mt-0.5 block">
                      {selectedTicket.location}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block">Department</span>
                    <span className="font-semibold text-slate-800 mt-0.5 block">
                      {selectedTicket.department}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block">Created On</span>
                    <span className="font-semibold text-slate-800 mt-0.5 block">
                      {new Date(selectedTicket.createdAt).toLocaleString('en-IN', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </span>
                  </div>
                </div>

                {/* AI Summary and Raw Description */}
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200/80 space-y-1">
                    <div className="flex items-center gap-2 text-xs font-semibold text-blue-900">
                      <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                      <span>AI Triage Summary & Action</span>
                    </div>
                    <p className="text-xs text-slate-800 leading-relaxed font-medium">
                      {selectedTicket.summary}
                    </p>
                    <p className="text-[11px] text-blue-700 pt-1">
                      <strong>Recommended Action:</strong> {selectedTicket.suggestedAction}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Original Student Report:
                    </h4>
                    <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200">
                      "{selectedTicket.rawDescription}"
                    </p>
                  </div>

                  {selectedTicket.resolutionNotes && (
                    <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1">
                      <span className="text-xs font-bold text-emerald-800 block">
                        Official Resolution Notes:
                      </span>
                      <p className="text-xs text-emerald-900">{selectedTicket.resolutionNotes}</p>
                    </div>
                  )}
                </div>

                {/* Timeline section */}
                <div className="pt-6 border-t border-slate-100">
                  <h3 className="font-bold text-slate-900 text-sm mb-4">
                    Status Timeline & History
                  </h3>
                  <TicketTimeline events={selectedTicket.statusTimeline} />
                </div>

                {/* Student Follow-up Remarks Form */}
                <div className="pt-6 border-t border-slate-100 space-y-3">
                  <h4 className="text-xs font-semibold text-slate-800">Add a Student Follow-up Note:</h4>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newRemarkText}
                      onChange={(e) => setNewRemarkText(e.target.value)}
                      placeholder="e.g. Plumber inspected the bathroom at 11 AM, awaiting replacement valve..."
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                    <button
                      onClick={handleAddRemark}
                      disabled={submittingRemark || !newRemarkText.trim()}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Post</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* VIEW 6: LOST AND FOUND SECTION                           */}
          {/* ======================================================== */}
          {activeTab === 'lost-found' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                    Campus Lost & Found
                  </h1>
                  <p className="text-xs text-slate-500 mt-1">
                    Report lost belongings, found items, and view AI matching between lost and found logs.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setNewLfType('lost');
                      setIsPostLostModalOpen(true);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-sm"
                  >
                    + Report Lost Item
                  </button>

                  <button
                    onClick={() => {
                      setNewLfType('found');
                      setIsPostLostModalOpen(true);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm"
                  >
                    + Report Found Item
                  </button>
                </div>
              </div>

              {/* Sub-tabs: All, Lost, Found, AI Matches */}
              <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
                <button
                  onClick={() => setLostFoundTab('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    lostFoundTab === 'all'
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  All Items ({lostFoundItems.length})
                </button>

                <button
                  onClick={() => setLostFoundTab('lost')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    lostFoundTab === 'lost'
                      ? 'bg-rose-600 text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Lost Items ({lostFoundItems.filter((i) => i.type === 'lost').length})
                </button>

                <button
                  onClick={() => setLostFoundTab('found')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    lostFoundTab === 'found'
                      ? 'bg-emerald-600 text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Found Items ({lostFoundItems.filter((i) => i.type === 'found').length})
                </button>

                <button
                  onClick={() => setLostFoundTab('matches')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    lostFoundTab === 'matches'
                      ? 'bg-violet-600 text-white shadow-sm'
                      : 'text-violet-700 bg-violet-50 hover:bg-violet-100'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI Match Engine ({lostFoundMatches.length} Matches)</span>
                </button>
              </div>

              {/* TAB 1: AI Matches Tab */}
              {lostFoundTab === 'matches' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-violet-50 border border-violet-200 text-xs text-violet-900 flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-violet-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold">Algorithmic Lost & Found Correlation Engine</h4>
                      <p className="mt-0.5 text-violet-800">
                        Matches reported items using multi-vector similarity: categories, keywords, date window, and campus location proximity. AI provides probability hints—owners must verify proof before collecting.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {lostFoundMatches.map((match, idx) => (
                      <div
                        key={idx}
                        className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                                match.confidence === 'High'
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                  : 'bg-amber-100 text-amber-800 border border-amber-300'
                              }`}
                            >
                              {match.confidence} Match ({match.score}%)
                            </span>
                          </div>

                          <button
                            onClick={() => setClaimTargetItem(match.foundItem)}
                            className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm"
                          >
                            Verify & Submit Safe Claim
                          </button>
                        </div>

                        {/* Match Comparison Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                          {/* Lost Card */}
                          <div className="p-4 rounded-xl bg-rose-50/50 border border-rose-200/80 space-y-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 bg-rose-100 px-2 py-0.5 rounded">
                              Lost Item Report
                            </span>
                            <h4 className="font-bold text-slate-900">{match.lostItem.title}</h4>
                            <p className="text-slate-600">{match.lostItem.description}</p>
                            <div className="pt-2 text-[11px] text-slate-500 space-y-0.5">
                              <p>
                                <strong>Area:</strong> {match.lostItem.location}
                              </p>
                              <p>
                                <strong>Date:</strong> {match.lostItem.date}
                              </p>
                              <p>
                                <strong>Logged by:</strong> {match.lostItem.userName}
                              </p>
                            </div>
                          </div>

                          {/* Found Card */}
                          <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200/80 space-y-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                              Found Item Post
                            </span>
                            <h4 className="font-bold text-slate-900">{match.foundItem.title}</h4>
                            <p className="text-slate-600">{match.foundItem.description}</p>
                            <div className="pt-2 text-[11px] text-slate-500 space-y-0.5">
                              <p>
                                <strong>Found Area:</strong> {match.foundItem.location}
                              </p>
                              <p>
                                <strong>Date:</strong> {match.foundItem.date}
                              </p>
                              <p>
                                <strong>Custody:</strong> {match.foundItem.contactMethod}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Why it matched */}
                        <div className="pt-1 text-xs">
                          <span className="font-semibold text-slate-700">Why this matches:</span>
                          <ul className="list-disc pl-5 mt-1 text-slate-600 space-y-0.5 text-[11px]">
                            {match.matchReasons.map((reason, rIdx) => (
                              <li key={rIdx}>{reason}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}

                    {lostFoundMatches.length === 0 && (
                      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-xs text-slate-500">
                        No high-confidence matches found between current lost and found items.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: Standard Items Grid */}
              {lostFoundTab !== 'matches' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {lostFoundItems
                    .filter((item) => {
                      if (lostFoundTab === 'lost') return item.type === 'lost';
                      if (lostFoundTab === 'found') return item.type === 'found';
                      return true;
                    })
                    .map((item) => (
                      <div
                        key={item.id}
                        className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3 flex flex-col justify-between"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span
                              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                                item.type === 'lost'
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              {item.type === 'lost' ? 'Lost' : 'Found'}
                            </span>
                            <span className="text-[11px] font-mono text-slate-400">{item.id}</span>
                          </div>

                          <h3 className="font-bold text-slate-900 text-sm">{item.title}</h3>
                          <p className="text-xs text-slate-600 line-clamp-3">{item.description}</p>
                        </div>

                        <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
                          <div className="flex items-center justify-between text-slate-500 text-[11px]">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              <span>{item.location}</span>
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              <span>{item.date}</span>
                            </span>
                          </div>

                          <button
                            onClick={() => setClaimTargetItem(item)}
                            className="w-full py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors"
                          >
                            {item.type === 'found' ? 'Claim This Item' : 'I Found This Item'}
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* VIEW 7: CAMPUS ANNOUNCEMENTS & ALERTS                    */}
          {/* ======================================================== */}
          {activeTab === 'announcements' && (
            <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-200">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Campus Notices & Alerts</h1>
                <p className="text-xs text-slate-500 mt-1">
                  Official alerts from Electrical Division, Water Sanitation, and Campus IT.
                </p>
              </div>

              <div className="space-y-4">
                {announcements.map((ann) => (
                  <div
                    key={ann.id}
                    className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                        {ann.category}
                      </span>
                      <span className="text-xs text-slate-400">{ann.date}</span>
                    </div>

                    <div>
                      <h3 className="font-bold text-slate-900 text-base">{ann.title}</h3>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">{ann.content}</p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 text-xs text-slate-500">
                      <span>Issued by: </span>
                      <strong className="text-slate-700">{ann.department}</strong>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* VIEW 8: ADMINISTRATOR DASHBOARD                          */}
          {/* ======================================================== */}
          {activeTab === 'admin' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="p-4 rounded-2xl bg-slate-900 text-white flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-600 flex items-center justify-center text-white">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h1 className="font-bold text-lg">Administrator & Estate Operations Portal</h1>
                    <p className="text-xs text-slate-400">
                      Logged in as: {currentUser.name} ({currentUser.role === 'admin' ? 'Authorized Admin' : 'Demo Admin'})
                    </p>
                  </div>
                </div>

                <div className="text-xs bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 text-slate-300">
                  <span>Server Permission Checks Active</span>
                </div>
              </div>

              {/* Admin Stats Overview */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <span className="text-xs text-slate-500">All Campus Tickets</span>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{stats?.total || 0}</p>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <span className="text-xs text-amber-600">Pending Review</span>
                  <p className="text-2xl font-bold text-amber-600 mt-1">{stats?.open || 0}</p>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <span className="text-xs text-purple-600">Under Repair</span>
                  <p className="text-2xl font-bold text-purple-600 mt-1">{stats?.inProgress || 0}</p>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <span className="text-xs text-emerald-600">Resolved Today</span>
                  <p className="text-2xl font-bold text-emerald-600 mt-1">{stats?.resolved || 0}</p>
                </div>
              </div>

              {/* Manage All Tickets Table */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">Campus Problem Dispatch Table</h3>
                    <p className="text-xs text-slate-500">Click any ticket to reassign or change operational status</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Filter by Ticket ID or Keyword..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500">
                        <th className="pb-3 font-semibold">Ticket ID</th>
                        <th className="pb-3 font-semibold">Student</th>
                        <th className="pb-3 font-semibold">Issue Title</th>
                        <th className="pb-3 font-semibold">Location</th>
                        <th className="pb-3 font-semibold">Department</th>
                        <th className="pb-3 font-semibold">Priority</th>
                        <th className="pb-3 font-semibold">Status</th>
                        <th className="pb-3 font-semibold text-right">Admin Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {complaints
                        .filter((t) => {
                          if (!searchQuery.trim()) return true;
                          const q = searchQuery.toLowerCase();
                          return (
                            t.id.toLowerCase().includes(q) ||
                            t.title.toLowerCase().includes(q) ||
                            t.userName.toLowerCase().includes(q) ||
                            t.location.toLowerCase().includes(q)
                          );
                        })
                        .map((t) => (
                          <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-3 font-mono font-bold text-blue-700">{t.id}</td>
                            <td className="py-3 font-medium text-slate-900">
                              {t.userName}
                              <span className="block text-[10px] text-slate-400">{t.userRoll}</span>
                            </td>
                            <td className="py-3 font-medium text-slate-900 max-w-xs truncate">
                              {t.title}
                            </td>
                            <td className="py-3 text-slate-600">{t.location}</td>
                            <td className="py-3 font-medium text-slate-700">{t.department}</td>
                            <td className="py-3">
                              <PriorityBadge priority={t.priority} />
                            </td>
                            <td className="py-3">
                              <StatusBadge status={t.status} size="sm" />
                            </td>
                            <td className="py-3 text-right">
                              <button
                                onClick={() => {
                                  setAdminTargetTicket(t);
                                  setIsAdminModalOpen(true);
                                }}
                                className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[11px] font-semibold transition-colors"
                              >
                                Edit Status
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* VIEW 9: SETTINGS & DIAGNOSTICS                           */}
          {/* ======================================================== */}
          {activeTab === 'settings' && (
            <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-200">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Settings & Diagnostics</h1>
                <p className="text-xs text-slate-500 mt-1">
                  System configuration, AI credentials, persistent storage, and demo reset.
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm mb-3">System & AI Architecture</h3>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-700">Sarvam AI Integration:</span>
                      <span
                        className={`font-semibold px-2 py-0.5 rounded ${
                          config?.hasSarvamKey
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {config?.hasSarvamKey ? 'Connected (Live)' : 'Awaiting SARVAM_API_KEY'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-700">Database Engine:</span>
                      <span className="font-mono bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-800">
                        Persistent Filesystem JSON (Production Firestore Ready)
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-700">Authentication Mode:</span>
                      <span className="bg-blue-50 text-blue-800 px-2 py-0.5 rounded font-semibold">
                        Role-Based Demo Mode (Multi-User)
                      </span>
                    </div>

                    <button
                      onClick={() => setIsConfigModalOpen(true)}
                      className="mt-2 text-xs font-semibold text-blue-600 hover:underline inline-flex items-center gap-1"
                    >
                      <span>Open Full Setup Guide & API Diagnostics</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <h3 className="font-bold text-slate-900 text-sm mb-2">Active Mock Student Persona</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {MOCK_PROFILES.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => setCurrentUser(p)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all ${
                          currentUser.id === p.id
                            ? 'bg-blue-50/70 border-blue-400 font-medium'
                            : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900">{p.name}</span>
                          {currentUser.id === p.id && (
                            <span className="text-[10px] font-bold text-blue-600 bg-white px-1.5 py-0.5 rounded border border-blue-200">
                              Active
                            </span>
                          )}
                        </div>
                        <p className="text-slate-500 text-[11px] mt-0.5">
                          {p.role === 'admin' ? 'Campus Admin' : `Roll: ${p.rollNumber}`} | {p.hostelRoom}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Post Lost/Found Modal */}
      {isPostLostModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-semibold text-sm">
                Report {newLfType === 'lost' ? 'Lost' : 'Found'} Item
              </h3>
              <button
                onClick={() => setIsPostLostModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePostLostFound} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Item Title</label>
                <input
                  type="text"
                  required
                  value={newLfTitle}
                  onChange={(e) => setNewLfTitle(e.target.value)}
                  placeholder="e.g. Titan Black Leather Watch"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Category</label>
                <select
                  value={newLfCategory}
                  onChange={(e) => setNewLfCategory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="ID Cards & Wallets">ID Cards & Wallets</option>
                  <option value="Accessories">Accessories & Watches</option>
                  <option value="Electronics">Electronics & Laptops</option>
                  <option value="Books & Notes">Books & Stationery</option>
                  <option value="Keys">Keys</option>
                  <option value="General">Other Items</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  required
                  value={newLfDescription}
                  onChange={(e) => setNewLfDescription(e.target.value)}
                  placeholder="Describe unique identifiers, scratches, labels..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Location</label>
                  <input
                    type="text"
                    required
                    value={newLfLocation}
                    onChange={(e) => setNewLfLocation(e.target.value)}
                    placeholder="e.g. Basketball Court Bleachers"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={newLfDate}
                    onChange={(e) => setNewLfDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsPostLostModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
                >
                  Post Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Claim Modal */}
      <ClaimModal
        item={claimTargetItem}
        isOpen={!!claimTargetItem}
        onClose={() => setClaimTargetItem(null)}
        currentUser={currentUser}
      />

      {/* Admin Status Modal */}
      <AdminStatusModal
        ticket={adminTargetTicket}
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        onUpdated={(updated) => {
          setSelectedTicket(updated);
          loadComplaintsList();
          loadDashboard();
        }}
      />

      {/* Architecture & API Status Modal */}
      <ApiStatusModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        config={config}
        onDataReset={() => {
          loadDashboard();
          loadComplaintsList();
          loadLostFoundData();
        }}
      />
    </div>
  );
}
