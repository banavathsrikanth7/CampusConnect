export type ComplaintCategory =
  | 'Electrical'
  | 'Plumbing'
  | 'Hostel'
  | 'Cleaning'
  | 'Internet'
  | 'Security'
  | 'Lost and Found'
  | 'Academic'
  | 'Transport'
  | 'Other';

export type ComplaintPriority = 'Low' | 'Medium' | 'High' | 'Critical';

export type ComplaintStatus =
  | 'Submitted'
  | 'Under Review'
  | 'Assigned'
  | 'In Progress'
  | 'Resolved'
  | 'Rejected';

export interface TimelineEvent {
  status: ComplaintStatus;
  timestamp: string;
  note: string;
  actor: string;
}

export interface ComplaintTicket {
  id: string; // e.g. "CC-2026-0001"
  userId: string;
  userName: string;
  userRoll: string;
  userContact?: string;
  userHostelRoom?: string;
  title: string;
  rawDescription: string;
  language: string;
  summary: string;
  category: ComplaintCategory;
  priority: ComplaintPriority;
  department: string;
  location: string;
  suggestedAction: string;
  status: ComplaintStatus;
  statusTimeline: TimelineEvent[];
  internalNotes?: string;
  resolutionNotes?: string;
  audioAttached?: boolean;
  isDemoSimulation?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ComplaintAnalysisResult {
  title: string;
  summary: string;
  category: ComplaintCategory;
  priority: ComplaintPriority;
  department: string;
  location: string;
  suggestedAction: string;
  isDemoSimulation?: boolean;
  provider?: string;
  detectedLanguage?: string;
}

export type LostFoundType = 'lost' | 'found';

export interface LostFoundItem {
  id: string; // e.g. "LF-2026-0001"
  type: LostFoundType;
  title: string;
  category: string;
  description: string;
  location: string;
  date: string;
  userId: string;
  userName: string;
  contactMethod: string;
  status: 'open' | 'claimed' | 'resolved';
  createdAt: string;
}

export interface LostFoundMatch {
  lostItem: LostFoundItem;
  foundItem: LostFoundItem;
  confidence: 'High' | 'Medium' | 'Potential';
  score: number; // 0 - 100
  matchReasons: string[];
}

export interface CampusAnnouncement {
  id: string;
  title: string;
  content: string;
  category: 'Maintenance' | 'Security' | 'Event' | 'Urgent';
  department: string;
  date: string;
  active: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  rollNumber: string;
  email: string;
  role: 'student' | 'admin';
  hostelRoom: string;
  phone: string;
}

export interface DashboardStats {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  critical: number;
  categoryCounts: Record<string, number>;
  priorityCounts: Record<string, number>;
  statusCounts: Record<string, number>;
  recentTickets: ComplaintTicket[];
}

export interface ConfigStatus {
  hasSarvamKey: boolean;
  hasGeminiKey: boolean;
  storageType: 'filesystem-json';
  authMode: 'demo-role-based';
  availableLanguages: Array<{
    code: string;
    sarvamCode: string;
    label: string;
    nativeLabel: string;
    voiceSupported: boolean;
  }>;
}
