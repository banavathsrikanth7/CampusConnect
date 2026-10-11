import { ComplaintAnalysisResult, ComplaintCategory, ComplaintPriority } from '../src/types.ts';

export const VALID_CATEGORIES: ComplaintCategory[] = [
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
];

export const VALID_PRIORITIES: ComplaintPriority[] = ['Low', 'Medium', 'High', 'Critical'];

export const SUPPORTED_LANGUAGES = [
  { code: 'en-IN', sarvamCode: 'en-IN', label: 'English (India)', nativeLabel: 'English', voiceSupported: true },
  { code: 'hi-IN', sarvamCode: 'hi-IN', label: 'Hindi', nativeLabel: 'हिन्दी', voiceSupported: true },
  { code: 'te-IN', sarvamCode: 'te-IN', label: 'Telugu', nativeLabel: 'తెలుగు', voiceSupported: true },
  { code: 'ta-IN', sarvamCode: 'ta-IN', label: 'Tamil', nativeLabel: 'தமிழ்', voiceSupported: true },
  { code: 'kn-IN', sarvamCode: 'kn-IN', label: 'Kannada', nativeLabel: 'ಕನ್ನಡ', voiceSupported: true },
  { code: 'mr-IN', sarvamCode: 'mr-IN', label: 'Marathi', nativeLabel: 'मराठी', voiceSupported: true },
  { code: 'bn-IN', sarvamCode: 'bn-IN', label: 'Bengali', nativeLabel: 'বাংলা', voiceSupported: true },
  { code: 'gu-IN', sarvamCode: 'gu-IN', label: 'Gujarati', nativeLabel: 'ગુજરાતી', voiceSupported: true },
];

export function getSarvamApiKey(): string | null {
  const key = process.env.SARVAM_API_KEY;
  if (!key || key.trim() === '' || key.includes('your_sarvam_api_key_here')) {
    return null;
  }
  return key.trim();
}

/**
 * Intelligent rule-based complaint analyzer used when SARVAM_API_KEY is not configured
 * or for offline development simulation. Clearly labeled in output.
 */
export function analyzeWithRuleEngine(text: string, language: string = 'en-IN'): ComplaintAnalysisResult {
  const lower = text.toLowerCase();

  let category: ComplaintCategory = 'Other';
  let department = 'Estate Office';
  let priority: ComplaintPriority = 'Medium';
  let suggestedAction = 'Review complaint and dispatch relevant maintenance personnel.';

  // Check category heuristics
  if (
    lower.includes('spark') ||
    lower.includes('electric') ||
    lower.includes('fan') ||
    lower.includes('switch') ||
    lower.includes('light') ||
    lower.includes('wire') ||
    lower.includes('shock') ||
    lower.includes('power cut') ||
    lower.includes('fuse') ||
    lower.includes('करंट') ||
    lower.includes('बिजली') ||
    lower.includes('విద్యుత్')
  ) {
    category = 'Electrical';
    department = 'Electrical Division';
    suggestedAction = 'Inspect switchboard, test line voltage, replace damaged circuit breaker or fixture.';
    if (lower.includes('spark') || lower.includes('shock') || lower.includes('fire') || lower.includes('smoke')) {
      priority = 'Critical';
    } else {
      priority = 'High';
    }
  } else if (
    lower.includes('water') ||
    lower.includes('tap') ||
    lower.includes('leak') ||
    lower.includes('pipe') ||
    lower.includes('drain') ||
    lower.includes('flush') ||
    lower.includes('bathroom') ||
    lower.includes('washroom') ||
    lower.includes('पानी') ||
    lower.includes('नल') ||
    lower.includes('నీరు')
  ) {
    category = 'Plumbing';
    department = 'Plumbing Division';
    suggestedAction = 'Check overhead tank motor, repair pipeline leakage or replace faulty valve cartridge.';
    priority = lower.includes('no water') || lower.includes('zero') || lower.includes('overflow') ? 'High' : 'Medium';
  } else if (
    lower.includes('wifi') ||
    lower.includes('wi-fi') ||
    lower.includes('internet') ||
    lower.includes('router') ||
    lower.includes('dns') ||
    lower.includes('network') ||
    lower.includes('ethernet') ||
    lower.includes('lan') ||
    lower.includes('speed')
  ) {
    category = 'Internet';
    department = 'Campus IT & Wi-Fi';
    suggestedAction = 'Reboot local access point switch port, verify DHCP leases and backbone fiber link.';
    priority = 'Medium';
  } else if (
    lower.includes('projector') ||
    lower.includes('lecture') ||
    lower.includes('classroom') ||
    lower.includes('bench') ||
    lower.includes('mic') ||
    lower.includes('podium') ||
    lower.includes('board') ||
    lower.includes('lab')
  ) {
    category = 'Academic';
    department = 'Academic Facilities';
    suggestedAction = 'Calibrate AV media equipment and inspect cabling in the scheduled classroom.';
    priority = 'Medium';
  } else if (
    lower.includes('lost') ||
    lower.includes('found') ||
    lower.includes('wallet') ||
    lower.includes('id card') ||
    lower.includes('keys') ||
    lower.includes('bag') ||
    lower.includes('watch') ||
    lower.includes('खो गया') ||
    lower.includes('దొరికింది')
  ) {
    category = 'Lost and Found';
    department = 'Campus Security';
    suggestedAction = 'Log description in central Lost & Found register and check security desk custody box.';
    priority = 'Low';
  } else if (
    lower.includes('garbage') ||
    lower.includes('dirty') ||
    lower.includes('clean') ||
    lower.includes('trash') ||
    lower.includes('dustbin') ||
    lower.includes('smell') ||
    lower.includes('कचरा') ||
    lower.includes('सफाई')
  ) {
    category = 'Cleaning';
    department = 'Sanitation & Hygiene';
    suggestedAction = 'Schedule immediate custodial sweep and sanitize the affected campus area.';
    priority = 'Medium';
  } else if (
    lower.includes('hostel') ||
    lower.includes('room') ||
    lower.includes('mess') ||
    lower.includes('bed') ||
    lower.includes('warden') ||
    lower.includes('cupboard') ||
    lower.includes('door lock')
  ) {
    category = 'Hostel';
    department = 'Hostel Maintenance';
    suggestedAction = 'Inform hostel supervisor and assign duty carpenter or maintenance contractor.';
    priority = 'Medium';
  } else if (
    lower.includes('bus') ||
    lower.includes('shuttle') ||
    lower.includes('parking') ||
    lower.includes('vehicle') ||
    lower.includes('transport')
  ) {
    category = 'Transport';
    department = 'Transport & Logistics';
    suggestedAction = 'Coordinate with campus fleet supervisor to inspect vehicle or regulate parking.';
    priority = 'Low';
  } else if (
    lower.includes('theft') ||
    lower.includes('guard') ||
    lower.includes('gate') ||
    lower.includes('intruder') ||
    lower.includes('security')
  ) {
    category = 'Security';
    department = 'Campus Security';
    suggestedAction = 'Alert campus security control room and review CCTV footage of specified zone.';
    priority = 'High';
  }

  // Location extraction heuristic
  let extractedLocation = 'Campus Premises';
  const locationMatches = text.match(/(hostel\s+\w+|room\s+\d+|block\s+\w+|lecture\s+hall\s+\w+|lh-?\d+|library|cafeteria|mess|ground|floor\s+\d+)/i);
  if (locationMatches && locationMatches[0]) {
    extractedLocation = locationMatches[0].trim();
  }

  // Title generation
  const words = text.split(/\s+/).slice(0, 7).join(' ');
  const title = words.length > 5 ? words.charAt(0).toUpperCase() + words.slice(1) : `${category} issue reported`;

  return {
    title,
    summary: text.length > 150 ? text.slice(0, 147) + '...' : text,
    category,
    priority,
    department,
    location: extractedLocation,
    suggestedAction,
    isDemoSimulation: true,
    provider: 'Rule-Based Fallback Engine (SARVAM_API_KEY not set)',
    detectedLanguage: language,
  };
}

/**
 * Call Sarvam AI Chat Completions API
 */
export async function analyzeWithSarvamAI(text: string, language: string = 'en-IN'): Promise<ComplaintAnalysisResult> {
  const apiKey = getSarvamApiKey();
  if (!apiKey) {
    return analyzeWithRuleEngine(text, language);
  }

  const systemPrompt = `You are the AI triage assistant for CampusConnect AI, a college problem reporting system.
Given a student complaint (which may be in English, Hindi, Telugu, or another Indian language):
Analyze the problem and produce a valid JSON object with EXACTLY these keys:
{
  "title": "Short concise title (max 8 words, English)",
  "summary": "Concise summary in English explaining the exact problem (1-2 sentences)",
  "category": "One of: Electrical, Plumbing, Hostel, Cleaning, Internet, Security, Lost and Found, Academic, Transport, Other",
  "priority": "One of: Low, Medium, High, Critical",
  "department": "One of: Hostel Maintenance, Electrical Division, Plumbing Division, Campus IT & Wi-Fi, Sanitation & Hygiene, Campus Security, Academic Facilities, Transport & Logistics, Estate Office",
  "location": "Specific location mentioned in the text (or 'Campus Premises' if not mentioned)",
  "suggestedAction": "Recommended technical or operational next step"
}

Important:
- Return ONLY valid JSON, no markdown formatting, no backticks, no commentary.
- If there is an imminent fire or electrical hazard, priority must be 'Critical'.
- If essential services (water outage, major power failure) are down, priority must be 'High'.
- Keep categories and priorities strictly within the allowed options.`;

  try {
    const response = await fetch('https://api.sarvam.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-subscription-key': apiKey,
      },
      body: JSON.stringify({
        model: 'sarvam-105b-conversations',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Complaint text (Language: ${language}):\n"""${text}"""` },
        ],
        temperature: 0.2,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.warn(`Sarvam Chat Completion returned HTTP ${response.status}:`, errText);
      // Fallback gracefully without fabricating
      const fallback = analyzeWithRuleEngine(text, language);
      fallback.provider = `Rule-Based Fallback (Sarvam API returned HTTP ${response.status})`;
      return fallback;
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content?.trim();
    if (!content) {
      throw new Error('Empty content from Sarvam AI');
    }

    // Clean JSON markdown if wrapped in ```json ... ```
    const cleanedJson = content.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
    const parsed = JSON.parse(cleanedJson);

    // Validate category
    let validCat: ComplaintCategory = 'Other';
    if (VALID_CATEGORIES.includes(parsed.category)) {
      validCat = parsed.category;
    }

    // Validate priority
    let validPri: ComplaintPriority = 'Medium';
    if (VALID_PRIORITIES.includes(parsed.priority)) {
      validPri = parsed.priority;
    }

    return {
      title: parsed.title || 'Reported Campus Issue',
      summary: parsed.summary || text.slice(0, 100),
      category: validCat,
      priority: validPri,
      department: parsed.department || 'Estate Office',
      location: parsed.location || 'Campus Premises',
      suggestedAction: parsed.suggestedAction || 'Investigate and take necessary remedial action.',
      isDemoSimulation: false,
      provider: 'Sarvam AI (sarvam-105b-conversations)',
      detectedLanguage: language,
    };
  } catch (error) {
    console.error('Sarvam AI analysis error:', error);
    const fallback = analyzeWithRuleEngine(text, language);
    fallback.provider = 'Rule-Based Fallback (Sarvam processing error)';
    return fallback;
  }
}

/**
 * Transcribe Audio using Sarvam Saaras Speech-to-Text API
 */
export async function transcribeWithSarvamSTT(
  audioBase64: string,
  mimeType: string = 'audio/webm',
  languageCode: string = 'en-IN'
): Promise<{ transcript: string; languageCode: string; provider: string; isDemoSimulation?: boolean }> {
  const apiKey = getSarvamApiKey();

  if (!apiKey) {
    return {
      transcript: '',
      languageCode,
      provider: 'SARVAM_API_KEY is not configured in environment',
      isDemoSimulation: true,
    };
  }

  try {
    // Decode base64 to buffer
    const buffer = Buffer.from(audioBase64, 'base64');
    const extension = mimeType.includes('mp4') ? 'm4a' : mimeType.includes('wav') ? 'wav' : 'webm';
    const blob = new Blob([buffer], { type: mimeType });

    const formData = new FormData();
    formData.append('file', blob, `student_voice.${extension}`);
    formData.append('model', 'saaras:v2');
    if (languageCode && languageCode !== 'auto') {
      formData.append('language_code', languageCode);
    }

    const response = await fetch('https://api.sarvam.ai/speech-to-text', {
      method: 'POST',
      headers: {
        'api-subscription-key': apiKey,
      },
      body: formData,
    });

    if (!response.ok) {
      const errText = await response.text();
      console.warn(`Sarvam STT returned HTTP ${response.status}:`, errText);
      throw new Error(`Sarvam STT error: HTTP ${response.status} - ${errText}`);
    }

    const result = await response.json();
    return {
      transcript: result.transcript || '',
      languageCode: result.language_code || languageCode,
      provider: 'Sarvam Saaras STT (saaras:v2)',
      isDemoSimulation: false,
    };
  } catch (err: any) {
    console.error('Sarvam STT request failed:', err.message);
    throw err;
  }
}
