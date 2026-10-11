import {
  ComplaintTicket,
  ComplaintAnalysisResult,
  LostFoundItem,
  LostFoundMatch,
  CampusAnnouncement,
  DashboardStats,
  ConfigStatus,
  ComplaintStatus,
} from '../types.ts';

export async function fetchConfigStatus(): Promise<ConfigStatus> {
  const res = await fetch('/api/config-status');
  if (!res.ok) throw new Error('Failed to load system config');
  return res.json();
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const res = await fetch('/api/dashboard/stats');
  if (!res.ok) throw new Error('Failed to load dashboard stats');
  return res.json();
}

export async function fetchComplaints(params?: {
  userId?: string;
  role?: string;
  status?: string;
  category?: string;
  priority?: string;
}): Promise<ComplaintTicket[]> {
  const query = new URLSearchParams();
  if (params?.userId) query.set('userId', params.userId);
  if (params?.role) query.set('role', params.role);
  if (params?.status) query.set('status', params.status);
  if (params?.category) query.set('category', params.category);
  if (params?.priority) query.set('priority', params.priority);

  const res = await fetch(`/api/complaints?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to load complaints');
  return res.json();
}

export async function fetchComplaintById(ticketId: string): Promise<ComplaintTicket> {
  const res = await fetch(`/api/complaints/${ticketId}`);
  if (!res.ok) throw new Error(`Ticket ${ticketId} not found`);
  return res.json();
}

export async function analyzeComplaint(
  text: string,
  language: string = 'en-IN'
): Promise<ComplaintAnalysisResult> {
  const res = await fetch('/api/complaints/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, language }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Analysis failed' }));
    throw new Error(err.error || 'Failed to analyze complaint');
  }
  return res.json();
}

export async function transcribeVoice(
  audioBase64: string,
  mimeType: string,
  languageCode: string
): Promise<{
  transcript: string;
  languageCode: string;
  provider: string;
  isDemoSimulation?: boolean;
  message?: string;
}> {
  const res = await fetch('/api/voice/transcribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ audioBase64, mimeType, languageCode }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Transcription failed' }));
    throw new Error(err.message || err.error || 'Audio transcription failed');
  }
  return res.json();
}

export async function createComplaint(
  ticketData: Partial<ComplaintTicket>
): Promise<ComplaintTicket> {
  const res = await fetch('/api/complaints', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(ticketData),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Creation failed' }));
    throw new Error(err.error || 'Failed to register complaint');
  }
  return res.json();
}

export async function updateComplaintStatus(
  ticketId: string,
  payload: {
    status: ComplaintStatus;
    note?: string;
    actor?: string;
    department?: string;
    internalNotes?: string;
    resolutionNotes?: string;
    adminPasskey?: string;
  }
): Promise<ComplaintTicket> {
  const res = await fetch(`/api/complaints/${ticketId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Update failed' }));
    throw new Error(err.error || 'Failed to update ticket status');
  }
  return res.json();
}

export async function addComplaintRemark(
  ticketId: string,
  remark: string,
  actor: string
): Promise<ComplaintTicket> {
  const res = await fetch(`/api/complaints/${ticketId}/remarks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ remark, actor }),
  });
  if (!res.ok) throw new Error('Failed to add remark');
  return res.json();
}

export async function fetchLostFound(): Promise<LostFoundItem[]> {
  const res = await fetch('/api/lost-found');
  if (!res.ok) throw new Error('Failed to load Lost & Found items');
  return res.json();
}

export async function createLostFound(item: Partial<LostFoundItem>): Promise<LostFoundItem> {
  const res = await fetch('/api/lost-found', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item),
  });
  if (!res.ok) throw new Error('Failed to post Lost & Found item');
  return res.json();
}

export async function fetchLostFoundMatches(): Promise<LostFoundMatch[]> {
  const res = await fetch('/api/lost-found/matches');
  if (!res.ok) throw new Error('Failed to load AI matches');
  return res.json();
}

export async function fetchAnnouncements(): Promise<CampusAnnouncement[]> {
  const res = await fetch('/api/announcements');
  if (!res.ok) throw new Error('Failed to load announcements');
  return res.json();
}

export async function resetDemoData(): Promise<void> {
  const res = await fetch('/api/dev/reset-data', { method: 'POST' });
  if (!res.ok) throw new Error('Failed to reset demo data');
}
