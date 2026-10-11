import fs from 'fs';
import path from 'path';
import { ComplaintTicket, LostFoundItem, CampusAnnouncement } from '../src/types.ts';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const COMPLAINTS_FILE = path.join(DATA_DIR, 'complaints.json');
const LOST_FOUND_FILE = path.join(DATA_DIR, 'lost_found.json');
const ANNOUNCEMENTS_FILE = path.join(DATA_DIR, 'announcements.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export const SEED_COMPLAINTS: ComplaintTicket[] = [
  {
    id: 'CC-2026-0001',
    userId: 'student-1',
    userName: 'Arjun Patel',
    userRoll: '22CS084',
    userContact: '+91 98765 43210',
    userHostelRoom: 'Hostel 3, Room 218',
    title: 'Severe water supply failure in Hostel 3 2nd Floor',
    rawDescription: 'The water supply in my hostel bathroom has not been working since early morning. Entire wing is facing zero running water in washrooms and geysers.',
    language: 'en-IN',
    summary: 'Complete water outage on 2nd floor washrooms of Hostel 3 impacting multiple students.',
    category: 'Plumbing',
    priority: 'High',
    department: 'Plumbing Division',
    location: 'Hostel 3, 2nd Floor Common Washroom',
    suggestedAction: 'Dispatch maintenance plumber to inspect overhead tank booster pump and main wing valve.',
    status: 'In Progress',
    statusTimeline: [
      {
        status: 'Submitted',
        timestamp: '2026-10-10T08:15:00.000Z',
        note: 'Complaint registered by student via Voice reporting',
        actor: 'Student (Arjun Patel)',
      },
      {
        status: 'Under Review',
        timestamp: '2026-10-10T08:45:00.000Z',
        note: 'Reviewed by Hostel Caretaker',
        actor: 'Admin (Hostel Warden Office)',
      },
      {
        status: 'Assigned',
        timestamp: '2026-10-10T09:10:00.000Z',
        note: 'Assigned to Estate Plumbing Team (Technician Ramesh K.)',
        actor: 'Admin (Estate Office)',
      },
      {
        status: 'In Progress',
        timestamp: '2026-10-10T10:30:00.000Z',
        note: 'Pump repair underway, motor capacitor replacement in progress',
        actor: 'Admin (Estate Office)',
      },
    ],
    internalNotes: 'Booster pump 2 tripping due to low line voltage; electrician dispatched.',
    isDemoSimulation: false,
    createdAt: '2026-10-10T08:15:00.000Z',
    updatedAt: '2026-10-10T10:30:00.000Z',
  },
  {
    id: 'CC-2026-0002',
    userId: 'student-2',
    userName: 'Priya Sharma',
    userRoll: '23EE019',
    userContact: '+91 98123 45678',
    userHostelRoom: 'Girls Hostel B, Room 104',
    title: 'Classroom Projector Malfunction in Lecture Hall 102',
    rawDescription: 'The ceiling projector in LH-102 flickers continuously with heavy pink and green distortion during CS301 lectures. Professor had to cancel slides.',
    language: 'en-IN',
    summary: 'Overhead projector display distortion and HDMI cable fault in Lecture Hall 102.',
    category: 'Academic',
    priority: 'Medium',
    department: 'Academic Facilities',
    location: 'Lecture Hall 102, Academic Block 1',
    suggestedAction: 'Replace high-speed HDMI transmitter cable and recalibrate projector color wheel.',
    status: 'Assigned',
    statusTimeline: [
      {
        status: 'Submitted',
        timestamp: '2026-10-09T14:20:00.000Z',
        note: 'Report submitted via text description',
        actor: 'Student (Priya Sharma)',
      },
      {
        status: 'Under Review',
        timestamp: '2026-10-09T15:00:00.000Z',
        note: 'Forwarded to AV Media Lab engineer',
        actor: 'Admin (Academic Office)',
      },
      {
        status: 'Assigned',
        timestamp: '2026-10-09T16:15:00.000Z',
        note: 'Scheduled for technician visit after evening lecture slot',
        actor: 'Admin (AV Team)',
      },
    ],
    internalNotes: 'Spare Epson projector lamp available in store 4.',
    isDemoSimulation: false,
    createdAt: '2026-10-09T14:20:00.000Z',
    updatedAt: '2026-10-09T16:15:00.000Z',
  },
  {
    id: 'CC-2026-0003',
    userId: 'student-1',
    userName: 'Arjun Patel',
    userRoll: '22CS084',
    userContact: '+91 98765 43210',
    userHostelRoom: 'Hostel 3, Room 218',
    title: 'Electrical Sparking & Loose Switchboard in Room 218',
    rawDescription: 'Our room main ceiling fan switchboard emits loud sparking sounds and burning plastic smell whenever turned on. Hazardous fire risk.',
    language: 'en-IN',
    summary: 'Hazardous electrical switchboard sparking and burnt insulation in student room 218.',
    category: 'Electrical',
    priority: 'Critical',
    department: 'Electrical Division',
    location: 'Hostel 3, Room 218',
    suggestedAction: 'Emergency inspection and immediate breaker isolator tripping; replace modular switchboard.',
    status: 'Resolved',
    statusTimeline: [
      {
        status: 'Submitted',
        timestamp: '2026-10-08T09:00:00.000Z',
        note: 'Critical report submitted with high urgency flag',
        actor: 'Student (Arjun Patel)',
      },
      {
        status: 'Under Review',
        timestamp: '2026-10-08T09:05:00.000Z',
        note: 'Immediate safety priority acknowledged by Warden desk',
        actor: 'Admin (Estate Office)',
      },
      {
        status: 'In Progress',
        timestamp: '2026-10-08T09:30:00.000Z',
        note: 'Electrician on site with replacement Anchor modular switch unit',
        actor: 'Admin (Electrical Team)',
      },
      {
        status: 'Resolved',
        timestamp: '2026-10-08T11:00:00.000Z',
        note: 'Burnt terminal replaced, load tested, student confirmed safe operation.',
        actor: 'Admin (Electrical Division)',
      },
    ],
    resolutionNotes: 'Replaced 16A modular socket, cleaned burnt copper wire ends and re-earthed the junction box.',
    isDemoSimulation: false,
    createdAt: '2026-10-08T09:00:00.000Z',
    updatedAt: '2026-10-08T11:00:00.000Z',
  },
  {
    id: 'CC-2026-0004',
    userId: 'student-3',
    userName: 'Kavya Reddy',
    userRoll: '21ME045',
    userContact: '+91 97654 32109',
    userHostelRoom: 'Girls Hostel A, Room 310',
    title: 'Wi-Fi Access Point DNS Drop in Central Library 3rd Floor',
    rawDescription: 'Library reading hall on 3rd floor Wi-Fi connects but displays "No Internet Access / DNS failure". Affects 40+ students preparing for research submissions.',
    language: 'te-IN',
    summary: 'Central Library third floor Wi-Fi access point failing DNS routing and captive portal login.',
    category: 'Internet',
    priority: 'Medium',
    department: 'Campus IT & Wi-Fi',
    location: 'Central Library, 3rd Floor North Wing',
    suggestedAction: 'Reboot Cisco AP-304 and verify DHCP pool lease exhaustion on subnet 10.20.4.0/24.',
    status: 'Under Review',
    statusTimeline: [
      {
        status: 'Submitted',
        timestamp: '2026-10-10T11:45:00.000Z',
        note: 'Voice report transcribed in Telugu & analyzed',
        actor: 'Student (Kavya Reddy)',
      },
      {
        status: 'Under Review',
        timestamp: '2026-10-10T12:00:00.000Z',
        note: 'IT Helpdesk reviewing radius server authentication logs',
        actor: 'Admin (IT Center)',
      },
    ],
    isDemoSimulation: false,
    createdAt: '2026-10-10T11:45:00.000Z',
    updatedAt: '2026-10-10T12:00:00.000Z',
  },
  {
    id: 'CC-2026-0005',
    userId: 'student-2',
    userName: 'Priya Sharma',
    userRoll: '23EE019',
    userContact: '+91 98123 45678',
    userHostelRoom: 'Girls Hostel B, Room 104',
    title: 'Lost RFID College ID Card near Central Cafeteria',
    rawDescription: 'I lost my college ID card (Roll: 23EE019) with a blue university lanyard somewhere around the cafeteria outdoor seating between 1:00 PM and 2:00 PM.',
    language: 'en-IN',
    summary: 'Lost student smart ID card with blue lanyard in cafeteria premises.',
    category: 'Lost and Found',
    priority: 'Low',
    department: 'Campus Security',
    location: 'Central Cafeteria Outdoor Seating Area',
    suggestedAction: 'Check Cafeteria lost-and-found registry and security guard reception box.',
    status: 'Submitted',
    statusTimeline: [
      {
        status: 'Submitted',
        timestamp: '2026-10-10T15:10:00.000Z',
        note: 'Ticket registered. Item logged in Lost & Found database.',
        actor: 'Student (Priya Sharma)',
      },
    ],
    isDemoSimulation: false,
    createdAt: '2026-10-10T15:10:00.000Z',
    updatedAt: '2026-10-10T15:10:00.000Z',
  },
];

export const SEED_LOST_FOUND: LostFoundItem[] = [
  {
    id: 'LF-2026-0001',
    type: 'lost',
    title: 'College RFID Smart ID Card (Roll: 23EE019)',
    category: 'ID Cards & Wallets',
    description: 'Blue institute lanyard with student ID card of Priya Sharma, Department of Electrical Engineering.',
    location: 'Central Cafeteria Outdoor Lawn',
    date: '2026-10-10',
    userId: 'student-2',
    userName: 'Priya Sharma',
    contactMethod: 'Campus Security Office / Portal Claim',
    status: 'open',
    createdAt: '2026-10-10T15:15:00.000Z',
  },
  {
    id: 'LF-2026-0002',
    type: 'found',
    title: 'Student ID Card with Navy Blue Institute Lanyard',
    category: 'ID Cards & Wallets',
    description: 'Found a plastic RFID student card under wooden bench near cafeteria juice stall.',
    location: 'Central Cafeteria Juice Stall',
    date: '2026-10-10',
    userId: 'student-4',
    userName: 'Rohan Verma',
    contactMethod: 'Handed over to Cafeteria Manager Counter',
    status: 'open',
    createdAt: '2026-10-10T16:00:00.000Z',
  },
  {
    id: 'LF-2026-0003',
    type: 'lost',
    title: 'Titan Black Leather Strap Analog Watch',
    category: 'Accessories',
    description: 'Black round dial Titan watch with slight scratch on 3 o clock mark, black leather strap.',
    location: 'Sports Complex / Basketball Court Bleachers',
    date: '2026-10-09',
    userId: 'student-1',
    userName: 'Arjun Patel',
    contactMethod: 'Hostel 3 Room 218 or Portal Claim',
    status: 'open',
    createdAt: '2026-10-09T18:30:00.000Z',
  },
  {
    id: 'LF-2026-0004',
    type: 'found',
    title: 'Titan Men Wristwatch with Leather Band',
    category: 'Accessories',
    description: 'Found black dial wrist watch left on sports complex pavilion third tier row.',
    location: 'Basketball Court Pavilion',
    date: '2026-10-09',
    userId: 'admin-1',
    userName: 'Sports Officer Desk',
    contactMethod: 'Gymnasium Equipment Room',
    status: 'open',
    createdAt: '2026-10-09T19:00:00.000Z',
  },
  {
    id: 'LF-2026-0005',
    type: 'lost',
    title: 'Dell 65W Type-C Laptop Power Adapter',
    category: 'Electronics',
    description: 'Black Dell genuine USB-C charger with yellow sticker label on the brick adapter.',
    location: 'Central Library 2nd Floor Study Cubicle 14',
    date: '2026-10-08',
    userId: 'student-3',
    userName: 'Kavya Reddy',
    contactMethod: 'Portal Claim',
    status: 'open',
    createdAt: '2026-10-08T17:00:00.000Z',
  },
];

export const SEED_ANNOUNCEMENTS: CampusAnnouncement[] = [
  {
    id: 'ANN-01',
    title: 'Scheduled Electrical Substation Maintenance - Oct 12',
    content: 'Power shutdown will occur in Academic Blocks 1 & 2 on Saturday between 09:00 AM and 01:00 PM for transformer servicing.',
    category: 'Maintenance',
    department: 'Electrical Division',
    date: '2026-10-11',
    active: true,
  },
  {
    id: 'ANN-02',
    title: 'Hostel 2 & 3 Overhead Water Tank Disinfection',
    content: 'Deep cleaning and UV treatment of water reservoirs scheduled for Sunday morning. Stored auxiliary water will be available.',
    category: 'Maintenance',
    department: 'Plumbing & Sanitation',
    date: '2026-10-10',
    active: true,
  },
  {
    id: 'ANN-03',
    title: 'Wi-Fi Core Switch Upgrade Completed in Central Library',
    content: 'High-speed 10Gbps uplink switch migration has been executed. Please reconnect devices to "Campus-Secure-5G".',
    category: 'Urgent',
    department: 'Campus IT',
    date: '2026-10-09',
    active: true,
  },
];

export class StorageService {
  constructor() {
    ensureDataDir();
    this.init();
  }

  private init() {
    if (!fs.existsSync(COMPLAINTS_FILE)) {
      this.writeComplaints(SEED_COMPLAINTS);
    }
    if (!fs.existsSync(LOST_FOUND_FILE)) {
      this.writeLostFound(SEED_LOST_FOUND);
    }
    if (!fs.existsSync(ANNOUNCEMENTS_FILE)) {
      this.writeAnnouncements(SEED_ANNOUNCEMENTS);
    }
  }

  public getComplaints(): ComplaintTicket[] {
    try {
      ensureDataDir();
      if (!fs.existsSync(COMPLAINTS_FILE)) return [...SEED_COMPLAINTS];
      const data = fs.readFileSync(COMPLAINTS_FILE, 'utf-8');
      return JSON.parse(data);
    } catch {
      return [...SEED_COMPLAINTS];
    }
  }

  public writeComplaints(complaints: ComplaintTicket[]) {
    ensureDataDir();
    fs.writeFileSync(COMPLAINTS_FILE, JSON.stringify(complaints, null, 2), 'utf-8');
  }

  public getComplaintById(id: string): ComplaintTicket | undefined {
    return this.getComplaints().find((c) => c.id.toLowerCase() === id.toLowerCase());
  }

  public createComplaint(complaint: Omit<ComplaintTicket, 'id' | 'createdAt' | 'updatedAt' | 'statusTimeline'>): ComplaintTicket {
    const list = this.getComplaints();
    const nextNum = list.length + 1;
    const ticketId = `CC-2026-${String(nextNum).padStart(4, '0')}`;
    const now = new Date().toISOString();

    const newTicket: ComplaintTicket = {
      ...complaint,
      id: ticketId,
      createdAt: now,
      updatedAt: now,
      statusTimeline: [
        {
          status: 'Submitted',
          timestamp: now,
          note: 'Ticket registered by student',
          actor: `${complaint.userName} (${complaint.userRoll || 'Student'})`,
        },
      ],
    };

    list.unshift(newTicket);
    this.writeComplaints(list);
    return newTicket;
  }

  public updateComplaintStatus(
    id: string,
    status: ComplaintTicket['status'],
    note?: string,
    actor: string = 'Campus Administrator',
    department?: string,
    internalNotes?: string,
    resolutionNotes?: string
  ): ComplaintTicket | null {
    const list = this.getComplaints();
    const index = list.findIndex((c) => c.id.toLowerCase() === id.toLowerCase());
    if (index === -1) return null;

    const item = list[index];
    const now = new Date().toISOString();

    item.status = status;
    item.updatedAt = now;
    if (department) item.department = department;
    if (internalNotes !== undefined) item.internalNotes = internalNotes;
    if (resolutionNotes !== undefined) item.resolutionNotes = resolutionNotes;

    item.statusTimeline.push({
      status,
      timestamp: now,
      note: note || `Status updated to ${status}`,
      actor,
    });

    this.writeComplaints(list);
    return item;
  }

  public addComplaintRemark(id: string, remark: string, actor: string): ComplaintTicket | null {
    const list = this.getComplaints();
    const index = list.findIndex((c) => c.id.toLowerCase() === id.toLowerCase());
    if (index === -1) return null;

    const item = list[index];
    const now = new Date().toISOString();
    item.updatedAt = now;
    item.statusTimeline.push({
      status: item.status,
      timestamp: now,
      note: remark,
      actor,
    });

    this.writeComplaints(list);
    return item;
  }

  public getLostFound(): LostFoundItem[] {
    try {
      ensureDataDir();
      if (!fs.existsSync(LOST_FOUND_FILE)) return [...SEED_LOST_FOUND];
      const data = fs.readFileSync(LOST_FOUND_FILE, 'utf-8');
      return JSON.parse(data);
    } catch {
      return [...SEED_LOST_FOUND];
    }
  }

  public writeLostFound(items: LostFoundItem[]) {
    ensureDataDir();
    fs.writeFileSync(LOST_FOUND_FILE, JSON.stringify(items, null, 2), 'utf-8');
  }

  public createLostFound(item: Omit<LostFoundItem, 'id' | 'createdAt'>): LostFoundItem {
    const list = this.getLostFound();
    const nextNum = list.length + 1;
    const id = `LF-2026-${String(nextNum).padStart(4, '0')}`;
    const now = new Date().toISOString();

    const newItem: LostFoundItem = {
      ...item,
      id,
      createdAt: now,
    };

    list.unshift(newItem);
    this.writeLostFound(list);
    return newItem;
  }

  public getAnnouncements(): CampusAnnouncement[] {
    try {
      ensureDataDir();
      if (!fs.existsSync(ANNOUNCEMENTS_FILE)) return [...SEED_ANNOUNCEMENTS];
      const data = fs.readFileSync(ANNOUNCEMENTS_FILE, 'utf-8');
      return JSON.parse(data);
    } catch {
      return [...SEED_ANNOUNCEMENTS];
    }
  }

  public writeAnnouncements(announcements: CampusAnnouncement[]) {
    ensureDataDir();
    fs.writeFileSync(ANNOUNCEMENTS_FILE, JSON.stringify(announcements, null, 2), 'utf-8');
  }

  public resetData() {
    this.writeComplaints(SEED_COMPLAINTS);
    this.writeLostFound(SEED_LOST_FOUND);
    this.writeAnnouncements(SEED_ANNOUNCEMENTS);
  }
}

export const storage = new StorageService();
