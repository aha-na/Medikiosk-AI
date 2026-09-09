import React, { useState, useEffect } from 'react';
import {
  Bell,
  AlertTriangle,
  HeartPulse,
  Clock,
  CheckCircle,
  Activity,
  ArrowUpRight,
  RefreshCw,
  PhoneCall,
} from 'lucide-react';

interface TriagePatient {
  id: string;
  tokenNumber: string;
  name: string;
  age: number;
  gender: string;
  isRedFlag: boolean;
  redFlagDetails?: string;
  timestamp: string;
  chiefComplaint: string;
  department: string;
}

export const NurseTriage: React.FC = () => {
  const [patients, setPatients] = useState<TriagePatient[]>([]);
  const [acknowledgedIds, setAcknowledgedIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchTriageList = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/patients');
      const data = await res.json();
      if (data.patients) {
        setPatients(data.patients);
      }
    } catch (err) {
      console.error('Error fetching triage patients:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTriageList();
    const interval = setInterval(fetchTriageList, 10000);
    return () => clearInterval(interval);
  }, []);

  const emergencyPatients = patients.filter((p) => p.isRedFlag);

  const handleAcknowledge = (id: string) => {
    setAcknowledgedIds((prev) => [...prev, id]);
  };

  return (
    <div id="nurse-triage-board-container" className="max-w-5xl mx-auto space-y-6">
      {/* Top Triage Alert Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-red-600 flex items-center justify-center text-white shadow-xs animate-pulse">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold tracking-tight">
                Emergency OPD Nurse Triage Monitor
              </h2>
              <span className="bg-red-500/20 text-red-300 border border-red-500/30 text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Active Priority 1
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Automated AI triage from MediKiosk terminals • Instant diversion of critical presentations
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchTriageList}
            className="px-4 py-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-sky-400 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh Board</span>
          </button>
        </div>
      </div>

      {/* Critical Red Flag Cases List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <span>Red-Flag Critical Intakes ({emergencyPatients.length})</span>
          </h3>
          <span className="text-xs text-slate-500 font-medium">
            Requires Immediate Bedside or Resus Assessment
          </span>
        </div>

        {emergencyPatients.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center text-slate-500 text-sm shadow-xs">
            No active emergency red-flag cases currently reported from the intake kiosks.
          </div>
        ) : (
          <div className="space-y-3">
            {emergencyPatients.map((pat) => {
              const isAck = acknowledgedIds.includes(pat.id);
              return (
                <div
                  key={pat.id}
                  className={`p-6 rounded-2xl border transition-all shadow-xs flex flex-wrap items-start justify-between gap-4 ${
                    isAck
                      ? 'bg-slate-50 border-slate-300 opacity-80'
                      : 'bg-red-50/70 border-red-300 ring-2 ring-red-400/20'
                  }`}
                >
                  <div className="space-y-2 max-w-xl">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-black bg-red-700 text-white px-2.5 py-0.5 rounded-lg">
                        {pat.tokenNumber}
                      </span>
                      <span className="font-bold text-base text-slate-900">{pat.name}</span>
                      <span className="text-xs text-slate-600">
                        ({pat.age}y / {pat.gender})
                      </span>
                      <span className="text-[11px] text-slate-400">Time: {pat.timestamp}</span>
                    </div>

                    <div className="text-xs font-bold text-red-900 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                      <span>{pat.redFlagDetails || 'Acute Chest Distress / Severe Symptoms'}</span>
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed font-medium">
                      Chief Complaint: {pat.chiefComplaint}
                    </p>

                    <div className="text-[11px] text-slate-500 pt-1">
                      Action Protocol: Assign immediately to Bed 2, perform STAT 12-lead ECG, establish IV access, and call Attending Cardiologist.
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 shrink-0">
                    {isAck ? (
                      <span className="px-3.5 py-2 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-2xl flex items-center gap-1.5 border border-emerald-200">
                        <CheckCircle className="w-4 h-4" />
                        Staff Dispatched
                      </span>
                    ) : (
                      <button
                        onClick={() => handleAcknowledge(pat.id)}
                        className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-2xl shadow-xs cursor-pointer flex items-center gap-1.5 transition-colors"
                      >
                        <HeartPulse className="w-4 h-4" />
                        <span>Acknowledge & Dispatch Staff</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Routine Queue Overview */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4">
          Standard Intake Queue ({patients.filter((p) => !p.isRedFlag).length} patients waiting)
        </h3>

        <div className="divide-y divide-slate-100 text-xs">
          {patients
            .filter((p) => !p.isRedFlag)
            .map((p) => (
              <div key={p.id} className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-lg">{p.tokenNumber}</span>
                  <span className="font-bold text-slate-900">{p.name}</span>
                  <span className="text-slate-500">({p.age}y)</span>
                  <span className="text-slate-600 line-clamp-1 max-w-sm font-medium">
                    {p.chiefComplaint}
                  </span>
                </div>
                <span className="text-slate-500 font-semibold">{p.department}</span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};
