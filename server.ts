import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { db, UserEntity, ComplaintEntity, HistoricalCaseEntity, ReportEntity, VictimEntity, VictimComplaintEntity, ComplaintTimelineStage } from './server/db';
import { analyzeAndPredictCybercrime, generateVictimAiAdvice, generateVictimAiAdviceStream } from './server/ai';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'mha-cybercrime-withdrawal-prediction-secret-key-2025';

app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Logging
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    if (req.url.startsWith('/api')) {
      console.log(`${req.method} ${req.url} [${res.statusCode}] - ${Date.now() - start}ms`);
    }
  });
  next();
});

// Authenticated request interface (Officer / Admin)
export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: 'officer' | 'admin';
    name: string;
    organization: string;
  };
}

// Authenticated request interface (Citizen / Victim)
export interface AuthenticatedVictimRequest extends Request {
  victim?: {
    victimId: string;
    email: string;
    mobile: string;
    name: string;
    role: 'victim';
  };
}

function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Authentication required. Please log in.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired session. Please log in again.' });
  }
}

function authenticateVictimToken(req: AuthenticatedVictimRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Citizen authentication required. Please log in.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    if (decoded.role !== 'victim') {
      return res.status(403).json({ error: 'Access restricted to citizen / victim accounts.' });
    }
    req.victim = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired session. Please log in again.' });
  }
}

function optionalVictimToken(req: AuthenticatedVictimRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      if (decoded.role === 'victim') {
        req.victim = decoded;
      }
    } catch {
      // ignore invalid token for optional authorization
    }
  }
  next();
}

function requireRole(allowedRoles: Array<'officer' | 'admin'>) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: `Access restricted to authorized personnel (${allowedRoles.join(', ')})` });
    }
    next();
  };
}

// ----------------------------------------------------
// API ROUTES
// ----------------------------------------------------

// Health
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'MHA Cybercrime Withdrawal Prediction Intelligence Platform',
    version: '3.0.0'
  });
});

// 1. Auth: Officer Registration
app.post('/api/auth/register', (req, res) => {
  try {
    const { name, email, password, organization, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Full Name, Official Email, and Password are required.' });
    }

    const existingUser = db.findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'An officer account with this official email already exists.' });
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);
    const assignedRole: 'officer' | 'admin' = role === 'admin' ? 'admin' : 'officer';

    const newUser: UserEntity = {
      userId: 'usr-' + assignedRole + '-' + Math.random().toString(36).substring(2, 7),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      passwordHash,
      role: assignedRole,
      organization: organization?.trim() || 'Ministry of Home Affairs - Cyber Cell',
      badgeNumber: 'MHA-CYB-' + Math.floor(1000 + Math.random() * 9000),
      createdAt: new Date().toISOString()
    };

    db.createUser(newUser);

    const token = jwt.sign(
      {
        userId: newUser.userId,
        email: newUser.email,
        role: newUser.role,
        name: newUser.name,
        organization: newUser.organization
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    db.addLog({
      userId: newUser.userId,
      userName: newUser.name,
      userRole: newUser.role,
      action: 'OFFICER_REGISTERED',
      details: `New officer account registered: ${newUser.name} (${newUser.organization})`,
      ipAddress: req.ip || '127.0.0.1'
    });

    const { passwordHash: _, ...safeUser } = newUser;
    res.status(201).json({ user: safeUser, token });
  } catch (err: any) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Officer registration failed: ' + err.message });
  }
});

// 2. Auth: Officer Login
app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = db.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials. Please verify your official email.' });
    }

    const validPassword = bcrypt.compareSync(password, user.passwordHash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid password. Please check your credentials.' });
    }

    const token = jwt.sign(
      {
        userId: user.userId,
        email: user.email,
        role: user.role,
        name: user.name,
        organization: user.organization
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    db.addLog({
      userId: user.userId,
      userName: user.name,
      userRole: user.role,
      action: 'OFFICER_LOGIN',
      details: `Officer logged in successfully from IP: ${req.ip || '127.0.0.1'}`,
      ipAddress: req.ip || '127.0.0.1'
    });

    const { passwordHash: _, ...safeUser } = user;
    res.json({ user: safeUser, token });
  } catch (err: any) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Authentication failed: ' + err.message });
  }
});

// 3. Auth: Forgot Password
app.post('/api/auth/forgot-password', (req, res) => {
  try {
    const { email, newPassword } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Official email address is required.' });
    }

    const user = db.findUserByEmail(email);
    if (!user) {
      return res.status(404).json({ error: 'No officer account found with this email.' });
    }

    if (newPassword && newPassword.length >= 6) {
      const salt = bcrypt.genSaltSync(10);
      user.passwordHash = bcrypt.hashSync(newPassword, salt);
      db.addLog({
        userId: user.userId,
        userName: user.name,
        userRole: user.role,
        action: 'PASSWORD_RESET',
        details: `Password reset for officer account ${user.email}`,
        ipAddress: req.ip || '127.0.0.1'
      });
      return res.json({ success: true, message: 'Password has been securely reset. You can now log in.' });
    }

    return res.json({
      success: true,
      message: 'Password reset request verified. Please enter your new password to complete reset.',
      email: user.email
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Password reset failed: ' + err.message });
  }
});

// 4. Current User verification
app.get('/api/auth/me', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const user = db.findUserById(req.user.userId);
  if (!user) {
    return res.status(404).json({ error: 'User profile not found' });
  }

  const { passwordHash: _, ...safeUser } = user;
  res.json(safeUser);
});

// 5. Complaints: List
app.get('/api/complaints', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { fraudType, status, search } = req.query as { fraudType?: string; status?: string; search?: string };
    const complaints = db.getComplaints({ fraudType, status, search });
    res.json(complaints);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve complaints: ' + err.message });
  }
});

// 6. Complaints: Get by ID
app.get('/api/complaints/:id', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const complaint = db.getComplaintById(req.params.id);
  if (!complaint) {
    return res.status(404).json({ error: 'Complaint not found.' });
  }
  const prediction = db.getPredictionByComplaintId(complaint.complaintId);
  res.json({ complaint, prediction });
});

// 6b. Complaints: Get Full Investigation Dossier (6 core investigation sections)
app.get('/api/complaints/:id/investigation', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const complaint = db.getComplaintById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found.' });
    }

    const prediction = db.getPredictionByComplaintId(complaint.complaintId);
    const victim = complaint.victimId ? db.findVictimById(complaint.victimId) : undefined;
    const evidence = db.getEvidenceByComplaint(complaint.complaintId);
    const recovery = db.getRecoveryByComplaintId(complaint.complaintId);
    const assignments = db.getAssignments(complaint.complaintId);
    
    // Find matching historical cases
    const allHistorical = db.getHistoricalCases();
    const historicalSimilar = allHistorical
      .map((hc) => {
        let matchScore = 0;
        if (hc.fraudType.toLowerCase() === complaint.fraudType.toLowerCase()) matchScore += 40;
        if (hc.bank.toLowerCase().includes(complaint.bankName.toLowerCase()) || complaint.bankName.toLowerCase().includes(hc.bank.toLowerCase())) matchScore += 25;
        const diff = Math.abs(hc.amount - complaint.amountLost);
        if (diff / Math.max(hc.amount, complaint.amountLost) < 0.4) matchScore += 20;
        if (hc.victimLocation.city.toLowerCase() === (complaint.victimCity || '').toLowerCase()) matchScore += 15;
        return { ...hc, matchScore };
      })
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 5);

    const officers = db.getAllUsers().filter((u) => u.role === 'officer' || u.role === 'admin');

    res.json({
      complaint,
      victim: victim
        ? {
            victimId: victim.victimId,
            name: victim.name,
            email: victim.email,
            mobile: victim.mobile,
            address: victim.address,
            city: victim.city || complaint.victimCity,
            state: victim.state || complaint.victimState,
            aadhaar: victim.aadhaar,
            registrationDate: victim.registrationDate
          }
        : {
            victimId: complaint.victimId || 'VIC-GEN-' + complaint.complaintId.slice(-4),
            name: complaint.victimName || 'Citizen Complainant',
            email: complaint.victimEmail || 'citizen@cybercrime.gov.in',
            mobile: complaint.victimMobile || '+91-9876543210',
            address: complaint.victimAddress || `${complaint.victimCity}, ${complaint.victimState}`,
            city: complaint.victimCity,
            state: complaint.victimState,
            registrationDate: complaint.createdAt
          },
      prediction,
      evidence,
      recovery,
      historicalSimilar,
      assignments,
      officers
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch investigation dossier: ' + err.message });
  }
});

// 7. Complaints: Create & Trigger Automatic Prediction
app.post('/api/complaints', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      complaintId,
      fraudType,
      amountLost,
      victimCity,
      victimState,
      transactionDate,
      transactionTime,
      bankName,
      accountNumber,
      upiId,
      transactionId,
      complaintDescription,
      priority
    } = req.body;

    if (!fraudType || !amountLost || !victimCity || !bankName || !complaintDescription) {
      return res.status(400).json({
        error: 'Missing required fields: fraudType, amountLost, victimCity, bankName, and complaintDescription are required.'
      });
    }

    const generatedId = complaintId?.trim() || `CC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newComplaint: ComplaintEntity = {
      complaintId: generatedId,
      fraudType,
      amountLost: Number(amountLost) || 0,
      victimCity: victimCity.trim(),
      victimState: victimState?.trim() || 'Maharashtra',
      transactionDate: transactionDate || new Date().toISOString().split('T')[0],
      transactionTime: transactionTime || new Date().toTimeString().slice(0, 5),
      bankName: bankName.trim(),
      accountNumber: accountNumber?.trim() || 'NOT_SPECIFIED',
      upiId: upiId?.trim() || '',
      transactionId: transactionId?.trim() || `TXN-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
      complaintDescription: complaintDescription.trim(),
      status: 'Analyzed',
      priority: (priority as any) || (Number(amountLost) > 200000 ? 'Critical' : 'High'),
      officerId: req.user!.userId,
      officerName: req.user!.name,
      createdAt: new Date().toISOString(),
      notes: [
        {
          id: 'note-init',
          author: req.user!.name,
          role: req.user!.role,
          text: `Complaint entered and predictive analytics pipeline executed.`,
          timestamp: new Date().toISOString()
        }
      ]
    };

    // Save complaint
    db.createComplaint(newComplaint);

    // Retrieve historical cases to feed into predictive engine
    const historicalCases = db.getHistoricalCases();

    // Run Predictive Analytics Engine
    const prediction = await analyzeAndPredictCybercrime(newComplaint, historicalCases);
    db.savePrediction(prediction);

    // Auto-generate Intelligence Report
    const newReport: ReportEntity = {
      reportId: `REP-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      complaintId: newComplaint.complaintId,
      title: `TACTICAL CASH-OUT WITHDRAWAL INTELLIGENCE: ${newComplaint.complaintId}`,
      reportSummary: `Predictive forecast for ${newComplaint.fraudType} complaint of ₹${newComplaint.amountLost.toLocaleString('en-IN')}. Highest withdrawal vulnerability identified in ${prediction.topPredictedZones[0]?.zoneName || 'primary zone'} (${prediction.topPredictedZones[0]?.probability || 85}%).`,
      riskScore: prediction.riskScore,
      riskLevel: prediction.riskLevel,
      confidenceScore: prediction.confidenceScore,
      scamClassification: prediction.scamClassification,
      patternAnalysis: prediction.patternAnalysis,
      topPredictedZones: prediction.topPredictedZones,
      investigationRecommendations: prediction.investigationRecommendations,
      generatedAt: new Date().toISOString(),
      generatedBy: req.user!.name,
      officerOrganization: req.user!.organization
    };
    db.saveReport(newReport);

    // Log action
    db.addLog({
      userId: req.user!.userId,
      userName: req.user!.name,
      userRole: req.user!.role,
      action: 'COMPLAINT_ANALYZED',
      details: `Complaint ${newComplaint.complaintId} processed. Predicted high-risk zones: ${prediction.topPredictedZones.map((z) => z.zoneName).join(', ')}`,
      ipAddress: req.ip || '127.0.0.1'
    });

    // Add alert notification
    db.addNotification({
      title: `High Risk Withdrawal Forecast: ${newComplaint.complaintId}`,
      message: `${prediction.topPredictedZones[0]?.zoneName} forecast at ${prediction.topPredictedZones[0]?.probability}% probability. Estimated cash-out: ${prediction.topPredictedZones[0]?.estimatedTimeframe}.`,
      type: prediction.riskLevel === 'High' ? 'alert' : 'warning',
      complaintId: newComplaint.complaintId
    });

    res.status(201).json({
      complaint: newComplaint,
      prediction,
      report: newReport
    });
  } catch (err: any) {
    console.error('Complaint creation error:', err);
    res.status(500).json({ error: 'Failed to process complaint: ' + err.message });
  }
});

// 8. Complaints: Add Note / Update Status / Priority / Recovery
app.patch('/api/complaints/:id/status', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { status, noteText, priority, amountFrozen, amountRecovered } = req.body;
    const complaint = db.getComplaintById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found.' });
    }

    const updates: Partial<ComplaintEntity> = {};
    if (status) updates.status = status;
    if (priority) updates.priority = priority;
    if (amountFrozen !== undefined) updates.amountFrozen = Number(amountFrozen);
    if (amountRecovered !== undefined) updates.amountRecovered = Number(amountRecovered);

    if (noteText) {
      const notes = [...(complaint.notes || [])];
      notes.push({
        id: 'note-' + Date.now(),
        author: req.user!.name,
        role: req.user!.role,
        text: noteText,
        timestamp: new Date().toISOString()
      });
      updates.notes = notes;
    }

    // Advance timeline if present
    if (complaint.timeline && complaint.timeline.length > 0 && status) {
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      const timeStr = now.toTimeString().slice(0, 5);
      const updatedTimeline = complaint.timeline.map((stage) => {
        let isMatch = false;
        if ((status === 'Submitted' || status === 'New') && stage.stage === 1) isMatch = true;
        else if ((status === 'Under Review' || status === 'Under Verification') && stage.stage <= 2) isMatch = true;
        else if (status === 'Prediction Generated' && stage.stage <= 3) isMatch = true;
        else if (status === 'Officer Assigned' && stage.stage <= 4) isMatch = true;
        else if ((status === 'Investigation Started' || status === 'Under Investigation' || status === 'Account Under Surveillance') && stage.stage <= 5) isMatch = true;
        else if ((status === 'Bank Freeze Requested' || status === 'Bank Freeze Sent') && stage.stage <= 6) isMatch = true;
        else if ((status === 'Recovery In Progress' || status === 'Recovery Processing' || status === 'Partially Recovered' || status === 'Fully Recovered') && stage.stage <= 7) isMatch = true;
        else if ((status === 'Case Closed' || status === 'Resolved') && stage.stage <= 8) isMatch = true;

        if (isMatch) {
          return {
            ...stage,
            status: 'completed' as const,
            date: stage.date === 'Pending' ? dateStr : stage.date,
            time: stage.time === '--:--' ? timeStr : stage.time,
            assignedOfficer: stage.assignedOfficer || req.user!.name
          };
        }
        return stage;
      });
      updates.timeline = updatedTimeline;
    }

    const updated = db.updateComplaint(complaint.complaintId, updates);

    // Sync recovery status entity if exists
    if (amountFrozen !== undefined || amountRecovered !== undefined) {
      const rec = db.getRecoveryByComplaintId(complaint.complaintId);
      if (rec) {
        const frozenVal = amountFrozen !== undefined ? Number(amountFrozen) : rec.amountFrozen;
        const recoveredVal = amountRecovered !== undefined ? Number(amountRecovered) : rec.amountRecovered;
        const recPct = rec.amountLost > 0 ? Math.min(100, Math.round((recoveredVal / rec.amountLost) * 100)) : 0;
        db.saveRecoveryStatus({
          ...rec,
          amountFrozen: frozenVal,
          amountRecovered: recoveredVal,
          recoveryPercentage: recPct,
          status: recoveredVal >= rec.amountLost ? 'Recovered' : recoveredVal > 0 ? 'Partial' : 'Pending',
          updatedAt: new Date().toISOString()
        });
      }
    }

    // Send real-time notification to victim if victimId is attached
    if (complaint.victimId) {
      let notifType: 'accepted' | 'officer_assigned' | 'freeze_sent' | 'prediction_ready' | 'investigation' | 'recovery' | 'closed' | 'info' = 'investigation';
      if (status?.includes('Freeze')) notifType = 'freeze_sent';
      else if (status?.includes('Officer')) notifType = 'officer_assigned';
      else if (status?.includes('Recovery')) notifType = 'recovery';
      else if (status?.includes('Closed') || status === 'Resolved') notifType = 'closed';

      db.addVictimNotification({
        victimId: complaint.victimId,
        complaintId: complaint.complaintId,
        title: `Status Update: ${status || 'Case Progression'}`,
        message: noteText ? `Officer Note: "${noteText}"` : `Your complaint ${complaint.complaintId} status has been updated to "${status}".`,
        type: notifType
      });
    }

    db.addLog({
      userId: req.user!.userId,
      userName: req.user!.name,
      userRole: req.user!.role,
      action: 'COMPLAINT_STATUS_UPDATED',
      details: `Case ${complaint.complaintId} updated: Status = ${status || 'unchanged'}, Priority = ${priority || 'unchanged'}`,
      ipAddress: req.ip || '127.0.0.1'
    });

    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update complaint: ' + err.message });
  }
});

// 8b. Complaints: Assign Officer
app.post('/api/complaints/:id/assign', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { officerId, officerName, designation, organization, contact, badgeNumber, instructions } = req.body;
    const complaint = db.getComplaintById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found.' });
    }

    if (!officerName) {
      return res.status(400).json({ error: 'Officer name is required for assignment.' });
    }

    const assignedOfficer = {
      id: officerId || 'usr-off-' + Date.now(),
      name: officerName,
      designation: designation || 'Investigating Officer',
      organization: organization || 'Cyber Crime Division, MHA / I4C Unit',
      contact: contact || '+91-11-2343-8000',
      badgeNumber: badgeNumber || 'I4C-' + Math.floor(1000 + Math.random() * 9000),
      assignedAt: new Date().toISOString()
    };

    // Record assignment entity
    db.createAssignment({
      assignmentId: `asgn-${Date.now()}`,
      complaintId: complaint.complaintId,
      officerId: assignedOfficer.id,
      officerName: assignedOfficer.name,
      designation: assignedOfficer.designation,
      organization: assignedOfficer.organization,
      badgeNumber: assignedOfficer.badgeNumber,
      assignedBy: req.user!.name,
      assignedAt: new Date().toISOString(),
      instructions: instructions || 'Priority investigation and interdiction assigned.'
    });

    // Update complaint
    const notes = [...(complaint.notes || [])];
    notes.push({
      id: 'note-' + Date.now(),
      author: req.user!.name,
      role: req.user!.role,
      text: `Case officially assigned to ${assignedOfficer.name} (${assignedOfficer.designation}, ${assignedOfficer.organization}). ${instructions ? `Instructions: "${instructions}"` : ''}`,
      timestamp: new Date().toISOString()
    });

    const updates: Partial<ComplaintEntity> = {
      officerId: assignedOfficer.id,
      officerName: assignedOfficer.name,
      assignedOfficer,
      status: complaint.status === 'Submitted' || complaint.status === 'New' || complaint.status === 'Under Review' ? 'Officer Assigned' : complaint.status,
      notes
    };

    // Update timeline
    if (complaint.timeline && complaint.timeline.length > 0) {
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      const timeStr = now.toTimeString().slice(0, 5);
      updates.timeline = complaint.timeline.map((s) => {
        if (s.stage <= 4) {
          return {
            ...s,
            status: 'completed' as const,
            date: s.date === 'Pending' ? dateStr : s.date,
            time: s.time === '--:--' ? timeStr : s.time,
            assignedOfficer: assignedOfficer.name
          };
        }
        if (s.stage === 5 && s.status === 'pending') {
          return { ...s, assignedOfficer: assignedOfficer.name };
        }
        return s;
      });
    }

    const updated = db.updateComplaint(complaint.complaintId, updates);

    // Notify victim
    if (complaint.victimId) {
      db.addVictimNotification({
        victimId: complaint.victimId,
        complaintId: complaint.complaintId,
        title: 'Investigating Officer Assigned',
        message: `${assignedOfficer.name} (${assignedOfficer.designation}, ${assignedOfficer.organization}) has been assigned to investigate your complaint ${complaint.complaintId}.`,
        type: 'officer_assigned'
      });
    }

    db.addLog({
      userId: req.user!.userId,
      userName: req.user!.name,
      userRole: req.user!.role,
      action: 'OFFICER_ASSIGNED',
      details: `Officer ${assignedOfficer.name} assigned to case ${complaint.complaintId}`,
      ipAddress: req.ip || '127.0.0.1'
    });

    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to assign officer: ' + err.message });
  }
});

// 8c. Officers: List Available Investigators
app.get('/api/officers', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const allUsers = db.getAllUsers();
    const officers = allUsers.map((u) => ({
      id: u.userId,
      name: u.name,
      email: u.email,
      role: u.role,
      designation: u.role === 'admin' ? 'Supervisory Deputy Commissioner' : 'Inspector of Police',
      organization: u.organization || 'Special Cyber Crime Cell, MHA / I4C Unit',
      badgeNumber: 'I4C-' + u.userId.slice(-4).toUpperCase(),
      contact: '+91-11-2343-8000'
    }));

    // Add standard roster officers if users list is small
    const roster = [
      {
        id: 'usr-off-001',
        name: 'Insp. Vikram Rathore',
        email: 'vikram.rathore@mha.gov.in',
        role: 'Officer',
        designation: 'Senior Cyber Fraud Investigator',
        organization: 'Special Cyber Crime Cell, MHA / I4C Unit',
        badgeNumber: 'I4C-9421',
        contact: '+91-11-2343-8000'
      },
      {
        id: 'usr-off-002',
        name: 'DSP Ananya Sharma',
        email: 'ananya.sharma@mha.gov.in',
        role: 'Officer',
        designation: 'Deputy Superintendent of Police (Cyber Intelligence)',
        organization: 'National Cyber Financial Crime Reporting Unit',
        badgeNumber: 'I4C-8134',
        contact: '+91-11-2343-8002'
      },
      {
        id: 'usr-off-003',
        name: 'Insp. Rajesh Kulkarni',
        email: 'rajesh.k@mha.gov.in',
        role: 'Officer',
        designation: 'ATM Network Surveillance Officer',
        organization: 'Western Regional Interception Command',
        badgeNumber: 'I4C-7612',
        contact: '+91-22-2654-1930'
      },
      {
        id: 'usr-off-004',
        name: 'Sub-Insp. Priya Deshmukh',
        email: 'priya.deshmukh@mha.gov.in',
        role: 'Officer',
        designation: 'Financial Trail & UPI Liaison Specialist',
        organization: 'National Cybercrime Threat Analytics Unit',
        badgeNumber: 'I4C-6089',
        contact: '+91-11-2343-8005'
      }
    ];

    // Combine unique
    const officerMap = new Map<string, any>();
    [...officers, ...roster].forEach((o) => {
      if (!officerMap.has(o.name)) {
        officerMap.set(o.name, o);
      }
    });

    res.json(Array.from(officerMap.values()));
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve officers: ' + err.message });
  }
});

// 9. Predictions: List
app.get('/api/predictions', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const predictions = db.getPredictions();
    res.json(predictions);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve predictions: ' + err.message });
  }
});

// 10. Predictions: Re-run or Generate for Complaint
app.post('/api/predictions/generate', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { complaintId } = req.body;
    const complaint = db.getComplaintById(complaintId);
    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found.' });
    }

    const historicalCases = db.getHistoricalCases();
    const prediction = await analyzeAndPredictCybercrime(complaint, historicalCases);
    db.savePrediction(prediction);

    db.addLog({
      userId: req.user!.userId,
      userName: req.user!.name,
      userRole: req.user!.role,
      action: 'PREDICTION_REGENERATED',
      details: `Predictive model re-executed for ${complaintId}`,
      ipAddress: req.ip || '127.0.0.1'
    });

    res.json(prediction);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to generate prediction: ' + err.message });
  }
});

// 11. Historical Cases: List
app.get('/api/historical-cases', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const cases = db.getHistoricalCases();
    res.json(cases);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve historical cases: ' + err.message });
  }
});

// 12. Historical Cases: Create Single
app.post('/api/historical-cases', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { fraudType, amount, victimLocation, withdrawalLocation, timestamp, bank, notes } = req.body;

    if (!fraudType || !amount || !victimLocation?.city || !withdrawalLocation?.name || !bank) {
      return res.status(400).json({
        error: 'Required fields missing: fraudType, amount, victimLocation, withdrawalLocation, and bank are mandatory.'
      });
    }

    const newCase: HistoricalCaseEntity = {
      caseId: `HIST-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      fraudType,
      amount: Number(amount) || 0,
      victimLocation: {
        city: victimLocation.city,
        state: victimLocation.state || 'Maharashtra',
        lat: Number(victimLocation.lat) || 19.076,
        lng: Number(victimLocation.lng) || 72.877
      },
      withdrawalLocation: {
        name: withdrawalLocation.name,
        city: withdrawalLocation.city || victimLocation.city,
        state: withdrawalLocation.state || victimLocation.state || 'Maharashtra',
        lat: Number(withdrawalLocation.lat) || 19.119,
        lng: Number(withdrawalLocation.lng) || 72.846,
        cluster: withdrawalLocation.cluster || `${withdrawalLocation.city || 'Regional'} Cluster`
      },
      timestamp: timestamp || new Date().toISOString(),
      bank,
      notes: notes || ''
    };

    db.createHistoricalCase(newCase);

    db.addLog({
      userId: req.user!.userId,
      userName: req.user!.name,
      userRole: req.user!.role,
      action: 'HISTORICAL_CASE_ADDED',
      details: `Added historical case ${newCase.caseId} (${newCase.fraudType} - ₹${newCase.amount})`,
      ipAddress: req.ip || '127.0.0.1'
    });

    res.status(201).json(newCase);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to add historical case: ' + err.message });
  }
});

// 13. Historical Cases: Bulk Import (CSV / JSON)
app.post('/api/historical-cases/import', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { items } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Invalid payload: Array of historical cases required.' });
    }

    const sanitized: HistoricalCaseEntity[] = items.map((item, idx) => ({
      caseId: item.caseId || `HIST-${Date.now()}-${idx}`,
      fraudType: item.fraudType || 'UPI Fraud',
      amount: Number(item.amount) || 50000,
      victimLocation: {
        city: item.victimLocation?.city || item.victimCity || 'Mumbai',
        state: item.victimLocation?.state || item.victimState || 'Maharashtra',
        lat: Number(item.victimLocation?.lat) || 19.076,
        lng: Number(item.victimLocation?.lng) || 72.877
      },
      withdrawalLocation: {
        name: item.withdrawalLocation?.name || item.withdrawalName || 'ATM Kiosk',
        city: item.withdrawalLocation?.city || item.withdrawalCity || 'Mumbai',
        state: item.withdrawalLocation?.state || item.withdrawalState || 'Maharashtra',
        lat: Number(item.withdrawalLocation?.lat) || 19.119,
        lng: Number(item.withdrawalLocation?.lng) || 72.846,
        cluster: item.withdrawalLocation?.cluster || item.cluster || `${item.withdrawalCity || 'City'} Cluster`
      },
      timestamp: item.timestamp || new Date().toISOString(),
      bank: item.bank || 'State Bank of India',
      notes: item.notes || 'Imported historical dataset record'
    }));

    const count = db.importHistoricalCases(sanitized);

    db.addLog({
      userId: req.user!.userId,
      userName: req.user!.name,
      userRole: req.user!.role,
      action: 'HISTORICAL_CASES_IMPORTED',
      details: `Imported ${count} historical fraud cases into model dataset.`,
      ipAddress: req.ip || '127.0.0.1'
    });

    res.json({ success: true, count, total: db.getHistoricalCases().length });
  } catch (err: any) {
    res.status(500).json({ error: 'Bulk import failed: ' + err.message });
  }
});

// 14. Reports: List
app.get('/api/reports', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const reports = db.getReports();
    res.json(reports);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve reports: ' + err.message });
  }
});

// 15. Reports: Get by ID
app.get('/api/reports/:id', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const report = db.getReportById(req.params.id);
  if (!report) {
    return res.status(404).json({ error: 'Intelligence report not found.' });
  }
  res.json(report);
});

// 16. Analytics: Fraud Type Distribution, Withdrawal Hotspots, Historical Fraud Trends
app.get('/api/analytics', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const stats = db.getStats();
    res.json(stats);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to generate analytics: ' + err.message });
  }
});

// 17. Tactical Dispatch Alert
app.post('/api/interventions/dispatch', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { complaintId, zoneName, atmName, policeStation, urgency } = req.body;

    db.addNotification({
      title: `TACTICAL PATROL DISPATCHED: ${zoneName || 'Target Zone'}`,
      message: `Squad alert transmitted to ${policeStation || 'Local Police Station'}. Target: ${atmName || zoneName}. Urgency: ${urgency || 'HIGH'}.`,
      type: 'alert',
      complaintId
    });

    if (complaintId) {
      db.updateComplaint(complaintId, { status: 'Patrol Dispatched' });
    }

    db.addLog({
      userId: req.user!.userId,
      userName: req.user!.name,
      userRole: req.user!.role,
      action: 'TACTICAL_PATROL_DISPATCH',
      details: `Dispatched interception alert for ${zoneName} (${atmName || 'Cluster ATM'}) to ${policeStation || 'HQ'}`,
      ipAddress: req.ip || '127.0.0.1'
    });

    res.json({
      success: true,
      message: `Tactical patrol alert transmitted to ${policeStation || 'Zone Cyber Control'}. Beat units deployed.`
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Dispatch transmission failed: ' + err.message });
  }
});

// 18. Activity Logs & Notifications
app.get('/api/notifications', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const notifs = db.getNotifications(req.user!.userId);
  res.json(notifs);
});

app.patch('/api/notifications/:id/read', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  db.markNotificationAsRead(req.params.id);
  res.json({ success: true });
});

app.get('/api/logs', authenticateToken, requireRole(['admin']), (req: AuthenticatedRequest, res: Response) => {
  const logs = db.getLogs(100);
  res.json(logs);
});

// ----------------------------------------------------
// CITIZEN / VICTIM PORTAL API ENDPOINTS
// ----------------------------------------------------

// V1. Victim Auth: Register
app.post('/api/victim/auth/register', (req: Request, res: Response) => {
  try {
    const { name, mobile, email, password, aadhaar, address, city, state } = req.body;

    if (!name || !mobile || !email || !password) {
      return res.status(400).json({ error: 'Name, Mobile Number, Email, and Password are required.' });
    }

    if (db.findVictimByEmail(email)) {
      return res.status(400).json({ error: 'A citizen account with this email address already exists.' });
    }

    if (db.findVictimByMobile(mobile)) {
      return res.status(400).json({ error: 'A citizen account with this mobile number already exists.' });
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);
    const victimId = 'VIC-2025-' + Math.floor(1000 + Math.random() * 9000);

    const newVictim: VictimEntity = {
      victimId,
      name,
      mobile,
      email,
      passwordHash,
      aadhaar: aadhaar || undefined,
      address: address || 'Not Provided',
      city: city || 'Mumbai',
      state: state || 'Maharashtra',
      registrationDate: new Date().toISOString()
    };

    db.createVictim(newVictim);

    // Initial welcome notification
    db.addVictimNotification({
      victimId,
      title: 'Citizen Account Registered',
      message: 'Welcome to the National Cyber Crime Reporting Portal (MHA / I4C). Your citizen profile is active.',
      type: 'info'
    });

    const token = jwt.sign(
      {
        victimId: newVictim.victimId,
        name: newVictim.name,
        email: newVictim.email,
        mobile: newVictim.mobile,
        role: 'victim'
      },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    const { passwordHash: _, ...safeVictim } = newVictim;
    res.status(201).json({ victim: safeVictim, token });
  } catch (err: any) {
    res.status(500).json({ error: 'Registration failed: ' + err.message });
  }
});

// V2. Victim Auth: Login
app.post('/api/victim/auth/login', (req: Request, res: Response) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ error: 'Email/Mobile and password are required.' });
    }

    const victim = db.findVictimByEmail(identifier) || db.findVictimByMobile(identifier);
    if (!victim) {
      return res.status(401).json({ error: 'Invalid credentials. No citizen account found.' });
    }

    const isMatch = bcrypt.compareSync(password, victim.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials. Password does not match.' });
    }

    const token = jwt.sign(
      {
        victimId: victim.victimId,
        name: victim.name,
        email: victim.email,
        mobile: victim.mobile,
        role: 'victim'
      },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    const { passwordHash: _, ...safeVictim } = victim;
    res.json({ victim: safeVictim, token });
  } catch (err: any) {
    res.status(500).json({ error: 'Login failed: ' + err.message });
  }
});

// V3. Victim Auth: Send OTP
app.post('/api/victim/auth/send-otp', (req: Request, res: Response) => {
  try {
    const { identifier } = req.body;
    if (!identifier) {
      return res.status(400).json({ error: 'Mobile number or email is required to dispatch OTP.' });
    }

    const victim = db.findVictimByEmail(identifier) || db.findVictimByMobile(identifier);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    if (victim) {
      db.updateVictim(victim.victimId, {
        otpCode: otp,
        otpExpiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString()
      });
    }

    res.json({
      success: true,
      message: `6-Digit OTP successfully transmitted to ${identifier}`,
      demoOtp: otp
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to send OTP: ' + err.message });
  }
});

// V4. Victim Auth: Verify OTP Login
app.post('/api/victim/auth/verify-otp-login', (req: Request, res: Response) => {
  try {
    const { identifier, otp } = req.body;
    if (!identifier || !otp) {
      return res.status(400).json({ error: 'Identifier and OTP code are required.' });
    }

    const victim = db.findVictimByEmail(identifier) || db.findVictimByMobile(identifier);
    if (!victim) {
      return res.status(404).json({ error: 'No citizen account registered with this email/mobile.' });
    }

    // Check OTP (accept simulated demo OTP 193001 or stored otpCode)
    const validOtp = otp === '193001' || (victim.otpCode && victim.otpCode === otp.trim());
    if (!validOtp) {
      return res.status(400).json({ error: 'Invalid or expired OTP code. Please try again.' });
    }

    // Clear OTP
    db.updateVictim(victim.victimId, { otpCode: undefined, otpExpiresAt: undefined });

    const token = jwt.sign(
      {
        victimId: victim.victimId,
        name: victim.name,
        email: victim.email,
        mobile: victim.mobile,
        role: 'victim'
      },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    const { passwordHash: _, ...safeVictim } = victim;
    res.json({ victim: safeVictim, token });
  } catch (err: any) {
    res.status(500).json({ error: 'OTP verification failed: ' + err.message });
  }
});

// V5. Victim Auth: Forgot Password
app.post('/api/victim/auth/forgot-password', (req: Request, res: Response) => {
  try {
    const { identifier, otp, newPassword } = req.body;
    if (!identifier || !otp || !newPassword) {
      return res.status(400).json({ error: 'Identifier, OTP, and new password are required.' });
    }

    const victim = db.findVictimByEmail(identifier) || db.findVictimByMobile(identifier);
    if (!victim) {
      return res.status(404).json({ error: 'No citizen account found with this identifier.' });
    }

    const validOtp = otp === '193001' || (victim.otpCode && victim.otpCode === otp.trim());
    if (!validOtp) {
      return res.status(400).json({ error: 'Invalid or expired OTP code.' });
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(newPassword, salt);
    db.updateVictim(victim.victimId, { passwordHash, otpCode: undefined, otpExpiresAt: undefined });

    res.json({
      success: true,
      message: 'Password reset successfully. You can now login with your new credentials.'
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Password reset failed: ' + err.message });
  }
});

// V6. Victim Auth: Get Profile
app.get('/api/victim/auth/me', authenticateVictimToken, (req: AuthenticatedVictimRequest, res: Response) => {
  const victim = db.findVictimById(req.victim!.victimId);
  if (!victim) {
    return res.status(404).json({ error: 'Citizen record not found.' });
  }
  const { passwordHash: _, ...safeVictim } = victim;
  res.json({ victim: safeVictim });
});

// V7. Victim Dashboard: Overview Stats & Quick Summaries
app.get('/api/victim/dashboard', authenticateVictimToken, (req: AuthenticatedVictimRequest, res: Response) => {
  try {
    const victimId = req.victim!.victimId;
    const stats = db.getVictimStats(victimId);
    const complaints = db.getVictimComplaints(victimId);
    const notifications = db.getVictimNotifications(victimId);

    res.json({
      stats,
      recentComplaints: complaints.slice(0, 5),
      notifications: notifications.slice(0, 5)
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch victim dashboard: ' + err.message });
  }
});

// V8. Victim Complaints: List
app.get('/api/victim/complaints', authenticateVictimToken, (req: AuthenticatedVictimRequest, res: Response) => {
  try {
    const list = db.getVictimComplaints(req.victim!.victimId);
    res.json(list);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve filed complaints: ' + err.message });
  }
});

// V9. Victim Complaints: Get Single with Timeline, Evidence, and Recovery Details
app.get('/api/victim/complaints/:id', authenticateVictimToken, (req: AuthenticatedVictimRequest, res: Response) => {
  try {
    const complaint = db.getVictimComplaintById(req.params.id);
    if (!complaint || complaint.victimId !== req.victim!.victimId) {
      return res.status(404).json({ error: 'Complaint record not found or access denied.' });
    }

    const evidence = db.getVictimEvidence(req.victim!.victimId, complaint.complaintId);
    const recovery = db.getRecoveryByComplaintId(complaint.complaintId);
    const prediction = complaint.predictionId ? db.getPredictions().find((p) => p.predictionId === complaint.predictionId) : undefined;

    res.json({
      complaint,
      evidence,
      recovery,
      prediction
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve complaint dossier: ' + err.message });
  }
});

// V10. Victim Complaints: File New Complaint
app.post('/api/victim/complaints', authenticateVictimToken, async (req: AuthenticatedVictimRequest, res: Response) => {
  try {
    const victimId = req.victim!.victimId;
    const victim = db.findVictimById(victimId);

    const {
      fraudType,
      amountLost,
      bankName,
      accountNumber,
      upiId,
      transactionId,
      transactionDate,
      transactionTime,
      complaintDescription,
      evidenceFiles
    } = req.body;

    if (!fraudType || !amountLost || !bankName || !complaintDescription) {
      return res.status(400).json({ error: 'Fraud Type, Amount Lost, Bank Name, and Incident Description are required.' });
    }

    const parsedAmount = Number(amountLost);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ error: 'Amount lost must be a valid positive number.' });
    }

    const complaintId = 'NCRP-2025-' + Math.floor(1000 + Math.random() * 9000);
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().slice(0, 5);

    // Initial 8-Stage Visual Timeline
    const initialTimeline: ComplaintTimelineStage[] = [
      {
        stage: 1,
        title: 'Complaint Submitted',
        date: dateStr,
        time: timeStr,
        status: 'completed',
        assignedOfficer: 'Portal System Gateway',
        description: 'Complaint registered online via National Cyber Crime Reporting Portal. Immediate FIR intake confirmed.'
      },
      {
        stage: 2,
        title: 'Under Review',
        date: dateStr,
        time: timeStr,
        status: 'completed',
        assignedOfficer: 'Insp. Vikram Rathore',
        description: 'Transaction UTR matched with Bank Nodal Cyber Cell database. Preliminary financial routing authenticated.'
      },
      {
        stage: 3,
        title: 'Prediction Generated',
        date: dateStr,
        time: timeStr,
        status: 'completed',
        assignedOfficer: 'AI Prediction Core (MHA-I4C)',
        description: 'Machine learning cash-out forecast calculated withdrawal probabilities across regional ATM clusters.'
      },
      {
        stage: 4,
        title: 'Officer Assigned',
        date: dateStr,
        time: timeStr,
        status: 'completed',
        assignedOfficer: 'Insp. Vikram Rathore',
        description: 'Assigned to Insp. Vikram Rathore, Special Cyber Crime Cell, MHA / I4C Unit for priority investigation.'
      },
      {
        stage: 5,
        title: 'Investigation Started',
        date: dateStr,
        time: timeStr,
        status: 'current',
        assignedOfficer: 'Insp. Vikram Rathore',
        description: 'Law enforcement field teams and ATM surveillance units mobilized.'
      },
      {
        stage: 6,
        title: 'Bank Freeze Requested',
        date: 'Pending',
        time: '--:--',
        status: 'pending',
        assignedOfficer: 'Insp. Vikram Rathore',
        description: 'Automated 1930 liaison notice transmitted to beneficiary banks under Section 91 CrPC for emergency lien.'
      },
      {
        stage: 7,
        title: 'Recovery In Progress',
        date: 'Pending',
        time: '--:--',
        status: 'pending',
        description: 'Inter-bank fund reversal and judicial restitution procedures.'
      },
      {
        stage: 8,
        title: 'Case Closed',
        date: 'Pending',
        time: '--:--',
        status: 'pending',
        description: 'Formal restitution of funds and judicial closure.'
      }
    ];

    // Create Victim Complaint Entity
    const newVictimComplaint: VictimComplaintEntity = {
      complaintId,
      victimId,
      victimName: victim?.name || req.victim!.name,
      victimMobile: victim?.mobile || req.victim!.mobile,
      fraudType,
      amountLost: parsedAmount,
      bankName,
      accountNumber: accountNumber || 'Not Provided',
      upiId: upiId || 'Not Provided',
      transactionId: transactionId || 'UTR-' + Date.now().toString().slice(-8),
      transactionDate: transactionDate || dateStr,
      transactionTime: transactionTime || timeStr,
      victimCity: victim?.city || 'Mumbai',
      victimState: victim?.state || 'Maharashtra',
      complaintDescription,
      status: 'Prediction Generated',
      assignedOfficer: {
        id: 'usr-off-001',
        name: 'Insp. Vikram Rathore',
        designation: 'Inspector of Police',
        organization: 'Special Cyber Crime Cell, MHA / I4C Unit',
        contact: '+91-11-2343-8000'
      },
      timeline: initialTimeline,
      amountFrozen: parsedAmount,
      amountRecovered: 0,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    };

    // Also register into Officer Intelligence Complaints Table
    const officerComplaint: ComplaintEntity = {
      complaintId,
      victimId,
      victimName: newVictimComplaint.victimName,
      victimMobile: newVictimComplaint.victimMobile,
      victimEmail: victim?.email || req.victim!.email,
      victimAddress: victim?.address || `${newVictimComplaint.victimCity}, ${newVictimComplaint.victimState}`,
      fraudType,
      amountLost: parsedAmount,
      victimCity: newVictimComplaint.victimCity,
      victimState: newVictimComplaint.victimState,
      bankName,
      accountNumber: newVictimComplaint.accountNumber,
      upiId: newVictimComplaint.upiId,
      transactionId: newVictimComplaint.transactionId,
      transactionDate: newVictimComplaint.transactionDate,
      transactionTime: newVictimComplaint.transactionTime,
      complaintDescription: `[Filer: ${newVictimComplaint.victimName}, Mob: ${newVictimComplaint.victimMobile}] ${complaintDescription}`,
      status: 'Prediction Generated',
      priority: parsedAmount > 100000 ? 'Critical' : parsedAmount > 30000 ? 'High' : 'Medium',
      officerId: 'usr-off-001',
      officerName: 'Insp. Vikram Rathore',
      assignedOfficer: newVictimComplaint.assignedOfficer,
      amountFrozen: parsedAmount,
      amountRecovered: 0,
      timeline: initialTimeline,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      notes: [
        {
          id: 'note-' + Date.now(),
          author: 'Insp. Vikram Rathore',
          role: 'Inspector of Police',
          text: `Citizen complaint logged via Citizen Portal by ${newVictimComplaint.victimName}. Transaction ID: ${newVictimComplaint.transactionId}. Automatic prediction generated.`,
          timestamp: now.toISOString()
        }
      ]
    };

    db.createComplaint(officerComplaint);

    // Run AI Prediction Engine automatically!
    const historical = db.getHistoricalCases();
    const prediction = await analyzeAndPredictCybercrime(officerComplaint, historical);
    db.savePrediction(prediction);
    newVictimComplaint.predictionId = prediction.predictionId;

    // Save Victim Complaint
    db.createVictimComplaint(newVictimComplaint);

    // Create Initial Recovery Status
    const bankLienRef = `LIEN/${bankName.replace(/[^A-Za-z]/g, '').slice(0, 4).toUpperCase()}/2025/${Math.floor(10000 + Math.random() * 90000)}`;
    db.saveRecoveryStatus({
      recoveryId: `REC-${complaintId.slice(-4)}-01`,
      complaintId,
      victimId,
      amountLost: parsedAmount,
      amountFrozen: parsedAmount,
      amountRecovered: 0,
      recoveryPercentage: 0,
      bankLienReference: bankLienRef,
      status: 'Pending',
      timelineLogs: [
        {
          date: dateStr,
          time: timeStr,
          stage: 'Emergency Lien Notice Dispatched',
          note: `Section 91 CrPC freeze notice transmitted via 1930 National Cyber Financial Fraud switch to ${bankName}.`,
          authority: 'I4C 1930 Direct Inter-Bank Switch'
        }
      ],
      updatedAt: now.toISOString()
    });

    // Save any evidence files uploaded with the form
    if (Array.isArray(evidenceFiles) && evidenceFiles.length > 0) {
      for (let i = 0; i < evidenceFiles.length; i++) {
        const file = evidenceFiles[i];
        db.createVictimEvidence({
          evidenceId: `EVD-${complaintId.slice(-4)}-${i + 1}`,
          complaintId,
          victimId,
          fileName: file.fileName || `evidence_file_${i + 1}`,
          fileType: file.fileType || 'image',
          fileSize: file.fileSize || '1.2 MB',
          dataUrl: file.dataUrl || undefined,
          description: file.description || 'Uploaded during complaint registration',
          uploadedAt: now.toISOString()
        });
      }
    }

    // Send notifications to victim
    db.addVictimNotification({
      victimId,
      complaintId,
      title: 'Complaint Registered Successfully',
      message: `Your complaint ${complaintId} has been registered and tagged with high priority.`,
      type: 'accepted'
    });

    db.addVictimNotification({
      victimId,
      complaintId,
      title: 'Officer Assigned',
      message: 'Insp. Vikram Rathore (Special Cyber Crime Cell, MHA / I4C Unit) assigned as your Investigating Officer.',
      type: 'officer_assigned'
    });

    db.addVictimNotification({
      victimId,
      complaintId,
      title: 'Cash-Out Risk Prediction Generated',
      message: 'Withdrawal hotspots forecasted across ATM corridors to preempt cash extraction.',
      type: 'prediction_ready'
    });

    res.status(201).json({
      success: true,
      complaint: newVictimComplaint,
      prediction
    });
  } catch (err: any) {
    console.error('Error filing victim complaint:', err);
    res.status(500).json({ error: 'Failed to file complaint: ' + err.message });
  }
});

// V11. Victim Evidence: List
app.get('/api/victim/evidence', authenticateVictimToken, (req: AuthenticatedVictimRequest, res: Response) => {
  try {
    const complaintId = req.query.complaintId as string | undefined;
    const evidenceList = db.getVictimEvidence(req.victim!.victimId, complaintId);
    res.json(evidenceList);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve evidence: ' + err.message });
  }
});

// V12. Victim Evidence: Upload New Evidence
app.post('/api/victim/evidence', authenticateVictimToken, (req: AuthenticatedVictimRequest, res: Response) => {
  try {
    const { complaintId, fileName, fileType, fileSize, dataUrl, description } = req.body;

    if (!complaintId || !fileName) {
      return res.status(400).json({ error: 'Complaint ID and File Name are required.' });
    }

    const complaint = db.getVictimComplaintById(complaintId);
    if (!complaint || complaint.victimId !== req.victim!.victimId) {
      return res.status(404).json({ error: 'Invalid complaint ID or unauthorized.' });
    }

    const evidenceId = 'EVD-' + Math.floor(1000 + Math.random() * 9000);
    const item = db.createVictimEvidence({
      evidenceId,
      complaintId,
      victimId: req.victim!.victimId,
      fileName,
      fileType: fileType || 'image',
      fileSize: fileSize || '1.5 MB',
      dataUrl: dataUrl || undefined,
      description: description || 'Digital artifact supporting cybercrime complaint',
      uploadedAt: new Date().toISOString()
    });

    res.status(201).json({ success: true, evidence: item });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to upload evidence: ' + err.message });
  }
});

// V13. Victim Evidence: Delete
app.delete('/api/victim/evidence/:id', authenticateVictimToken, (req: AuthenticatedVictimRequest, res: Response) => {
  try {
    const success = db.deleteVictimEvidence(req.params.id, req.victim!.victimId);
    if (!success) {
      return res.status(404).json({ error: 'Evidence item not found or unauthorized.' });
    }
    res.json({ success: true, message: 'Evidence file deleted successfully.' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to delete evidence: ' + err.message });
  }
});

// V14. Victim Recovery Status
app.get('/api/victim/recovery', authenticateVictimToken, (req: AuthenticatedVictimRequest, res: Response) => {
  try {
    const complaintId = req.query.complaintId as string | undefined;
    const recoveryList = db.getRecoveryStatus(req.victim!.victimId, complaintId);
    res.json(recoveryList);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve recovery status: ' + err.message });
  }
});

// V15. Victim Notifications
app.get('/api/victim/notifications', authenticateVictimToken, (req: AuthenticatedVictimRequest, res: Response) => {
  try {
    const notifs = db.getVictimNotifications(req.victim!.victimId);
    res.json(notifs);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve notifications: ' + err.message });
  }
});

app.patch('/api/victim/notifications/:id/read', authenticateVictimToken, (req: AuthenticatedVictimRequest, res: Response) => {
  db.markVictimNotificationRead(req.params.id, req.victim!.victimId);
  res.json({ success: true });
});

app.post('/api/victim/notifications/read-all', authenticateVictimToken, (req: AuthenticatedVictimRequest, res: Response) => {
  db.markAllVictimNotificationsRead(req.victim!.victimId);
  res.json({ success: true });
});

// V16. Victim AI Cyber Advisor (Gemini) - Standard REST endpoint (cached <1s, Gemini <3s)
app.post('/api/victim/ai-assistant', optionalVictimToken, async (req: AuthenticatedVictimRequest, res: Response) => {
  try {
    const { question, complaintId } = req.body;

    if (!question || typeof question !== 'string') {
      return res.status(400).json({ error: 'A question string is required.' });
    }

    let complaintContext: any = undefined;
    if (complaintId) {
      const c = db.getVictimComplaintById(complaintId);
      if (c && (!req.victim || c.victimId === req.victim.victimId)) {
        complaintContext = {
          complaintId: c.complaintId,
          fraudType: c.fraudType,
          amountLost: c.amountLost,
          bankName: c.bankName,
          status: c.status
        };
      }
    }

    const adviceResult = await generateVictimAiAdvice(question, complaintContext);
    res.json(adviceResult);
  } catch (err: any) {
    console.error('Error in victim AI advisor:', err);
    res.status(500).json({ error: 'AI advisor service error: ' + err.message });
  }
});

// V17. Victim AI Cyber Advisor - Streaming SSE endpoint for real-time token rendering
app.post('/api/victim/ai-assistant/stream', optionalVictimToken, async (req: AuthenticatedVictimRequest, res: Response) => {
  try {
    const { question, complaintId } = req.body;

    if (!question || typeof question !== 'string') {
      return res.status(400).json({ error: 'A question string is required.' });
    }

    let complaintContext: any = undefined;
    if (complaintId) {
      const c = db.getVictimComplaintById(complaintId);
      if (c && (!req.victim || c.victimId === req.victim.victimId)) {
        complaintContext = {
          complaintId: c.complaintId,
          fraudType: c.fraudType,
          amountLost: c.amountLost,
          bankName: c.bankName,
          status: c.status
        };
      }
    }

    // Set Server-Sent Events headers
    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    for await (const event of generateVictimAiAdviceStream(question, complaintContext)) {
      res.write(`data: ${JSON.stringify(event)}\n\n`);
    }

    res.end();
  } catch (err: any) {
    console.error('Error in streaming AI advisor:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Streaming AI advisor service error: ' + err.message });
    } else {
      res.write(`data: ${JSON.stringify({ error: 'Streaming interrupted', done: true })}\n\n`);
      res.end();
    }
  }
});

// ----------------------------------------------------
// Vite & Static Asset Handling
// ----------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MHA Cybercrime Withdrawal Prediction Platform server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
