import React, { useState, useEffect } from 'react';
import { api } from '../supabase';
import { 
  ClipboardList, FileText, CheckCircle2, ChevronRight, 
  MapPin, Clock, Hammer, ShieldCheck, AlertTriangle
} from 'lucide-react';

export default function TechnicianPanel({ showToast }) {
  const [assignments, setAssignments] = useState([]);
  const [selectedAssign, setSelectedAssign] = useState(null);
  
  // Input fields for updating notes
  const [diagnosisNotes, setDiagnosisNotes] = useState('');
  const [repairNotes, setRepairNotes] = useState('');

  // Active technician (simulated as tech-user-1 for testing)
  const activeTechId = 'tech-user-1';

  const loadAssignments = async () => {
    try {
      const data = await api.assignments.list(activeTechId);
      setAssignments(data);
    } catch (err) {
      showToast('Error loading technician assignments', 'error');
    }
  };

  useEffect(() => {
    loadAssignments();
  }, []);

  const handleAcceptJob = async (assignmentId, bookingId) => {
    try {
      await api.assignments.update(assignmentId, { status: 'accepted' });
      // Move booking to Device Received (or Pickup Scheduled depending on flow, let's mark it as accepted assignment)
      showToast('Repair job accepted!', 'success');
      loadAssignments();
      
      // Update selected state
      setSelectedAssign(prev => ({
        ...prev,
        status: 'accepted'
      }));
    } catch (err) {
      showToast('Error accepting job', 'error');
    }
  };

  const handleSaveDiagnosis = async (e) => {
    e.preventDefault();
    if (!selectedAssign || !diagnosisNotes.trim()) return;
    try {
      // 1. Update assignment notes
      await api.assignments.update(selectedAssign.id, { 
        diagnosis_notes: diagnosisNotes 
      });

      // 2. Set booking status to Diagnosis Completed
      // In a real flow, this makes the booking "Waiting for Approval" on the customer's end once the actual price is set by Admin
      await api.bookings.update(selectedAssign.bookings.id, { 
        status: 'Diagnosis Completed' 
      });

      showToast('Diagnosis notes submitted! Waiting for price estimate input.', 'success');
      loadAssignments();
      
      setSelectedAssign(prev => ({
        ...prev,
        diagnosis_notes: diagnosisNotes,
        bookings: { ...prev.bookings, status: 'Diagnosis Completed' }
      }));
    } catch (err) {
      showToast('Failed to save diagnosis details', 'error');
    }
  };

  const handleUpdateRepairProgress = async (nextStatus) => {
    if (!selectedAssign) return;
    try {
      // Update notes
      await api.assignments.update(selectedAssign.id, { 
        repair_notes: repairNotes 
      });

      // Transition booking lifecycle status
      await api.bookings.update(selectedAssign.bookings.id, { 
        status: nextStatus 
      });

      showToast(`Progress status updated to: ${nextStatus}`, 'success');
      loadAssignments();

      setSelectedAssign(prev => ({
        ...prev,
        repair_notes: repairNotes,
        bookings: { ...prev.bookings, status: nextStatus }
      }));
    } catch (err) {
      showToast('Failed to update repair state', 'error');
    }
  };

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '24px' }}>
        <h1>Technician Workbench</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Inspect assigned devices, log diagnosis data, and record repair steps.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selectedAssign ? '1fr 1.2fr' : '1fr', gap: '20px' }}>
        
        {/* ASSIGNED JOBS LISTING */}
        <div className="glass-card">
          <h3 style={{ marginBottom: '16px' }}>Assigned Jobs Queue ({assignments.length})</h3>
          
          {assignments.length === 0 ? (
            <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>
              No active repair jobs assigned to your profile.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {assignments.map(assign => {
                const b = assign.bookings;
                const isSelected = selectedAssign?.id === assign.id;
                
                return (
                  <div 
                    key={assign.id}
                    className="glass-card"
                    style={{
                      padding: '16px', cursor: 'pointer',
                      borderColor: isSelected ? 'var(--primary)' : 'var(--border-glass)',
                      background: isSelected ? 'rgba(198, 255, 0, 0.02)' : 'rgba(255,255,255,0.01)'
                    }}
                    onClick={() => {
                      setSelectedAssign(assign);
                      setDiagnosisNotes(assign.diagnosis_notes || '');
                      setRepairNotes(assign.repair_notes || '');
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <strong style={{ fontSize: '1rem', color: 'white' }}>{b.booking_number}</strong>
                      <span className={`badge ${assign.status === 'pending' ? 'badge-pending' : 'badge-success'}`}>
                        {assign.status === 'pending' ? 'Pending Acceptance' : 'Active Job'}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      Device: <strong>{b.brands?.name} {b.device_types?.name}</strong>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--primary)', marginBottom: '8px' }}>
                      Problem: {b.problem_categories?.name}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-glass)', paddingTop: '8px' }}>
                      <span>Mode: {b.service_type.toUpperCase()}</span>
                      <span>Scheduled: {b.scheduled_date}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* WORK BENCH DETAILS INSPECTOR */}
        {selectedAssign && (
          <div className="glass-card animate-fade-in" style={{ alignSelf: 'start', position: 'sticky', top: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-glass)', paddingBottom: '15px', marginBottom: '20px' }}>
              <div>
                <span className="badge badge-info" style={{ marginBottom: '4px' }}>Booking: {selectedAssign.bookings.status}</span>
                <h2>Job Details - {selectedAssign.bookings.booking_number}</h2>
              </div>
              <button 
                onClick={() => setSelectedAssign(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem' }}
              >
                &times;
              </button>
            </div>

            {/* Accept Job button if pending */}
            {selectedAssign.status === 'pending' ? (
              <div style={{ textAlign: 'center', padding: '30px 10px' }} className="glass-card">
                <AlertTriangle size={36} color="var(--warning)" style={{ marginBottom: '10px' }} />
                <h3>New Job Assignment</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '8px 0 20px 0' }}>
                  Please review the device specifications and accept this ticket to start inspection.
                </p>
                <button 
                  className="btn btn-primary"
                  onClick={() => handleAcceptJob(selectedAssign.id, selectedAssign.bookings.id)}
                >
                  Accept & Inspect Device
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                {/* Device summary block */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', background: 'rgba(255,255,255,0.01)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Brand / Category</span>
                    <strong>{selectedAssign.bookings.brands?.name} {selectedAssign.bookings.device_types?.name}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Reported Problem</span>
                    <strong style={{ color: 'var(--primary)' }}>{selectedAssign.bookings.problem_categories?.name}</strong>
                  </div>
                </div>

                {/* 1. Diagnosis Section */}
                <div className="glass-card" style={{ background: 'rgba(255,255,255,0.01)' }}>
                  <h4 style={{ color: 'var(--secondary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}><ClipboardList size={16} /> Device Diagnosis</h4>
                  
                  {['Booking Received', 'Pickup Scheduled', 'Device Received'].includes(selectedAssign.bookings.status) ? (
                    <form onSubmit={handleSaveDiagnosis}>
                      <textarea
                        className="form-input"
                        rows="3"
                        placeholder="Log hardware diagnostic scan details, broken chips, or OS errors..."
                        value={diagnosisNotes}
                        onChange={e => setDiagnosisNotes(e.target.value)}
                        style={{ marginBottom: '12px', fontSize: '0.85rem' }}
                        required
                      />
                      <button type="submit" className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                        Submit Diagnosis Notes
                      </button>
                    </form>
                  ) : (
                    <div>
                      <p style={{ color: 'white', fontSize: '0.9rem', whiteSpace: 'pre-wrap', fontStyle: 'italic' }}>
                        "{selectedAssign.diagnosis_notes || 'No notes submitted.'}"
                      </p>
                      <span style={{ color: 'var(--success)', fontSize: '0.75rem', display: 'block', marginTop: '8px', fontWeight: 'bold' }}>✓ Diagnostic logs locked.</span>
                    </div>
                  )}
                </div>

                {/* 2. Repair Progress Section */}
                {['Waiting for Approval', 'Repair In Progress', 'Quality Check', 'Ready for Delivery', 'Delivered', 'Closed'].includes(selectedAssign.bookings.status) && (
                  <div className="glass-card" style={{ background: 'rgba(255,255,255,0.01)' }}>
                    <h4 style={{ color: 'var(--secondary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}><Hammer size={16} /> Repair Progression Log</h4>
                    
                    {selectedAssign.bookings.status === 'Waiting for Approval' ? (
                      <div style={{ color: 'var(--warning)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <AlertTriangle size={16} /> Waiting for customer estimate/price authorization...
                      </div>
                    ) : ['Repair In Progress', 'Quality Check'].includes(selectedAssign.bookings.status) ? (
                      <div>
                        <textarea
                          className="form-input"
                          rows="3"
                          placeholder="Log progress details: parts replaced, operating system updates..."
                          value={repairNotes}
                          onChange={e => setRepairNotes(e.target.value)}
                          style={{ marginBottom: '12px', fontSize: '0.85rem' }}
                        />
                        
                        <div style={{ display: 'flex', gap: '8px' }}>
                          {selectedAssign.bookings.status === 'Waiting for Approval' || selectedAssign.bookings.status === 'Diagnosis Completed' ? (
                            <button className="btn btn-outline" style={{ fontSize: '0.8rem', padding: '6px 12px' }} onClick={() => handleUpdateRepairProgress('Repair In Progress')}>
                              Start Repair
                            </button>
                          ) : null}
                          
                          {selectedAssign.bookings.status === 'Repair In Progress' && (
                            <button className="btn btn-secondary" style={{ fontSize: '0.8rem', padding: '6px 12px' }} onClick={() => handleUpdateRepairProgress('Quality Check')}>
                              Complete Repair & QA
                            </button>
                          )}
                          
                          {selectedAssign.bookings.status === 'Quality Check' && (
                            <button className="btn btn-primary" style={{ fontSize: '0.8rem', padding: '6px 12px' }} onClick={() => handleUpdateRepairProgress('Ready for Delivery')}>
                              Ready for Delivery
                            </button>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <p style={{ color: 'white', fontSize: '0.9rem', whiteSpace: 'pre-wrap', fontStyle: 'italic' }}>
                          "{selectedAssign.repair_notes || 'No repair progress logs recorded.'}"
                        </p>
                        <span style={{ color: 'var(--success)', fontSize: '0.75rem', display: 'block', marginTop: '8px', fontWeight: 'bold' }}>✓ Repair completed and delivered.</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
