import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { storage } from './server/storage.ts';
import {
  analyzeWithSarvamAI,
  transcribeWithSarvamSTT,
  getSarvamApiKey,
  SUPPORTED_LANGUAGES,
  VALID_CATEGORIES,
  VALID_PRIORITIES,
} from './server/sarvam.ts';
import { findLostFoundMatches } from './server/matcher.ts';
import { ComplaintTicket, ComplaintStatus } from './src/types.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

// Allow JSON with base64 audio payloads
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Health and Configuration Status
app.get('/api/config-status', (_req: Request, res: Response) => {
  const hasSarvamKey = !!getSarvamApiKey();
  const hasGeminiKey = !!process.env.GEMINI_API_KEY && !process.env.GEMINI_API_KEY.includes('MY_GEMINI');

  res.json({
    hasSarvamKey,
    hasGeminiKey,
    storageType: 'filesystem-json',
    authMode: 'demo-role-based',
    availableLanguages: SUPPORTED_LANGUAGES,
    version: '1.0.0',
    app: 'CampusConnect AI',
  });
});

// Analyze Complaint Text
app.post('/api/complaints/analyze', async (req: Request, res: Response) => {
  try {
    const { text, language = 'en-IN' } = req.body;
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      res.status(400).json({ error: 'Complaint text is required for AI analysis' });
      return;
    }

    const result = await analyzeWithSarvamAI(text.trim(), language);
    res.json(result);
  } catch (err: any) {
    console.error('Error analyzing complaint:', err);
    res.status(500).json({ error: 'Failed to analyze complaint', details: err.message });
  }
});

// Transcribe Voice Audio
app.post('/api/voice/transcribe', async (req: Request, res: Response) => {
  try {
    const { audioBase64, mimeType = 'audio/webm', languageCode = 'en-IN' } = req.body;

    if (!audioBase64 || typeof audioBase64 !== 'string') {
      res.status(400).json({ error: 'audioBase64 payload is required' });
      return;
    }

    const hasSarvamKey = !!getSarvamApiKey();
    if (!hasSarvamKey) {
      // Clear and honest response as required by instructions
      res.status(200).json({
        transcript: '',
        languageCode,
        isDemoSimulation: true,
        provider: 'Sarvam AI STT awaiting SARVAM_API_KEY configuration',
        message:
          'Audio recorded successfully on device! SARVAM_API_KEY is not configured in environment. Please type or configure the API key in settings.',
      });
      return;
    }

    const result = await transcribeWithSarvamSTT(audioBase64, mimeType, languageCode);
    res.json(result);
  } catch (err: any) {
    console.error('Transcription error:', err);
    res.status(500).json({
      error: 'Audio transcription failed',
      message: err.message || 'Error communicating with Sarvam Saaras STT',
    });
  }
});

// List Complaints
app.get('/api/complaints', (req: Request, res: Response) => {
  const { userId, role, status, category, priority } = req.query;
  let list = storage.getComplaints();

  // If role is student and userId provided, only return their complaints
  if (role === 'student' && userId) {
    list = list.filter((c) => c.userId === userId);
  }

  if (status && typeof status === 'string' && status !== 'all') {
    list = list.filter((c) => c.status === status);
  }

  if (category && typeof category === 'string' && category !== 'all') {
    list = list.filter((c) => c.category === category);
  }

  if (priority && typeof priority === 'string' && priority !== 'all') {
    list = list.filter((c) => c.priority === priority);
  }

  res.json(list);
});

// Create Complaint Ticket
app.post('/api/complaints', (req: Request, res: Response) => {
  try {
    const {
      title,
      rawDescription,
      summary,
      category,
      priority,
      department,
      location,
      suggestedAction,
      language = 'en-IN',
      userId = 'student-guest',
      userName = 'Campus Student',
      userRoll = '2026-STU',
      userContact = '',
      userHostelRoom = '',
      audioAttached = false,
      isDemoSimulation = false,
    } = req.body;

    if (!title || !rawDescription) {
      res.status(400).json({ error: 'Title and description are required' });
      return;
    }

    // Server-side validation
    const validCategory = VALID_CATEGORIES.includes(category) ? category : 'Other';
    const validPriority = VALID_PRIORITIES.includes(priority) ? priority : 'Medium';

    const newTicket = storage.createComplaint({
      title: title.trim(),
      rawDescription: rawDescription.trim(),
      summary: (summary || rawDescription).trim(),
      category: validCategory,
      priority: validPriority,
      department: (department || 'Estate Office').trim(),
      location: (location || 'Campus Premises').trim(),
      suggestedAction: (suggestedAction || 'Investigate issue').trim(),
      language,
      userId,
      userName,
      userRoll,
      userContact,
      userHostelRoom,
      status: 'Submitted',
      audioAttached: !!audioAttached,
      isDemoSimulation: !!isDemoSimulation,
    });

    res.status(201).json(newTicket);
  } catch (err: any) {
    console.error('Error creating complaint:', err);
    res.status(500).json({ error: 'Failed to register complaint', details: err.message });
  }
});

// Get Single Complaint by ID
app.get('/api/complaints/:ticketId', (req: Request, res: Response) => {
  const { ticketId } = req.params;
  const ticket = storage.getComplaintById(ticketId);

  if (!ticket) {
    res.status(404).json({ error: `Ticket ${ticketId} not found` });
    return;
  }

  res.json(ticket);
});

// Update Complaint Status (Admin workflow)
app.patch('/api/complaints/:ticketId/status', (req: Request, res: Response) => {
  try {
    const { ticketId } = req.params;
    const {
      status,
      note,
      actor = 'Campus Administrator',
      department,
      internalNotes,
      resolutionNotes,
      adminPasskey,
    } = req.body;

    const validStatuses: ComplaintStatus[] = [
      'Submitted',
      'Under Review',
      'Assigned',
      'In Progress',
      'Resolved',
      'Rejected',
    ];

    if (!validStatuses.includes(status)) {
      res.status(400).json({ error: `Invalid status: ${status}` });
      return;
    }

    // Role check: If an admin passkey is required or configured in env
    const expectedPass = process.env.ADMIN_SECRET_KEY;
    if (expectedPass && adminPasskey && adminPasskey !== expectedPass) {
      res.status(403).json({ error: 'Invalid admin authorization token' });
      return;
    }

    const updated = storage.updateComplaintStatus(
      ticketId,
      status,
      note,
      actor,
      department,
      internalNotes,
      resolutionNotes
    );

    if (!updated) {
      res.status(404).json({ error: `Ticket ${ticketId} not found` });
      return;
    }

    res.json(updated);
  } catch (err: any) {
    console.error('Error updating complaint status:', err);
    res.status(500).json({ error: 'Failed to update ticket status', details: err.message });
  }
});

// Add remark or follow-up note by student or staff
app.post('/api/complaints/:ticketId/remarks', (req: Request, res: Response) => {
  const { ticketId } = req.params;
  const { remark, actor = 'Student' } = req.body;

  if (!remark || typeof remark !== 'string' || remark.trim().length === 0) {
    res.status(400).json({ error: 'Remark cannot be empty' });
    return;
  }

  const updated = storage.addComplaintRemark(ticketId, remark.trim(), actor);
  if (!updated) {
    res.status(404).json({ error: `Ticket ${ticketId} not found` });
    return;
  }

  res.json(updated);
});

// Lost & Found API
app.get('/api/lost-found', (_req: Request, res: Response) => {
  res.json(storage.getLostFound());
});

app.post('/api/lost-found', (req: Request, res: Response) => {
  try {
    const {
      type,
      title,
      category = 'General',
      description,
      location,
      date,
      userId = 'student-guest',
      userName = 'Student',
      contactMethod = 'Campus Security Desk',
    } = req.body;

    if (!type || !title || !description || !location) {
      res.status(400).json({ error: 'Type, title, description, and location are required' });
      return;
    }

    const newItem = storage.createLostFound({
      type: type === 'found' ? 'found' : 'lost',
      title: title.trim(),
      category: category.trim(),
      description: description.trim(),
      location: location.trim(),
      date: date || new Date().toISOString().slice(0, 10),
      userId,
      userName,
      contactMethod: contactMethod.trim(),
      status: 'open',
    });

    res.status(201).json(newItem);
  } catch (err: any) {
    console.error('Error creating Lost & Found post:', err);
    res.status(500).json({ error: 'Failed to save item', details: err.message });
  }
});

// Algorithmic matches between Lost and Found items
app.get('/api/lost-found/matches', (_req: Request, res: Response) => {
  const items = storage.getLostFound();
  const matches = findLostFoundMatches(items);
  res.json(matches);
});

// Campus Announcements
app.get('/api/announcements', (_req: Request, res: Response) => {
  res.json(storage.getAnnouncements());
});

// Dashboard Statistics (calculated strictly from actual stored data)
app.get('/api/dashboard/stats', (_req: Request, res: Response) => {
  const complaints = storage.getComplaints();

  const total = complaints.length;
  let open = 0;
  let inProgress = 0;
  let resolved = 0;
  let critical = 0;

  const categoryCounts: Record<string, number> = {};
  const priorityCounts: Record<string, number> = {};
  const statusCounts: Record<string, number> = {};

  for (const c of complaints) {
    // Status metrics
    if (c.status === 'Submitted' || c.status === 'Under Review' || c.status === 'Assigned') {
      open++;
    } else if (c.status === 'In Progress') {
      inProgress++;
    } else if (c.status === 'Resolved') {
      resolved++;
    }

    if (c.priority === 'Critical') {
      critical++;
    }

    // Counts
    categoryCounts[c.category] = (categoryCounts[c.category] || 0) + 1;
    priorityCounts[c.priority] = (priorityCounts[c.priority] || 0) + 1;
    statusCounts[c.status] = (statusCounts[c.status] || 0) + 1;
  }

  res.json({
    total,
    open,
    inProgress,
    resolved,
    critical,
    categoryCounts,
    priorityCounts,
    statusCounts,
    recentTickets: complaints.slice(0, 6),
  });
});

// Dev endpoint: Reset to sample seed data
app.post('/api/dev/reset-data', (_req: Request, res: Response) => {
  storage.resetData();
  res.json({ success: true, message: 'CampusConnect database reset to initial seed complaints' });
});

async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CampusConnect AI full-stack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start CampusConnect AI server:', err);
  process.exit(1);
});
