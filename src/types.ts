export type UserRole = 'officer' | 'admin';

export interface User {
  userId: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  organization: string;
  badgeNumber?: string;
  createdAt: string;
}

export type FraudType =
  | 'UPI Fraud'
  | 'ATM Cloning'
  | 'Phishing / OTP Bypass'
  | 'Digital Arrest / Impersonation'
  | 'Investment Fraud'
  | 'Fake Loan Extortion'
  | 'Job / Task Scam'
  | 'Card Skimming'
  | 'Crypto Mule Siphoning'
  | 'Other';

export type PriorityLevel = 'Critical' | 'High' | 'Medium' | 'Low';

export interface ComplaintNote {
  id: string;
  author: string;
  role: string;
  text: string;
  timestamp: string;
}

export type ComplaintStatus =
  | 'New'
  | 'Under Review'
  | 'Prediction Generated'
  | 'Officer Assigned'
  | 'Investigation Started'
  | 'Bank Freeze Requested'
  | 'Account Under Surveillance'
  | 'Recovery In Progress'
  | 'Partially Recovered'
  | 'Fully Recovered'
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

export interface AssignedOfficerInfo {
  id: string;
  name: string;
  designation?: string;
  organization?: string;
  contact?: string;
  badgeNumber?: string;
  assignedAt?: string;
}

export interface Complaint {
  complaintId: string;
  victimId?: string;
  victimName?: string;
  victimMobile?: string;
  victimEmail?: string;
  victimAddress?: string;
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
  status: ComplaintStatus;
  priority: PriorityLevel;
  officerId?: string;
  officerName?: string;
  assignedOfficer?: AssignedOfficerInfo;
  amountFrozen?: number;
  amountRecovered?: number;
  timeline?: ComplaintTimelineStage[];
  recoveryStatus?: RecoveryStatus;
  createdAt: string;
  updatedAt?: string;
  notes: ComplaintNote[];
  predictionId?: string;
}

export interface LinkedHistoricalCase {
  caseId: string;
  fraudType: string;
  amount: number;
  bank: string;
  withdrawalLocation: string;
  date: string;
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
  linkedHistoricalCases: LinkedHistoricalCase[];
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

export interface Prediction {
  predictionId: string;
  complaintId: string;
  riskScore: number; // 0 - 100
  confidenceScore: number; // 0 - 100
  riskLevel: 'High' | 'Medium' | 'Low';
  priorityLevel?: PriorityLevel;
  topPredictedZones: PredictedZone[];
  scamClassification: string;
  patternAnalysis: string;
  riskExplanation: string;
  investigationRecommendations: string[];
  aiAnalysisText: string;
  explainableFactors?: ExplainableFactor[];
  generatedAt: string;
}

export interface HistoricalCase {
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

export interface IntelligenceReport {
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

export interface ActivityLog {
  logId: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  details: string;
  ipAddress: string;
  timestamp: string;
}

export interface AppNotification {
  id: string;
  userId?: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'alert' | 'success';
  read: boolean;
  createdAt: string;
  complaintId?: string;
}

export interface DashboardStats {
  totalComplaints: number;
  totalHistoricalCases: number;
  totalLoss: number;
  activeAlerts: number;
  fraudTypeDistribution: Array<{ name: string; count: number }>;
  withdrawalHotspots: Array<{
    clusterName: string;
    incidentCount: number;
    totalAmountWithdrawn: number;
    city: string;
    lat: number;
    lng: number;
  }>;
  historicalFraudTrends: Array<{
    month: string;
    count: number;
    amount: number;
  }>;
}

// -------------------------------------------------------------------
// CITIZEN / VICTIM PORTAL INTERFACES
// -------------------------------------------------------------------

export interface VictimUser {
  victimId: string;
  name: string;
  mobile: string;
  email: string;
  aadhaar?: string;
  address: string;
  city?: string;
  state?: string;
  registrationDate: string;
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

export interface VictimComplaint {
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
  status: ComplaintStatus;
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
  recoveryStatus?: RecoveryStatus;
}

export interface VictimEvidence {
  evidenceId: string;
  id?: string;
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

export interface RecoveryStatus {
  recoveryId: string;
  complaintId: string;
  victimId: string;
  amountLost: number;
  amountFrozen: number;
  amountRecovered: number;
  recoveryPercentage: number;
  bankLienReference?: string;
  bankLienRef?: string;
  status: 'Pending' | 'Partial' | 'Recovered' | 'Transferred';
  timelineLogs: RecoveryLogEntry[];
  updatedAt: string;
  lastUpdated?: string;
}

export interface VictimNotification {
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

export interface VictimDashboardStats {
  totalComplaints: number;
  activeComplaints: number;
  closedComplaints: number;
  amountLost: number;
  amountFrozen: number;
  amountRecovered: number;
  recoveryPercentage: number;
  latestComplaint: VictimComplaint | null;
}

// SIH Cybercrime Intelligence Types (from manalgharat61/sih-cybercrime-intelligence)
export interface SihAtmLocation {
  atm_id: string;
  bank_name: string;
  latitude: number;
  longitude: number;
  city_zone: string;
  is_high_risk_area: number;
}

export interface SihMuleTransaction {
  tx_id: string;
  complaint_id: string;
  mule_account_id: string;
  tx_timestamp: string;
  withdrawal_atm_id: string;
  amount_withdrawn: number;
  time_to_cashout_mins: number;
  fraud_type?: string;
}

export interface SihPredictionRequest {
  amount_lost: number;
  fraud_type: 'UPI Phishing' | 'Investment Scam' | 'Credit Card Fraud' | 'Part-time Job Scam' | 'Loan App Extortion' | string;
  hour_of_day: number;
  day_of_week: number;
  is_weekend: number;
  victim_district?: string;
  payment_channel?: string;
}

export interface SihPredictionResult {
  predicted_zone: string;
  zone_probabilities: Record<string, number>;
  confidence_score: number;
  estimated_cashout_window_mins: number;
  target_atms: SihAtmLocation[];
  flagged_mule_account: string;
  feature_importances: Record<string, number>;
  tactical_notes: string;
  risk_level: 'Critical' | 'High' | 'Elevated' | 'Moderate';
}

export interface SihModelMetrics {
  accuracy_pct: number;
  baseline_accuracy_pct: number;
  n_train: number;
  n_test: number;
  labels: string[];
  confusion_matrix: Record<string, Record<string, number>>;
  feature_importances: Record<string, number>;
}

