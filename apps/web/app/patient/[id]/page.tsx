"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function PatientDetail() {
  const params = useParams();
  const router = useRouter();

  // Handling potential array or string for params.id
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const [patient, setPatient] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(""); // ✅ UX Improvement: User-facing errors

  useEffect(() => {
    if (!id) return;

    // ✅ FIX 1: isMounted to prevent memory leaks on unmounted components
    let isMounted = true;

    const fetchPatient = async () => {
      try {
        const res = await fetch(`/api/patients/${id}`, {
          cache: "no-store" // Ensure we always get the latest clinical data
        });
        
        if (!res.ok) throw new Error("Patient record not found in database");
        const data = await res.json();
        
        if (isMounted) setPatient(data);
      } catch (err: any) {
        if (isMounted) {
          console.error("Error fetching patient:", err);
          setError(err.message || "Failed to retrieve clinical data.");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchPatient();

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [id]);

  // ✅ UI State: Loading
  if (loading) {
    return (
      <div className="h-screen bg-[#020617] flex items-center justify-center text-blue-500 font-black italic uppercase tracking-tighter text-xl animate-pulse">
        RETRIEVING CLINICAL DATA...
      </div>
    );
  }

  // ✅ UI State: Error handling for UX
  if (error || !patient) {
    return (
      <div className="h-screen bg-[#020617] flex flex-col items-center justify-center space-y-6">
        <div className="text-red-500 font-bold uppercase tracking-widest text-center px-4">
          ⚠️ {error || "Patient record not found"}
        </div>
        <button 
          onClick={() => router.push("/")} 
          className="px-6 py-3 bg-slate-900 border border-slate-800 text-[10px] text-slate-400 uppercase font-black hover:bg-slate-800 transition-all rounded-xl"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  // ✅ FIX 2: Case-insensitive risk color logic
  const riskStatus = patient.risk?.toLowerCase() || "pending";

  return (
    <div className="min-h-screen bg-[#020617] p-10 font-sans text-slate-200">
      <button 
        onClick={() => router.back()} 
        className="mb-10 text-[10px] font-black text-blue-500 uppercase tracking-[2px] hover:text-blue-400 transition-all flex items-center gap-2 group"
      >
        <span className="group-hover:-translate-x-1 transition-transform">←</span> Return to Dashboard
      </button>

      <div className="max-w-4xl mx-auto bg-[#0f172a] border border-slate-800 rounded-[32px] overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="p-10 border-b border-slate-800 flex flex-col md:flex-row justify-between items-start gap-6">
          <div>
            <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase mb-2">
              {patient.name}
            </h1>
            <p className="text-xs font-black text-slate-500 uppercase tracking-widest italic">Clinical Profile Record</p>
          </div>
          
          {/* ✅ FIXED: Dynamic Risk Colors with Fallback */}
          <div className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-colors ${
            riskStatus === "high" ? "bg-red-500/10 border-red-500/30 text-red-500" : 
            riskStatus === "medium" ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-500" : 
            "bg-blue-500/10 border-blue-500/30 text-blue-400"
          }`}>
             Status: {patient.risk || "PENDING ANALYSIS"}
          </div>
        </div>

        <div className="p-10 grid md:grid-cols-2 gap-10">
          <div className="space-y-8">
            <div className="group">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Patient Age</p>
              <p className="text-xl font-bold text-white italic">{patient.age} Years</p>
            </div>
            <div className="group">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Primary Condition</p>
              <p className="text-xl font-bold text-white italic">{patient.disease}</p>
            </div>
            <div className="group">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Medical History</p>
              <p className="text-sm text-slate-300 leading-relaxed italic border-l-2 border-slate-800 pl-4">
                {patient.medicalHistory || patient.history || "No clinical history available for this record."}
              </p>
            </div>
          </div>

          <div className="space-y-8">
            <div className="p-8 bg-[#020617] rounded-[28px] border border-slate-800/60 shadow-inner relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10 font-black text-4xl italic text-blue-500 select-none">AI</div>
              <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-4 italic">Neural Diagnostic Summary</p>
              <pre className="text-sm text-slate-300 font-sans whitespace-pre-wrap leading-relaxed italic uppercase tracking-tighter">
                {patient.suggestion || "Diagnostic analysis has not been performed for this patient. Please initiate analysis from the main dashboard."}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}