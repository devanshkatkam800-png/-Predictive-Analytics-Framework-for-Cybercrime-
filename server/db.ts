import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

export interface UserEntity {
  userId: string;
  name: string;
  email: string;
  phone?: string;
  passwordHash: string;
  role: 'officer' | 'admin';
  organization: string;
  badgeNumber?: string;
  createdAt: string;
}

export interface ComplaintEntity {
  complaintId: string;
  fraudType: string;
  amountLost: number;
  victimCity: string;
  victimState: string;
  transactionDate: string;
  transactionTime: string;
  bankName: string;
  accountNumber: string;
  upiId: string;
  transactionId: string;
  complaintDescription: string;
  status:
    | 'New'
    | 'Under Review'
    | 'Prediction Generated'
    | 'Officer Assigned'
    | 'Investigation Started'
    | 'Bank Freeze Requested'
    | 'Recovery In Progress'
    | 'Case Closed'
    | 'Received'
    | 'Analyzed'
    | 'Under Investigation'
    | 'Patrol Dispatched'
    | 'Resolved'
    | 'Submitted'
    | 'Under Verification'
    | 'Bank Freeze Sent'
    | 'Recovery Processing';
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  officerId?: string;
  officerName?: string;
  victimId?: string;
  victimName?: string;
  victimMobile?: string;
  victimEmail?: string;
  victimAddress?: string;
  assignedOfficer?: {
    id: string;
    name: string;
    designation: string;
    organization: string;
    contact?: string;
    badgeNumber?: string;
    assignedAt?: string;
  };
  amountFrozen?: number;
  amountRecovered?: number;
  timeline?: ComplaintTimelineStage[];
  recoveryStatus?: RecoveryStatusEntity;
  createdAt: string;
  updatedAt?: string;
  notes: Array<{
    id: string;
    author: string;
    role: string;
    text: string;
    timestamp: string;
  }>;
  predictionId?: string;
}

export interface ComplaintAssignmentEntity {
  assignmentId: string;
  complaintId: string;
  officerId: string;
  officerName: string;
  designation?: string;
  organization?: string;
  badgeNumber?: string;
  assignedBy: string;
  assignedAt: string;
  instructions?: string;
}

export interface PredictedZone {
  zoneId: string;
  zoneName: string;
  city: string;
  state: string;
  probability: number; // e.g. 87 for 87%
  riskLevel: 'High' | 'Medium' | 'Low';
  lat: number;
  lng: number;
  clusterRadiusMeters: number;
  linkedHistoricalCasesCount: number;
  linkedHistoricalCases: Array<{
    caseId: string;
    fraudType: string;
    amount: number;
    bank: string;
    withdrawalLocation: string;
    date: string;
  }>;
  atmCount: number;
  representativeAtm: string;
  estimatedTimeframe: string;
  aiExplanation: string;
}

export interface ExplainableFactor {
  title: string;
  count?: number;
  matchType: 'fraud_type' | 'bank' | 'amount' | 'timing' | 'geography' | 'cluster';
  description: string;
  verified: boolean;
}

export interface PredictionEntity {
  predictionId: string;
  complaintId: string;
  riskScore: number; // 0 - 100
  confidenceScore: number; // 0 - 100
  riskLevel: 'High' | 'Medium' | 'Low';
  priorityLevel?: 'Critical' | 'High' | 'Medium' | 'Low';
  topPredictedZones: PredictedZone[];
  scamClassification: string;
  patternAnalysis: string;
  riskExplanation: string;
  investigationRecommendations: string[];
  aiAnalysisText: string;
  explainableFactors?: ExplainableFactor[];
  generatedAt: string;
}

export interface HistoricalCaseEntity {
  caseId: string;
  fraudType: string;
  amount: number;
  victimLocation: {
    city: string;
    state: string;
    lat: number;
    lng: number;
  };
  withdrawalLocation: {
    name: string;
    city: string;
    state: string;
    lat: number;
    lng: number;
    cluster: string;
  };
  timestamp: string;
  bank: string;
  notes?: string;
}

export interface ReportEntity {
  reportId: string;
  complaintId: string;
  title: string;
  reportSummary: string;
  riskScore: number;
  riskLevel: 'High' | 'Medium' | 'Low';
  confidenceScore: number;
  scamClassification: string;
  patternAnalysis: string;
  topPredictedZones: PredictedZone[];
  investigationRecommendations: string[];
  generatedAt: string;
  generatedBy: string;
  officerOrganization: string;
}

export interface ActivityLogEntity {
  logId: string;
  userId: string;
  userName: string;
  userRole: 'officer' | 'admin';
  action: string;
  details: string;
  ipAddress: string;
  timestamp: string;
}

export interface NotificationEntity {
  id: string;
  userId?: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'alert' | 'success';
  read: boolean;
  createdAt: string;
  complaintId?: string;
}

// -------------------------------------------------------------------
// VICTIM & CITIZEN PORTAL ENTITIES
// -------------------------------------------------------------------

export interface VictimEntity {
  victimId: string;
  name: string;
  mobile: string;
  email: string;
  passwordHash: string;
  aadhaar?: string;
  address: string;
  city?: string;
  state?: string;
  registrationDate: string;
  otpCode?: string;
  otpExpiresAt?: string;
}

export interface ComplaintTimelineStage {
  stage: number; // 1 to 8
  title: string;
  date: string;
  time: string;
  status: 'completed' | 'current' | 'pending';
  assignedOfficer?: string;
  description: string;
}

export interface VictimComplaintEntity {
  complaintId: string;
  victimId: string;
  victimName: string;
  victimMobile: string;
  fraudType: string;
  amountLost: number;
  bankName: string;
  accountNumber: string;
  upiId: string;
  transactionId: string;
  transactionDate: string;
  transactionTime: string;
  victimCity: string;
  victimState: string;
  complaintDescription: string;
  status:
    | 'Submitted'
    | 'Under Verification'
    | 'Prediction Generated'
    | 'Bank Freeze Sent'
    | 'Investigation Started'
    | 'Recovery Processing'
    | 'Case Closed';
  assignedOfficer?: {
    id: string;
    name: string;
    designation: string;
    organization: string;
    contact?: string;
  };
  timeline: ComplaintTimelineStage[];
  createdAt: string;
  updatedAt: string;
  predictionId?: string;
  amountFrozen?: number;
  amountRecovered?: number;
}

export interface VictimEvidenceEntity {
  evidenceId: string;
  complaintId: string;
  victimId: string;
  fileName: string;
  fileType: 'image' | 'pdf' | 'audio' | 'video' | string;
  fileSize: string;
  dataUrl?: string;
  description: string;
  uploadedAt: string;
}

export interface RecoveryLogEntry {
  date: string;
  time: string;
  stage: string;
  note: string;
  amount?: number;
  authority: string;
}

export interface RecoveryStatusEntity {
  recoveryId: string;
  complaintId: string;
  victimId: string;
  amountLost: number;
  amountFrozen: number;
  amountRecovered: number;
  recoveryPercentage: number;
  bankLienReference?: string;
  status: 'Pending' | 'Partial' | 'Recovered' | 'Transferred';
  timelineLogs: RecoveryLogEntry[];
  updatedAt: string;
}

export interface VictimNotificationEntity {
  id: string;
  victimId: string;
  complaintId?: string;
  title: string;
  message: string;
  type:
    | 'accepted'
    | 'officer_assigned'
    | 'freeze_sent'
    | 'prediction_ready'
    | 'investigation'
    | 'recovery'
    | 'closed'
    | 'info';
  read: boolean;
  createdAt: string;
}

interface DatabaseSchema {
  users: UserEntity[];
  complaints: ComplaintEntity[];
  predictions: PredictionEntity[];
  historicalCases: HistoricalCaseEntity[];
  reports: ReportEntity[];
  activityLogs: ActivityLogEntity[];
  notifications: NotificationEntity[];
  victims: VictimEntity[];
  victimComplaints: VictimComplaintEntity[];
  victimEvidence: VictimEvidenceEntity[];
  recoveryStatus: RecoveryStatusEntity[];
  victimNotifications: VictimNotificationEntity[];
  complaintAssignments: ComplaintAssignmentEntity[];
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

class DatabaseStore {
  private data: DatabaseSchema = {
    users: [],
    complaints: [],
    predictions: [],
    historicalCases: [],
    reports: [],
    activityLogs: [],
    notifications: [],
    victims: [],
    victimComplaints: [],
    victimEvidence: [],
    recoveryStatus: [],
    victimNotifications: [],
    complaintAssignments: []
  };

  constructor() {
    this.init();
  }

  private init() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        // Ensure historicalCases exists
        if (!parsed.historicalCases || !Array.isArray(parsed.historicalCases) || parsed.historicalCases.length === 0) {
          console.log('Database missing historicalCases or empty, seeding fresh data...');
          this.seedInitialData();
        } else {
          this.data = {
            users: parsed.users || [],
            complaints: parsed.complaints || [],
            predictions: parsed.predictions || [],
            historicalCases: parsed.historicalCases || [],
            reports: parsed.reports || [],
            activityLogs: parsed.activityLogs || [],
            notifications: parsed.notifications || [],
            victims: parsed.victims || [],
            victimComplaints: parsed.victimComplaints || [],
            victimEvidence: parsed.victimEvidence || [],
            recoveryStatus: parsed.recoveryStatus || [],
            victimNotifications: parsed.victimNotifications || [],
            complaintAssignments: parsed.complaintAssignments || []
          };

          // Ensure all victim complaints are synchronized into main complaints table
          if (this.data.victimComplaints && this.data.victimComplaints.length > 0) {
            this.data.victimComplaints.forEach((vc) => {
              const exists = this.data.complaints.some((c) => c.complaintId === vc.complaintId);
              if (!exists) {
                this.data.complaints.push({
                  complaintId: vc.complaintId,
                  victimId: vc.victimId,
                  victimName: vc.victimName,
                  victimMobile: vc.victimMobile,
                  fraudType: vc.fraudType,
                  amountLost: vc.amountLost,
                  victimCity: vc.victimCity,
                  victimState: vc.victimState,
                  transactionDate: vc.transactionDate,
                  transactionTime: vc.transactionTime,
                  bankName: vc.bankName,
                  accountNumber: vc.accountNumber,
                  upiId: vc.upiId,
                  transactionId: vc.transactionId,
                  complaintDescription: vc.complaintDescription,
                  status: vc.status as any,
                  priority: (vc as any).priority || 'High',
                  officerId: vc.assignedOfficer?.id || '',
                  officerName: vc.assignedOfficer?.name || '',
                  assignedOfficer: vc.assignedOfficer,
                  amountFrozen: vc.amountFrozen || 0,
                  amountRecovered: vc.amountRecovered || 0,
                  timeline: vc.timeline,
                  createdAt: vc.createdAt,
                  updatedAt: vc.updatedAt,
                  notes: [],
                  predictionId: vc.predictionId
                });
              }
            });
          }

          // If victim seed data not present, initialize it
          if (!this.data.victims || this.data.victims.length === 0) {
            this.seedVictimData();
          }

          console.log(`Database loaded successfully: ${this.data.complaints.length} complaints, ${this.data.victims.length} victims.`);
        }
      } catch (err) {
        console.error('Failed to parse existing db.json, generating seed data:', err);
        this.seedInitialData();
      }
    } else {
      this.seedInitialData();
    }
  }

  private persist() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to persist database to disk:', err);
    }
  }

  private seedInitialData() {
    const salt = bcrypt.genSaltSync(10);
    const officerPassword = bcrypt.hashSync('Officer@MHA2025', salt);
    const adminPassword = bcrypt.hashSync('Admin@MHA2025', salt);

    const users: UserEntity[] = [
      {
        userId: 'usr-off-001',
        name: 'Insp. Vikram Rathore',
        email: 'officer@mha.gov.in',
        phone: '+91 9412345678',
        passwordHash: officerPassword,
        role: 'officer',
        organization: 'Ministry of Home Affairs - I4C Cyber Crime Unit',
        badgeNumber: 'MHA-CYB-8841',
        createdAt: '2025-01-01T09:00:00.000Z'
      },
      {
        userId: 'usr-adm-001',
        name: 'Director Rajeshwar Rao',
        email: 'admin@mha.gov.in',
        phone: '+91 9998887776',
        passwordHash: adminPassword,
        role: 'admin',
        organization: 'Ministry of Home Affairs (MHA)',
        badgeNumber: 'MHA-DIR-001',
        createdAt: '2024-12-01T10:00:00.000Z'
      }
    ];

    const historicalCases: HistoricalCaseEntity[] = [
      {
        caseId: 'HIST-2024-001',
        fraudType: 'UPI Fraud',
        amount: 185000,
        victimLocation: { city: 'Mumbai', state: 'Maharashtra', lat: 19.0760, lng: 72.8777 },
        withdrawalLocation: {
          name: 'SBI E-Corner & ATM, Andheri East Station Road',
          city: 'Mumbai',
          state: 'Maharashtra',
          lat: 19.1197,
          lng: 72.8464,
          cluster: 'Andheri East Cluster'
        },
        timestamp: '2024-11-14T14:35:00.000Z',
        bank: 'State Bank of India',
        notes: 'Victim targeted via fake electricity bill link. Fraud funds transferred to 2 mule VPAs and withdrawn at Andheri East within 42 minutes.'
      },
      {
        caseId: 'HIST-2024-002',
        fraudType: 'UPI Fraud',
        amount: 240000,
        victimLocation: { city: 'Mumbai', state: 'Maharashtra', lat: 19.0760, lng: 72.8777 },
        withdrawalLocation: {
          name: 'HDFC Bank 24x7 ATM, Kurla West Station Plaza',
          city: 'Mumbai',
          state: 'Maharashtra',
          lat: 19.0657,
          lng: 72.8793,
          cluster: 'Kurla Cluster'
        },
        timestamp: '2024-11-20T17:15:00.000Z',
        bank: 'HDFC Bank',
        notes: 'Digital wallet KYC lure. Cash-out occurred at Kurla hub; mule captured on CCTV wearing helmet.'
      },
      {
        caseId: 'HIST-2024-003',
        fraudType: 'UPI Fraud',
        amount: 120000,
        victimLocation: { city: 'Navi Mumbai', state: 'Maharashtra', lat: 19.0330, lng: 73.0297 },
        withdrawalLocation: {
          name: 'Bank of Baroda ATM, Naupada Highway Corridor',
          city: 'Thane',
          state: 'Maharashtra',
          lat: 19.1860,
          lng: 72.9759,
          cluster: 'Thane West Cluster'
        },
        timestamp: '2024-12-02T11:40:00.000Z',
        bank: 'Bank of Baroda',
        notes: 'Remote desktop APK scam. Immediate withdrawal from Thane cash point.'
      },
      {
        caseId: 'HIST-2024-004',
        fraudType: 'ATM Cloning',
        amount: 95000,
        victimLocation: { city: 'Mumbai', state: 'Maharashtra', lat: 19.0760, lng: 72.8777 },
        withdrawalLocation: {
          name: 'Axis Bank ATM, Chakala Metro Station',
          city: 'Mumbai',
          state: 'Maharashtra',
          lat: 19.1114,
          lng: 72.8617,
          cluster: 'Andheri East Cluster'
        },
        timestamp: '2024-12-15T22:10:00.000Z',
        bank: 'Axis Bank',
        notes: 'Card skimmed at POS. Cloned magnetic card cash extraction at Chakala.'
      },
      {
        caseId: 'HIST-2024-005',
        fraudType: 'UPI Fraud',
        amount: 310000,
        victimLocation: { city: 'Pune', state: 'Maharashtra', lat: 18.5204, lng: 73.8567 },
        withdrawalLocation: {
          name: 'Punjab National Bank ATM, Kurla East Nehru Nagar',
          city: 'Mumbai',
          state: 'Maharashtra',
          lat: 19.0621,
          lng: 72.8885,
          cluster: 'Kurla Cluster'
        },
        timestamp: '2024-12-28T16:05:00.000Z',
        bank: 'Punjab National Bank',
        notes: 'Mule bank account originated in Kurla. Multiple successive card withdrawals of ₹10,000 each.'
      },
      {
        caseId: 'HIST-2024-006',
        fraudType: 'Phishing / OTP Bypass',
        amount: 150000,
        victimLocation: { city: 'Delhi', state: 'Delhi', lat: 28.6139, lng: 77.2090 },
        withdrawalLocation: {
          name: 'SBI Highway ATM, Tauru Chauraha',
          city: 'Nuh',
          state: 'Haryana',
          lat: 28.2144,
          lng: 76.9535,
          cluster: 'Mewat-Nuh Highway Corridor'
        },
        timestamp: '2025-01-05T13:20:00.000Z',
        bank: 'State Bank of India',
        notes: 'SIM swap & OTP phishing. Funds moved to Nuh cooperative account and cashed out at highway kiosk.'
      },
      {
        caseId: 'HIST-2024-007',
        fraudType: 'Fake Loan Extortion',
        amount: 80000,
        victimLocation: { city: 'Gurugram', state: 'Haryana', lat: 28.4595, lng: 77.0266 },
        withdrawalLocation: {
          name: 'PNB ATM, Punhana Bus Stand',
          city: 'Nuh',
          state: 'Haryana',
          lat: 27.8687,
          lng: 77.2045,
          cluster: 'Mewat-Nuh Highway Corridor'
        },
        timestamp: '2025-01-12T19:45:00.000Z',
        bank: 'Punjab National Bank',
        notes: 'Instant loan extortion app. Extracted money withdrawn by local runner on motorcycle.'
      },
      {
        caseId: 'HIST-2024-008',
        fraudType: 'Digital Arrest / Impersonation',
        amount: 850000,
        victimLocation: { city: 'Kolkata', state: 'West Bengal', lat: 22.5726, lng: 88.3639 },
        withdrawalLocation: {
          name: 'SBI Main Branch ATM, Jamtara Station Road',
          city: 'Jamtara',
          state: 'Jharkhand',
          lat: 23.9629,
          lng: 86.8016,
          cluster: 'Jamtara-Karmatar Belt'
        },
        timestamp: '2025-01-20T10:15:00.000Z',
        bank: 'State Bank of India',
        notes: 'Impersonation of Telecom Dept and CBI. Siphoned money distributed across 5 merchant POS and cash ATMs in Jamtara.'
      },
      {
        caseId: 'HIST-2024-009',
        fraudType: 'Investment Fraud',
        amount: 520000,
        victimLocation: { city: 'Surat', state: 'Gujarat', lat: 21.1702, lng: 72.8311 },
        withdrawalLocation: {
          name: 'ICICI Bank E-Lobby, Ring Road Textile Market',
          city: 'Surat',
          state: 'Gujarat',
          lat: 21.1895,
          lng: 72.8386,
          cluster: 'Surat Commercial Cluster'
        },
        timestamp: '2025-01-28T15:30:00.000Z',
        bank: 'ICICI Bank',
        notes: 'Fake crypto arbitrage platform. Cash withdrawals conducted during peak market hours.'
      },
      {
        caseId: 'HIST-2024-010',
        fraudType: 'UPI Fraud',
        amount: 175000,
        victimLocation: { city: 'Bengaluru', state: 'Karnataka', lat: 12.9716, lng: 77.5946 },
        withdrawalLocation: {
          name: 'Canara Bank ATM, Electronic City Phase 1',
          city: 'Bengaluru',
          state: 'Karnataka',
          lat: 12.8452,
          lng: 77.6602,
          cluster: 'Bengaluru South Transit Cluster'
        },
        timestamp: '2025-02-04T12:00:00.000Z',
        bank: 'Canara Bank',
        notes: 'QR code scan lure for flat rental advance. Immediate cash withdrawal near transit stop.'
      }
    ];

    const complaints: ComplaintEntity[] = [
      {
        complaintId: 'CC-2025-9011',
        fraudType: 'UPI Fraud',
        amountLost: 185000,
        victimCity: 'Mumbai',
        victimState: 'Maharashtra',
        transactionDate: '2025-05-18',
        transactionTime: '14:22',
        bankName: 'State Bank of India',
        accountNumber: '482910294819',
        upiId: 'victim.pay@oksbi',
        transactionId: 'TXN-9021849102',
        complaintDescription: 'Victim received an automated IVR call claiming electricity meter connection was scheduled for immediate disconnection. Fraudster guided installation of a screen-sharing APK and initiated 3 quick UPI transfers to a mule account.',
        status: 'Under Investigation',
        priority: 'High',
        officerId: 'usr-off-001',
        officerName: 'Insp. Vikram Rathore',
        createdAt: '2025-05-18T14:40:00.000Z',
        notes: [
          {
            id: 'n-1',
            author: 'Insp. Vikram Rathore',
            role: 'officer',
            text: 'Beneficiary account frozen via 1930 / I4C helpline. Predictive engine dispatched target alert to Andheri East & Kurla beat teams.',
            timestamp: '2025-05-18T14:55:00.000Z'
          }
        ],
        predictionId: 'pred-9011'
      },
      {
        complaintId: 'CC-2025-9012',
        fraudType: 'Digital Arrest / Impersonation',
        amountLost: 420000,
        victimCity: 'New Delhi',
        victimState: 'Delhi',
        transactionDate: '2025-05-19',
        transactionTime: '10:15',
        bankName: 'HDFC Bank',
        accountNumber: '50100481920194',
        upiId: 'victim.delhi@okhdfcbank',
        transactionId: 'TXN-8819203914',
        complaintDescription: 'Victim subjected to 8-hour digital arrest by perpetrators impersonating Mumbai Cyber Police and CBI. Forced to liquidate fixed deposits and RTGS ₹4,20,000 to "RBI verification account".',
        status: 'Patrol Dispatched',
        priority: 'Critical',
        officerId: 'usr-off-001',
        officerName: 'Insp. Vikram Rathore',
        createdAt: '2025-05-19T10:35:00.000Z',
        notes: [],
        predictionId: 'pred-9012'
      }
    ];

    const predictions: PredictionEntity[] = [
      {
        predictionId: 'pred-9011',
        complaintId: 'CC-2025-9011',
        riskScore: 88,
        confidenceScore: 84,
        riskLevel: 'High',
        scamClassification: 'High-Velocity Distributed UPI Layering (Mule Cash-Out)',
        patternAnalysis: 'Transaction timestamp (14:22) matches afternoon cash-out waves. Siphoned funds mapped to known mule accounts routed through Western Suburban railway transit hubs.',
        riskExplanation: 'Historical analysis reveals 4 prior cases with identical modus operandi where funds were withdrawn within 45 minutes across Andheri East and Kurla transit clusters.',
        investigationRecommendations: [
          'Direct local beat patrol to verify CCTV logs at SBI E-Lobbies in Andheri East and Kurla West.',
          'Issue Section 91 CrPC notice to beneficiary bank for immediate ATM withdrawal transaction freeze.',
          'Cross-match suspect phone IMEI with tower dumps along the Western and Central suburban corridors.',
          'Submit beneficiary VPA to National Cybercrime Reporting Portal (NCRP) mule blacklist.'
        ],
        aiAnalysisText: 'This complaint closely matches previous UPI fraud cases in Mumbai. Historical withdrawal activity was concentrated in Andheri East and Kurla clusters.',
        topPredictedZones: [
          {
            zoneId: 'zone-1',
            zoneName: 'Andheri East',
            city: 'Mumbai',
            state: 'Maharashtra',
            probability: 87,
            riskLevel: 'High',
            lat: 19.1197,
            lng: 72.8464,
            clusterRadiusMeters: 1200,
            linkedHistoricalCasesCount: 5,
            linkedHistoricalCases: [
              {
                caseId: 'HIST-2024-001',
                fraudType: 'UPI Fraud',
                amount: 185000,
                bank: 'State Bank of India',
                withdrawalLocation: 'SBI E-Corner & ATM, Andheri East Station Road',
                date: '2024-11-14'
              },
              {
                caseId: 'HIST-2024-004',
                fraudType: 'ATM Cloning',
                amount: 95000,
                bank: 'Axis Bank',
                withdrawalLocation: 'Axis Bank ATM, Chakala Metro Station',
                date: '2024-12-15'
              }
            ],
            atmCount: 14,
            representativeAtm: 'SBI E-Corner, Andheri East Station Road',
            estimatedTimeframe: 'Within 30 - 45 mins',
            aiExplanation: 'Primary cash-out nexus for Western Suburbs with rapid access to metro and railway transit for swift egress.'
          },
          {
            zoneId: 'zone-2',
            zoneName: 'Kurla West',
            city: 'Mumbai',
            state: 'Maharashtra',
            probability: 78,
            riskLevel: 'High',
            lat: 19.0657,
            lng: 72.8793,
            clusterRadiusMeters: 1500,
            linkedHistoricalCasesCount: 4,
            linkedHistoricalCases: [
              {
                caseId: 'HIST-2024-002',
                fraudType: 'UPI Fraud',
                amount: 240000,
                bank: 'HDFC Bank',
                withdrawalLocation: 'HDFC Bank 24x7 ATM, Kurla West Station Plaza',
                date: '2024-11-20'
              },
              {
                caseId: 'HIST-2024-005',
                fraudType: 'UPI Fraud',
                amount: 310000,
                bank: 'Punjab National Bank',
                withdrawalLocation: 'Punjab National Bank ATM, Kurla East Nehru Nagar',
                date: '2024-12-28'
              }
            ],
            atmCount: 11,
            representativeAtm: 'HDFC Bank ATM, Kurla West Station Plaza',
            estimatedTimeframe: 'Within 45 - 60 mins',
            aiExplanation: 'High-density commercial interchange with high transaction volume masking multiple successive ATM card extractions.'
          },
          {
            zoneId: 'zone-3',
            zoneName: 'Thane West',
            city: 'Thane',
            state: 'Maharashtra',
            probability: 66,
            riskLevel: 'Medium',
            lat: 19.1860,
            lng: 72.9759,
            clusterRadiusMeters: 1800,
            linkedHistoricalCasesCount: 3,
            linkedHistoricalCases: [
              {
                caseId: 'HIST-2024-003',
                fraudType: 'UPI Fraud',
                amount: 120000,
                bank: 'Bank of Baroda',
                withdrawalLocation: 'Bank of Baroda ATM, Naupada Highway Corridor',
                date: '2024-12-02'
              }
            ],
            atmCount: 9,
            representativeAtm: 'Bank of Baroda ATM, Naupada Highway Corridor',
            estimatedTimeframe: 'Within 60 - 90 mins',
            aiExplanation: 'Secondary peripheral withdrawal pocket along Eastern Express Highway with lower law enforcement surveillance density.'
          }
        ],
        generatedAt: '2025-05-18T14:42:00.000Z'
      }
    ];

    const reports: ReportEntity[] = [
      {
        reportId: 'REP-2025-401',
        complaintId: 'CC-2025-9011',
        title: 'MHA CYBERCRIME INTELLIGENCE REPORT: TACTICAL CASH-OUT WITHDRAWAL FORECAST',
        reportSummary: 'Tactical forecast compiled for incident CC-2025-9011 (₹1,85,000 loss). High probability withdrawal cluster identified in Mumbai Suburban Corridor with primary extraction vulnerability at Andheri East (87%) and Kurla (78%).',
        riskScore: 88,
        riskLevel: 'High',
        confidenceScore: 84,
        scamClassification: 'High-Velocity Distributed UPI Layering (Mule Cash-Out)',
        patternAnalysis: 'Transaction timestamp (14:22) matches afternoon cash-out waves. Siphoned funds mapped to known mule accounts routed through Western Suburban railway transit hubs.',
        topPredictedZones: predictions[0].topPredictedZones,
        investigationRecommendations: predictions[0].investigationRecommendations,
        generatedAt: '2025-05-18T15:00:00.000Z',
        generatedBy: 'Insp. Vikram Rathore',
        officerOrganization: 'Ministry of Home Affairs - I4C Cyber Crime Unit'
      }
    ];

    this.data = {
      users,
      complaints,
      predictions,
      historicalCases,
      reports,
      activityLogs: [
        {
          logId: 'log-1',
          userId: 'usr-off-001',
          userName: 'Insp. Vikram Rathore',
          userRole: 'officer',
          action: 'PLATFORM_INITIALIZED',
          details: 'Cybercrime Withdrawal Prediction Intelligence Platform bootstrapped with MHA security policy.',
          ipAddress: '127.0.0.1',
          timestamp: new Date().toISOString()
        }
      ],
      notifications: [
        {
          id: 'notif-1',
          userId: 'all',
          title: 'High Risk Cash-Out Alert',
          message: 'Case CC-2025-9011: Andheri East predicted at 87% probability for cash withdrawal. Intercept units alerted.',
          type: 'alert',
          read: false,
          createdAt: new Date().toISOString(),
          complaintId: 'CC-2025-9011'
        }
      ],
      victims: [],
      victimComplaints: [],
      victimEvidence: [],
      recoveryStatus: [],
      victimNotifications: [],
      complaintAssignments: []
    };

    this.seedVictimData();
    this.persist();
    console.log('Database initialized with default MHA data, users, and historical cases.');
  }

  private seedVictimData() {
    const salt = bcrypt.genSaltSync(10);
    const victimPassword = bcrypt.hashSync('Victim@2025', salt);

    const demoVictim: VictimEntity = {
      victimId: 'VIC-2025-1082',
      name: 'Ramesh Kumar Sharma',
      mobile: '9876543210',
      email: 'victim@citizen.gov.in',
      passwordHash: victimPassword,
      aadhaar: 'XXXX-XXXX-8921',
      address: 'Flat 402, Shiv Shanti Apts, Dadar West',
      city: 'Mumbai',
      state: 'Maharashtra',
      registrationDate: '2025-05-12T09:30:00.000Z'
    };

    const complaint1Timeline: ComplaintTimelineStage[] = [
      {
        stage: 1,
        title: 'Complaint Submitted',
        date: '2025-05-18',
        time: '14:30',
        status: 'completed',
        assignedOfficer: 'Portal System Gateway',
        description: 'Complaint registered online via National Cyber Crime Portal. Initial FIR acknowledgement generated.'
      },
      {
        stage: 2,
        title: 'Under Review',
        date: '2025-05-18',
        time: '14:38',
        status: 'completed',
        assignedOfficer: 'Insp. Vikram Rathore',
        description: 'Transaction UTR verified with State Bank of India Nodal Cyber Desk. Fraud layering confirmed.'
      },
      {
        stage: 3,
        title: 'Prediction Generated',
        date: '2025-05-18',
        time: '14:42',
        status: 'completed',
        assignedOfficer: 'AI Prediction Core (MHA-I4C)',
        description: 'AI model identified high risk cash-out withdrawal cluster in Mumbai Andheri East (87%) and Kurla West (78%).'
      },
      {
        stage: 4,
        title: 'Officer Assigned',
        date: '2025-05-18',
        time: '14:48',
        status: 'completed',
        assignedOfficer: 'Insp. Vikram Rathore',
        description: 'Assigned to Insp. Vikram Rathore, Special Cyber Crime Cell, MHA / I4C Unit for priority investigation.'
      },
      {
        stage: 5,
        title: 'Investigation Started',
        date: '2025-05-18',
        time: '14:52',
        status: 'completed',
        assignedOfficer: 'Insp. Vikram Rathore',
        description: 'IO assigned. CCTV footage requisitioned from flagged Andheri East ATM kiosks. Suspect IP tracing initiated.'
      },
      {
        stage: 6,
        title: 'Bank Freeze Requested',
        date: '2025-05-18',
        time: '14:55',
        status: 'completed',
        assignedOfficer: 'Insp. Vikram Rathore',
        description: 'Notice under Section 91 CrPC issued to beneficiary banks. Target mule accounts placed under immediate debit lien.'
      },
      {
        stage: 7,
        title: 'Recovery In Progress',
        date: '2025-05-20',
        time: '11:15',
        status: 'current',
        assignedOfficer: 'Insp. Vikram Rathore',
        description: '₹1,20,000 successfully frozen in Layer-1 mule account. Court order under Section 457 CrPC initiated for account release.'
      },
      {
        stage: 8,
        title: 'Case Closed',
        date: 'Pending',
        time: '--:--',
        status: 'pending',
        description: 'Final restitution of funds to victim bank account and formal closure report to judicial magistrate.'
      }
    ];

    const complaint2Timeline: ComplaintTimelineStage[] = [
      {
        stage: 1,
        title: 'Complaint Submitted',
        date: '2025-05-19',
        time: '10:30',
        status: 'completed',
        assignedOfficer: 'Portal System Gateway',
        description: 'High-value digital arrest extortion complaint filed by victim. Immediate 1930 priority tag assigned.'
      },
      {
        stage: 2,
        title: 'Under Review',
        date: '2025-05-19',
        time: '10:45',
        status: 'completed',
        assignedOfficer: 'Insp. Vikram Rathore',
        description: 'Fake CBI arrest warrant and video call records verified. Immediate escalation to financial fraud nodal desk.'
      },
      {
        stage: 3,
        title: 'Prediction Generated',
        date: '2025-05-19',
        time: '10:52',
        status: 'completed',
        assignedOfficer: 'AI Prediction Core (MHA-I4C)',
        description: 'Cross-border syndicate pattern identified. Interception alert dispatched to Cyber Cell Interception Units.'
      },
      {
        stage: 4,
        title: 'Officer Assigned',
        date: '2025-05-19',
        time: '11:00',
        status: 'completed',
        assignedOfficer: 'Insp. Vikram Rathore',
        description: 'Investigating Officer assigned. Interdiction unit dispatched to suspected transit corridors.'
      },
      {
        stage: 5,
        title: 'Investigation Started',
        date: '2025-05-19',
        time: '11:05',
        status: 'completed',
        assignedOfficer: 'Insp. Vikram Rathore',
        description: 'Special task force investigation and mobile IMEI tracking of suspect syndicate members.'
      },
      {
        stage: 6,
        title: 'Bank Freeze Requested',
        date: '2025-05-19',
        time: '11:10',
        status: 'current',
        assignedOfficer: 'Insp. Vikram Rathore',
        description: 'Emergency freeze request transmitted through Indian Cybercrime Coordination Centre (I4C) switch.'
      },
      {
        stage: 7,
        title: 'Recovery In Progress',
        date: 'Pending',
        time: '--:--',
        status: 'pending',
        description: 'Inter-bank fund reversal workflow under RBI Master Direction guidelines.'
      },
      {
        stage: 8,
        title: 'Case Closed',
        date: 'Pending',
        time: '--:--',
        status: 'pending',
        description: 'Closure upon completion of judicial restitution.'
      }
    ];

    const demoComplaints: VictimComplaintEntity[] = [
      {
        complaintId: 'NCRP-2025-7821',
        victimId: 'VIC-2025-1082',
        victimName: 'Ramesh Kumar Sharma',
        victimMobile: '9876543210',
        fraudType: 'UPI Fraud',
        amountLost: 185000,
        amountFrozen: 185000,
        amountRecovered: 120000,
        bankName: 'State Bank of India',
        accountNumber: 'XXXXXX3489',
        upiId: 'ramesh.sharma@okaxis',
        transactionId: 'UTR-984210543981',
        transactionDate: '2025-05-18',
        transactionTime: '14:22',
        victimCity: 'Mumbai',
        victimState: 'Maharashtra',
        complaintDescription: 'Received an urgent SMS claiming power disconnection within 2 hours. Clicked link and sent ₹10 verification charge via UPI which auto-debited ₹1,85,000 across multiple mule accounts.',
        status: 'Recovery Processing',
        assignedOfficer: {
          id: 'usr-off-001',
          name: 'Insp. Vikram Rathore',
          designation: 'Inspector of Police',
          organization: 'Special Cyber Crime Cell, MHA / I4C Unit',
          contact: '+91-11-2343-8000'
        },
        timeline: complaint1Timeline,
        createdAt: '2025-05-18T14:30:00.000Z',
        updatedAt: '2025-05-20T11:15:00.000Z',
        predictionId: 'pred-cc-9011'
      },
      {
        complaintId: 'NCRP-2025-9104',
        victimId: 'VIC-2025-1082',
        victimName: 'Ramesh Kumar Sharma',
        victimMobile: '9876543210',
        fraudType: 'Digital Arrest / Impersonation',
        amountLost: 450000,
        amountFrozen: 450000,
        amountRecovered: 0,
        bankName: 'HDFC Bank',
        accountNumber: 'XXXXXX7120',
        upiId: 'ramesh.s@okhdfcbank',
        transactionId: 'UTR-712903482103',
        transactionDate: '2025-05-19',
        transactionTime: '10:15',
        victimCity: 'Mumbai',
        victimState: 'Maharashtra',
        complaintDescription: 'Impersonators claiming to be CBI officers held victim under 8-hour digital arrest via Skype video, threatening immediate arrest over narcotics package. Forced RTGS transfer to RBI verification mule account.',
        status: 'Bank Freeze Sent',
        assignedOfficer: {
          id: 'usr-off-001',
          name: 'Insp. Vikram Rathore',
          designation: 'Inspector of Police',
          organization: 'Special Cyber Crime Cell, MHA / I4C Unit',
          contact: '+91-11-2343-8000'
        },
        timeline: complaint2Timeline,
        createdAt: '2025-05-19T10:30:00.000Z',
        updatedAt: '2025-05-19T11:10:00.000Z'
      }
    ];

    const demoEvidence: VictimEvidenceEntity[] = [
      {
        evidenceId: 'EVD-7821-01',
        complaintId: 'NCRP-2025-7821',
        victimId: 'VIC-2025-1082',
        fileName: 'electricity_bill_phishing_sms.png',
        fileType: 'image',
        fileSize: '1.4 MB',
        description: 'Screenshot of spoofed electricity disconnection SMS with malicious payment link.',
        uploadedAt: '2025-05-18T14:32:00.000Z'
      },
      {
        evidenceId: 'EVD-7821-02',
        complaintId: 'NCRP-2025-7821',
        victimId: 'VIC-2025-1082',
        fileName: 'sbi_bank_account_statement.pdf',
        fileType: 'pdf',
        fileSize: '2.8 MB',
        description: 'Official bank account transaction statement showing unauthorized ₹1,85,000 debit.',
        uploadedAt: '2025-05-18T14:35:00.000Z'
      },
      {
        evidenceId: 'EVD-7821-03',
        complaintId: 'NCRP-2025-7821',
        victimId: 'VIC-2025-1082',
        fileName: 'fraudster_whatsapp_audio_call.mp3',
        fileType: 'audio',
        fileSize: '4.1 MB',
        description: 'Audio recording of caller posing as Electricity Board Officer instructing APK install.',
        uploadedAt: '2025-05-18T15:10:00.000Z'
      },
      {
        evidenceId: 'EVD-9104-01',
        complaintId: 'NCRP-2025-9104',
        victimId: 'VIC-2025-1082',
        fileName: 'fake_cbi_arrest_warrant_letter.pdf',
        fileType: 'pdf',
        fileSize: '3.2 MB',
        description: 'Forged arrest warrant document with fake Supreme Court and CBI emblems.',
        uploadedAt: '2025-05-19T10:35:00.000Z'
      }
    ];

    const demoRecovery: RecoveryStatusEntity[] = [
      {
        recoveryId: 'REC-7821-01',
        complaintId: 'NCRP-2025-7821',
        victimId: 'VIC-2025-1082',
        amountLost: 185000,
        amountFrozen: 185000,
        amountRecovered: 120000,
        recoveryPercentage: 65,
        bankLienReference: 'LIEN/SBI/2025/MUM-9821',
        status: 'Partial',
        timelineLogs: [
          {
            date: '2025-05-18',
            time: '14:55',
            stage: 'Lien Notice Issued',
            note: 'Formal notice served under Section 91 CrPC to SBI Nodal Officer to place debit freeze on mule beneficiary account.',
            authority: 'Insp. Vikram Rathore, MHA Cyber Cell'
          },
          {
            date: '2025-05-18',
            time: '15:20',
            stage: 'Debit Freeze Confirmed',
            note: 'SBI Nodal desk confirmed ₹1,85,000 debit freeze placed on account 3847291024 (Layer 1 Mule).',
            amount: 185000,
            authority: 'SBI Cyber Cell Nodal Officer'
          },
          {
            date: '2025-05-19',
            time: '16:00',
            stage: 'Court Order Initiated',
            note: 'Application for release of property submitted before Chief Metropolitan Magistrate under Section 457 CrPC.',
            authority: 'Public Prosecutor, Cyber Crime Court'
          },
          {
            date: '2025-05-20',
            time: '11:15',
            stage: 'Partial Restitution Cleared',
            note: 'Interim restitution order passed for ₹1,20,000. Bank processing direct NEFT reversal to victim account.',
            amount: 120000,
            authority: 'Judicial Magistrate First Class, Mumbai'
          }
        ],
        updatedAt: '2025-05-20T11:15:00.000Z'
      },
      {
        recoveryId: 'REC-9104-01',
        complaintId: 'NCRP-2025-9104',
        victimId: 'VIC-2025-1082',
        amountLost: 450000,
        amountFrozen: 450000,
        amountRecovered: 0,
        recoveryPercentage: 0,
        bankLienReference: 'LIEN/HDFC/2025/CBI-4412',
        status: 'Pending',
        timelineLogs: [
          {
            date: '2025-05-19',
            time: '11:10',
            stage: 'Emergency Lien Flagged',
            note: 'Automated 1930 integration triggered debit freeze across recipient bank branches.',
            authority: 'I4C 1930 Switch'
          },
          {
            date: '2025-05-19',
            time: '11:45',
            stage: 'Layer 1 & Layer 2 Frozen',
            note: 'Full amount of ₹4,50,000 secured before withdrawal across 3 downstream mule accounts.',
            amount: 450000,
            authority: 'HDFC & Axis Cyber Nodal Team'
          }
        ],
        updatedAt: '2025-05-19T11:45:00.000Z'
      }
    ];

    const demoNotifications: VictimNotificationEntity[] = [
      {
        id: 'vic-notif-1',
        victimId: 'VIC-2025-1082',
        complaintId: 'NCRP-2025-7821',
        title: 'Bank Freeze Successful',
        message: '₹1,20,000 successfully frozen in target mule account. Court restitution procedure in progress.',
        type: 'freeze_sent',
        read: false,
        createdAt: '2025-05-20T11:15:00.000Z'
      },
      {
        id: 'vic-notif-2',
        victimId: 'VIC-2025-1082',
        complaintId: 'NCRP-2025-7821',
        title: 'Officer Assigned',
        message: 'Insp. Vikram Rathore (Special Cyber Crime Cell, MHA / I4C Unit) assigned to investigate case NCRP-2025-7821.',
        type: 'officer_assigned',
        read: false,
        createdAt: '2025-05-18T14:38:00.000Z'
      },
      {
        id: 'vic-notif-3',
        victimId: 'VIC-2025-1082',
        complaintId: 'NCRP-2025-7821',
        title: 'Prediction Generated',
        message: 'Cash withdrawal zones forecasted in Mumbai Suburban Corridor. Tactical interception units notified.',
        type: 'prediction_ready',
        read: true,
        createdAt: '2025-05-18T14:42:00.000Z'
      },
      {
        id: 'vic-notif-4',
        victimId: 'VIC-2025-1082',
        complaintId: 'NCRP-2025-9104',
        title: 'Complaint Registered',
        message: 'Case NCRP-2025-9104 (Digital Arrest / Impersonation) accepted into high-priority queue.',
        type: 'accepted',
        read: true,
        createdAt: '2025-05-19T10:30:00.000Z'
      }
    ];

    this.data.victims = [demoVictim];
    this.data.victimComplaints = demoComplaints;
    this.data.victimEvidence = demoEvidence;
    this.data.recoveryStatus = demoRecovery;
    this.data.victimNotifications = demoNotifications;

    // Synchronize demoComplaints into unified this.data.complaints
    demoComplaints.forEach((dc) => {
      const exists = this.data.complaints.some((c) => c.complaintId === dc.complaintId);
      if (!exists) {
        this.data.complaints.unshift({
          complaintId: dc.complaintId,
          victimId: dc.victimId,
          victimName: dc.victimName,
          victimMobile: dc.victimMobile,
          victimEmail: demoVictim.email,
          victimAddress: demoVictim.address,
          fraudType: dc.fraudType,
          amountLost: dc.amountLost,
          victimCity: dc.victimCity,
          victimState: dc.victimState,
          transactionDate: dc.transactionDate,
          transactionTime: dc.transactionTime,
          bankName: dc.bankName,
          accountNumber: dc.accountNumber,
          upiId: dc.upiId,
          transactionId: dc.transactionId,
          complaintDescription: dc.complaintDescription,
          status: dc.status as any,
          priority: dc.amountLost > 100000 ? 'Critical' : 'High',
          officerId: dc.assignedOfficer?.id || 'usr-off-001',
          officerName: dc.assignedOfficer?.name || 'Insp. Vikram Rathore',
          assignedOfficer: dc.assignedOfficer,
          amountFrozen: dc.amountFrozen,
          amountRecovered: dc.amountRecovered,
          timeline: dc.timeline,
          createdAt: dc.createdAt,
          updatedAt: dc.updatedAt,
          notes: [
            {
              id: 'init-note-1',
              author: dc.assignedOfficer?.name || 'Insp. Vikram Rathore',
              role: 'officer',
              text: 'Citizen complaint ingested from NCRP gateway. 1930 inter-bank freeze broadcasted.',
              timestamp: dc.createdAt
            }
          ],
          predictionId: dc.predictionId
        });
      }
    });

    this.persist();
  }

  // User Operations
  findUserByEmail(email: string): UserEntity | undefined {
    return this.data.users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());
  }

  findUserById(userId: string): UserEntity | undefined {
    return this.data.users.find((u) => u.userId === userId);
  }

  createUser(user: UserEntity): UserEntity {
    this.data.users.push(user);
    this.persist();
    return user;
  }

  getAllUsers(): UserEntity[] {
    return [...this.data.users];
  }

  // Complaint Operations
  getComplaints(filters?: { fraudType?: string; status?: string; search?: string }): ComplaintEntity[] {
    let list = [...this.data.complaints];

    if (filters?.fraudType && filters.fraudType !== 'All') {
      list = list.filter((c) => c.fraudType === filters.fraudType);
    }
    if (filters?.status && filters.status !== 'All') {
      list = list.filter((c) => c.status === filters.status);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase().trim();
      list = list.filter((c) =>
        c.complaintId.toLowerCase().includes(q) ||
        c.victimCity.toLowerCase().includes(q) ||
        c.bankName.toLowerCase().includes(q) ||
        c.complaintDescription.toLowerCase().includes(q) ||
        (c.transactionId && c.transactionId.toLowerCase().includes(q))
      );
    }

    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  getComplaintById(id: string): ComplaintEntity | undefined {
    return this.data.complaints.find((c) => c.complaintId === id);
  }

  createComplaint(complaint: ComplaintEntity): ComplaintEntity {
    this.data.complaints.unshift(complaint);
    this.persist();
    return complaint;
  }

  updateComplaint(id: string, updates: Partial<ComplaintEntity>): ComplaintEntity | undefined {
    const idx = this.data.complaints.findIndex((c) => c.complaintId === id);
    if (idx === -1) return undefined;

    this.data.complaints[idx] = {
      ...this.data.complaints[idx],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    // Synchronize to victim complaints if present
    const vIdx = this.data.victimComplaints.findIndex((vc) => vc.complaintId === id);
    if (vIdx >= 0) {
      this.data.victimComplaints[vIdx] = {
        ...this.data.victimComplaints[vIdx],
        ...(updates as any),
        updatedAt: new Date().toISOString()
      };
    }

    this.persist();
    return this.data.complaints[idx];
  }

  // Prediction Operations
  getPredictions(): PredictionEntity[] {
    return [...this.data.predictions];
  }

  getPredictionByComplaintId(complaintId: string): PredictionEntity | undefined {
    return this.data.predictions.find((p) => p.complaintId === complaintId);
  }

  savePrediction(prediction: PredictionEntity): PredictionEntity {
    const idx = this.data.predictions.findIndex((p) => p.complaintId === prediction.complaintId);
    if (idx >= 0) {
      this.data.predictions[idx] = prediction;
    } else {
      this.data.predictions.unshift(prediction);
    }

    // Link to complaint
    this.updateComplaint(prediction.complaintId, { predictionId: prediction.predictionId });
    this.persist();
    return prediction;
  }

  // Historical Cases Operations
  getHistoricalCases(): HistoricalCaseEntity[] {
    return [...this.data.historicalCases];
  }

  createHistoricalCase(item: HistoricalCaseEntity): HistoricalCaseEntity {
    this.data.historicalCases.unshift(item);
    this.persist();
    return item;
  }

  importHistoricalCases(items: HistoricalCaseEntity[]): number {
    let count = 0;
    for (const item of items) {
      if (!this.data.historicalCases.some((h) => h.caseId === item.caseId)) {
        this.data.historicalCases.push(item);
        count++;
      }
    }
    this.persist();
    return count;
  }

  // Reports Operations
  getReports(): ReportEntity[] {
    return [...this.data.reports].sort((a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime());
  }

  getReportById(reportId: string): ReportEntity | undefined {
    return this.data.reports.find((r) => r.reportId === reportId);
  }

  saveReport(report: ReportEntity): ReportEntity {
    const idx = this.data.reports.findIndex((r) => r.reportId === report.reportId);
    if (idx >= 0) {
      this.data.reports[idx] = report;
    } else {
      this.data.reports.unshift(report);
    }
    this.persist();
    return report;
  }

  // Logs & Notifications
  addLog(log: Omit<ActivityLogEntity, 'logId' | 'timestamp'>) {
    const newLog: ActivityLogEntity = {
      logId: 'log-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      ...log,
      timestamp: new Date().toISOString()
    };
    this.data.activityLogs.unshift(newLog);
    if (this.data.activityLogs.length > 200) {
      this.data.activityLogs = this.data.activityLogs.slice(0, 200);
    }
    this.persist();
  }

  getLogs(limit = 100): ActivityLogEntity[] {
    return this.data.activityLogs.slice(0, limit);
  }

  addNotification(notif: Omit<NotificationEntity, 'id' | 'createdAt' | 'read'>) {
    const newNotif: NotificationEntity = {
      id: 'notif-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      ...notif,
      read: false,
      createdAt: new Date().toISOString()
    };
    this.data.notifications.unshift(newNotif);
    this.persist();
  }

  getNotifications(userId?: string): NotificationEntity[] {
    if (!userId) return this.data.notifications;
    return this.data.notifications.filter((n) => !n.userId || n.userId === 'all' || n.userId === userId);
  }

  markNotificationAsRead(id: string) {
    const item = this.data.notifications.find((n) => n.id === id);
    if (item) {
      item.read = true;
      this.persist();
    }
  }

  // Analytics Stats
  getStats() {
    const complaints = this.data.complaints;
    const historical = this.data.historicalCases;

    // 1. Fraud Type Distribution
    const fraudTypeCounts: Record<string, number> = {};
    [...complaints, ...historical].forEach((c) => {
      const type = c.fraudType || 'Other';
      fraudTypeCounts[type] = (fraudTypeCounts[type] || 0) + 1;
    });
    const fraudTypeDistribution = Object.entries(fraudTypeCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    // 2. Withdrawal Hotspots
    const clusterCounts: Record<string, { count: number; totalAmount: number; city: string; lat: number; lng: number }> = {};
    historical.forEach((h) => {
      const cluster = h.withdrawalLocation.cluster || `${h.withdrawalLocation.city} Cluster`;
      if (!clusterCounts[cluster]) {
        clusterCounts[cluster] = {
          count: 0,
          totalAmount: 0,
          city: h.withdrawalLocation.city,
          lat: h.withdrawalLocation.lat,
          lng: h.withdrawalLocation.lng
        };
      }
      clusterCounts[cluster].count += 1;
      clusterCounts[cluster].totalAmount += h.amount;
    });

    const withdrawalHotspots = Object.entries(clusterCounts)
      .map(([clusterName, info]) => ({
        clusterName,
        incidentCount: info.count,
        totalAmountWithdrawn: info.totalAmount,
        city: info.city,
        lat: info.lat,
        lng: info.lng
      }))
      .sort((a, b) => b.incidentCount - a.incidentCount);

    // 3. Historical Fraud Trends (Monthly aggregation)
    const monthlyData: Record<string, { count: number; amount: number }> = {};
    historical.forEach((h) => {
      const date = new Date(h.timestamp);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { count: 0, amount: 0 };
      }
      monthlyData[monthKey].count += 1;
      monthlyData[monthKey].amount += h.amount;
    });

    const historicalFraudTrends = Object.entries(monthlyData)
      .map(([month, data]) => ({ month, count: data.count, amount: data.amount }))
      .sort((a, b) => a.month.localeCompare(b.month));

    const totalLoss = complaints.reduce((sum, c) => sum + (c.amountLost || 0), 0);

    return {
      totalComplaints: complaints.length,
      totalHistoricalCases: historical.length,
      totalLoss,
      activeAlerts: this.data.predictions.filter((p) => p.riskLevel === 'High').length,
      fraudTypeDistribution,
      withdrawalHotspots,
      historicalFraudTrends
    };
  }

  // -------------------------------------------------------------------
  // VICTIM PORTAL DATABASE METHODS
  // -------------------------------------------------------------------

  findVictimByEmail(email: string): VictimEntity | undefined {
    return this.data.victims.find((v) => v.email.toLowerCase() === email.toLowerCase().trim());
  }

  findVictimByMobile(mobile: string): VictimEntity | undefined {
    const cleaned = mobile.replace(/\D/g, '');
    return this.data.victims.find((v) => v.mobile.replace(/\D/g, '').endsWith(cleaned) || cleaned.endsWith(v.mobile.replace(/\D/g, '')));
  }

  findVictimById(victimId: string): VictimEntity | undefined {
    return this.data.victims.find((v) => v.victimId === victimId);
  }

  createVictim(victim: VictimEntity): VictimEntity {
    this.data.victims.push(victim);
    this.persist();
    return victim;
  }

  updateVictim(victimId: string, updates: Partial<VictimEntity>): VictimEntity | undefined {
    const idx = this.data.victims.findIndex((v) => v.victimId === victimId);
    if (idx === -1) return undefined;
    this.data.victims[idx] = { ...this.data.victims[idx], ...updates };
    this.persist();
    return this.data.victims[idx];
  }

  getVictimComplaints(victimId: string): VictimComplaintEntity[] {
    return this.data.victimComplaints
      .filter((c) => c.victimId === victimId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  getVictimComplaintById(complaintId: string): VictimComplaintEntity | undefined {
    return this.data.victimComplaints.find((c) => c.complaintId === complaintId);
  }

  createVictimComplaint(complaint: VictimComplaintEntity): VictimComplaintEntity {
    this.data.victimComplaints.unshift(complaint);

    // Synchronize to unified complaints table
    const existingIdx = this.data.complaints.findIndex((c) => c.complaintId === complaint.complaintId);
    const unifiedComp: ComplaintEntity = {
      complaintId: complaint.complaintId,
      victimId: complaint.victimId,
      victimName: complaint.victimName,
      victimMobile: complaint.victimMobile,
      fraudType: complaint.fraudType,
      amountLost: complaint.amountLost,
      victimCity: complaint.victimCity,
      victimState: complaint.victimState,
      transactionDate: complaint.transactionDate,
      transactionTime: complaint.transactionTime,
      bankName: complaint.bankName,
      accountNumber: complaint.accountNumber,
      upiId: complaint.upiId,
      transactionId: complaint.transactionId,
      complaintDescription: complaint.complaintDescription,
      status: complaint.status as any,
      priority: (complaint as any).priority || 'High',
      officerId: complaint.assignedOfficer?.id || '',
      officerName: complaint.assignedOfficer?.name || '',
      assignedOfficer: complaint.assignedOfficer,
      amountFrozen: complaint.amountFrozen || 0,
      amountRecovered: complaint.amountRecovered || 0,
      timeline: complaint.timeline,
      createdAt: complaint.createdAt,
      updatedAt: complaint.updatedAt,
      notes: [],
      predictionId: complaint.predictionId
    };

    if (existingIdx >= 0) {
      this.data.complaints[existingIdx] = { ...this.data.complaints[existingIdx], ...unifiedComp };
    } else {
      this.data.complaints.unshift(unifiedComp);
    }

    this.persist();
    return complaint;
  }

  updateVictimComplaint(complaintId: string, updates: Partial<VictimComplaintEntity>): VictimComplaintEntity | undefined {
    const idx = this.data.victimComplaints.findIndex((c) => c.complaintId === complaintId);
    if (idx === -1) return undefined;
    this.data.victimComplaints[idx] = { ...this.data.victimComplaints[idx], ...updates, updatedAt: new Date().toISOString() };

    // Synchronize to unified complaints table
    const cIdx = this.data.complaints.findIndex((c) => c.complaintId === complaintId);
    if (cIdx >= 0) {
      this.data.complaints[cIdx] = {
        ...this.data.complaints[cIdx],
        ...(updates as any),
        updatedAt: new Date().toISOString()
      };
    }

    this.persist();
    return this.data.victimComplaints[idx];
  }

  // -------------------------------------------------------------------
  // COMPLAINT ASSIGNMENTS
  // -------------------------------------------------------------------
  createAssignment(assignment: ComplaintAssignmentEntity): ComplaintAssignmentEntity {
    this.data.complaintAssignments.unshift(assignment);
    this.persist();
    return assignment;
  }

  getAssignments(complaintId?: string): ComplaintAssignmentEntity[] {
    if (!complaintId) return this.data.complaintAssignments;
    return this.data.complaintAssignments.filter((a) => a.complaintId === complaintId);
  }

  getVictimEvidence(victimId: string, complaintId?: string): VictimEvidenceEntity[] {
    return this.data.victimEvidence
      .filter((e) => e.victimId === victimId && (!complaintId || e.complaintId === complaintId))
      .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
  }

  getEvidenceByComplaint(complaintId: string): VictimEvidenceEntity[] {
    return this.data.victimEvidence
      .filter((e) => e.complaintId === complaintId)
      .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
  }

  getEvidenceById(evidenceId: string): VictimEvidenceEntity | undefined {
    return this.data.victimEvidence.find((e) => e.evidenceId === evidenceId);
  }

  createVictimEvidence(evidence: VictimEvidenceEntity): VictimEvidenceEntity {
    this.data.victimEvidence.unshift(evidence);
    this.persist();
    return evidence;
  }

  deleteVictimEvidence(evidenceId: string, victimId: string): boolean {
    const idx = this.data.victimEvidence.findIndex((e) => e.evidenceId === evidenceId && e.victimId === victimId);
    if (idx === -1) return false;
    this.data.victimEvidence.splice(idx, 1);
    this.persist();
    return true;
  }

  getRecoveryStatus(victimId: string, complaintId?: string): RecoveryStatusEntity[] {
    return this.data.recoveryStatus
      .filter((r) => r.victimId === victimId && (!complaintId || r.complaintId === complaintId))
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  getRecoveryByComplaintId(complaintId: string): RecoveryStatusEntity | undefined {
    return this.data.recoveryStatus.find((r) => r.complaintId === complaintId);
  }

  saveRecoveryStatus(recovery: RecoveryStatusEntity): RecoveryStatusEntity {
    const idx = this.data.recoveryStatus.findIndex((r) => r.complaintId === recovery.complaintId);
    if (idx >= 0) {
      this.data.recoveryStatus[idx] = recovery;
    } else {
      this.data.recoveryStatus.unshift(recovery);
    }
    this.persist();
    return recovery;
  }

  getVictimNotifications(victimId: string): VictimNotificationEntity[] {
    return this.data.victimNotifications
      .filter((n) => n.victimId === victimId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  addVictimNotification(notif: Omit<VictimNotificationEntity, 'id' | 'createdAt' | 'read'>): VictimNotificationEntity {
    const item: VictimNotificationEntity = {
      id: 'vic-notif-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      ...notif,
      read: false,
      createdAt: new Date().toISOString()
    };
    this.data.victimNotifications.unshift(item);
    this.persist();
    return item;
  }

  markVictimNotificationRead(id: string, victimId: string): void {
    const item = this.data.victimNotifications.find((n) => n.id === id && n.victimId === victimId);
    if (item) {
      item.read = true;
      this.persist();
    }
  }

  markAllVictimNotificationsRead(victimId: string): void {
    this.data.victimNotifications.forEach((n) => {
      if (n.victimId === victimId) n.read = true;
    });
    this.persist();
  }

  getVictimStats(victimId: string) {
    const complaints = this.getVictimComplaints(victimId);
    const activeComplaints = complaints.filter((c) => c.status !== 'Case Closed').length;
    const closedComplaints = complaints.filter((c) => c.status === 'Case Closed').length;
    const amountLost = complaints.reduce((sum, c) => sum + (c.amountLost || 0), 0);
    const amountFrozen = complaints.reduce((sum, c) => sum + (c.amountFrozen || 0), 0);
    const amountRecovered = complaints.reduce((sum, c) => sum + (c.amountRecovered || 0), 0);
    const recoveryPercentage = amountLost > 0 ? Math.min(100, Math.round((amountRecovered / amountLost) * 100)) : 0;
    const latestComplaint = complaints.length > 0 ? complaints[0] : null;

    return {
      totalComplaints: complaints.length,
      activeComplaints,
      closedComplaints,
      amountLost,
      amountFrozen,
      amountRecovered,
      recoveryPercentage,
      latestComplaint
    };
  }
}

export const db = new DatabaseStore();
