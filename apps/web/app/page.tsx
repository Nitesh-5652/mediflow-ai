"use client";

import { useUser, SignInButton, UserButton } from "@clerk/nextjs";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import RiskChart from "./components/RiskChart";

// ✅ IMPROVED AI LOGIC (High Risk Cases Checked First)
const generateAIResult = (age: number, disease: string, history: string = "") => {
  const cond = disease.toLowerCase();
  const hist = history.toLowerCase();
  let risk = "Low", suggestion = "", reason = "", meds = "";

  // 1. 🔥 HIGH RISK FIRST (Heart/Surgery/Old Age Pain)
  if (age > 50 && (cond.includes("heart") || cond.includes("pain") || hist.includes("surgery"))) {
    risk = "High";
    reason = "Critical age factor combined with cardiac symptoms or surgical history";
    meds = "- Aspirin (Consult MD)\n- Urgent specialist referral\n- Immediate ECG/Cardiac screening";
  } 
  // 2. FEVER LOGIC
  else if (cond.includes("fever")) {
    risk = age > 60 ? "Medium" : "Low";
    reason = age > 60 ? "Fever in elderly requires closer monitoring" : "Elevated body temperature detected";
    meds = "- Paracetamol 500mg (SOS)\n- Stay hydrated\n- Complete rest";
  } 
  // 3. CHRONIC/DIABETES/BP
  else if (cond.includes("diabetes") || cond.includes("bp") || cond.includes("sugar")) {
    risk = "Medium";
    reason = "Chronic condition requiring regular vital monitoring";
    meds = "- Regular glucose/BP checks\n- Low sodium/sugar diet\n- Schedule follow-up checkup";
  } 
  // 4. COLD/GENERAL
  else if (cond.includes("cold") || cond.includes("cough")) {
    risk = "Low";
    reason = "Common respiratory symptoms";
    meds = "- Cetirizine\n- Steam inhalation\n- Warm fluids";
  }
  // 5. DEFAULT
  else {
    risk = "Low";
    reason = "General symptoms with no immediate high-risk indicators";
    meds = "- Standard clinical observation\n- Routine monitoring\n- Balanced diet";
  }
  
  return { 
    risk, 
    suggestion: `RISK: ${risk}\nREASON: ${reason}\n\nSUGGESTED PLAN:\n${meds}\n\n⚠️ IMPORTANT: Consult a doctor before medication.` 
  };
};

export default function Home() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  const isAdmin = user?.publicMetadata?.role === "admin";
  const roleDisplay = isAdmin ? "👑 ADMIN" : "👤 USER";

  const [search, setSearch] = useState("");
  const [patients, setPatients] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [disease, setDisease] = useState("");
  const [history, setHistory] = useState(""); 
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [chartData, setChartData] = useState([]);

  // ✅ EDIT STATE (New)
  const [editingPatient, setEditingPatient] = useState<any>(null);

  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  const [date, setDate] = useState("");
  const [timeHour, setTimeHour] = useState("10:00");
  const [ampm, setAmpm] = useState("AM");
  const [chatOpen, setChatOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<{ role: "user" | "ai"; text: string }[]>([]);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setIsClient(true);
    fetchPatients();
    fetchChartStats();
  }, []);

  useEffect(() => {
    if (chatOpen) chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, chatOpen]);

  const fetchPatients = async () => {
    try {
      const res = await fetch("/api/patients");
      const data = await res.json();
      setPatients(Array.isArray(data) ? data : []);
    } catch (err) { console.error(err); }
  };

  const fetchChartStats = async () => {
    try {
      const res = await fetch("/api/stats");
      const data = await res.json();
      setChartData(Array.isArray(data) ? data : []);
    } catch (err) { console.error(err); }
  };

  // ✅ UPDATE PATIENT FUNCTION (New)
  const updatePatient = async () => {
    if (!editingPatient) return;
    try {
      const res = await fetch("/api/patients", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            id: editingPatient._id,
            name: editingPatient.name,
            age: Number(editingPatient.age),
            disease: editingPatient.disease,
            history: editingPatient.history
        }),
      });
      if (res.ok) {
        setEditingPatient(null);
        fetchPatients();
      }
    } catch (err) { console.error(err); }
  };

  const analyzePatient = async (p: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setLoadingId(p._id);
    const ai = generateAIResult(p.age, p.disease, p.history);
    try {
      const res = await fetch("/api/patients", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: p._id, risk: ai.risk, suggestion: ai.suggestion }),
      });
      if (res.ok) {
        setPatients(prev => 
          prev.map(item => item._id === p._id ? { ...item, risk: ai.risk, suggestion: ai.suggestion } : item)
        );
        fetchChartStats();
      }
    } catch (error) { console.error(error); } finally { setLoadingId(null); }
  };

  const addPatient = async () => {
    if (!isAdmin) return alert("Admin only");
    if (!name || !age || !disease) return alert("Please fill Name, Age, and Condition");
    try {
      const res = await fetch("/api/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, age: Number(age), disease, history: history.trim() || "No prior history" }),
      });
      if (res.ok) {
        setName(""); setAge(""); setDisease(""); setHistory("");
        fetchPatients(); fetchChartStats();
      }
    } catch (err) { console.error(err); }
  };

  const deletePatient = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Delete record?")) return;
    await fetch("/api/patients", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    fetchPatients();
  };

  const bookAppointment = async () => {
    if (!selectedPatient) return alert("Please select a patient first!");
    const finalTime = `${timeHour} ${ampm}`;
    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientId: selectedPatient, date, time: finalTime }),
      });
      if (res.ok) {
        alert("Appointment booked ✅");
        setSelectedPatient(null);
      }
    } catch (err) { console.error(err); }
  };

  const handleChat = async () => {
    if (!message.trim()) return;
    const msg = message; setMessage("");
    setChatHistory(prev => [...prev, { role: "user", text: msg }]);
    try {
      const res = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: msg }) });
      const data = await res.json();
      setChatHistory(prev => [...prev, { role: "ai", text: data.reply }]);
    } catch { setChatHistory(prev => [...prev, { role: "ai", text: "Assistant error..." }]); }
  };

  if (!isLoaded) return <div className="h-screen bg-[#020617] flex items-center justify-center text-blue-500 font-black italic uppercase text-xl">MEDIFLOW AI LOADING...</div>;

  return (
    <div className="flex h-screen bg-[#020617] text-slate-200 overflow-hidden font-sans">
      <aside className="w-80 bg-[#020617] border-r border-slate-800/60 p-8 hidden lg:flex flex-col">
        <div className="font-black text-white text-2xl italic mb-4 tracking-tighter uppercase">Mediflow <span className="text-blue-500 italic">AI</span></div>
        <div className={`mb-10 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border text-center ${isAdmin ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' : 'bg-slate-800/50 border-slate-700 text-slate-500'}`}>
           {roleDisplay}
        </div>

        {/* Selected for Appointment */}
        {selectedPatient && (
          <div className="bg-blue-600/10 border border-blue-500/30 p-6 rounded-[28px] mb-6 shadow-2xl">
            <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-4">Booking Slot</p>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full bg-[#0f172a] border border-slate-800 p-3 rounded-xl text-xs mb-3 text-white outline-none" />
            <div className="flex gap-2 mb-4">
              <input type="time" value={timeHour} onChange={(e) => setTimeHour(e.target.value)} className="flex-1 bg-[#0f172a] border border-slate-800 p-3 rounded-xl text-xs text-white outline-none" />
              <select value={ampm} onChange={(e) => setAmpm(e.target.value)} className="bg-[#0f172a] border border-slate-800 p-3 rounded-xl text-xs text-blue-400 font-bold outline-none">
                <option value="AM">AM</option><option value="PM">PM</option>
              </select>
            </div>
            <button onClick={bookAppointment} className="w-full bg-blue-600 text-white py-4 rounded-xl font-black text-[10px] uppercase shadow-lg hover:bg-blue-500 transition-all">Confirm Appointment</button>
            <button onClick={() => setSelectedPatient(null)} className="w-full mt-3 text-[9px] text-slate-500 uppercase font-black tracking-widest">Cancel</button>
          </div>
        )}

        <div className="mt-auto flex items-center gap-4 p-4 bg-slate-900/50 rounded-2xl border border-slate-800">
           <UserButton afterSignOutUrl="/" />
           <div className="flex flex-col overflow-hidden">
             <p className="text-xs font-bold text-white truncate">{user?.firstName || "User"}</p>
             <p className="text-[9px] text-slate-500 truncate">{user?.primaryEmailAddress?.emailAddress}</p>
           </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 flex items-center justify-between px-10 border-b border-slate-800/60 bg-[#020617]/80 backdrop-blur-md z-10">
          <h2 className="text-xs font-black uppercase tracking-[2px] text-slate-500 italic">Clinical Management</h2>
          <div className="flex items-center gap-4">
            <input className="bg-slate-900 border border-slate-800 p-2.5 px-6 rounded-xl text-xs w-64 text-white focus:border-blue-500 outline-none transition-all" placeholder="Search patients..." onChange={(e) => setSearch(e.target.value)} />
            {!user && <SignInButton mode="modal"><button className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all">Sign In</button></SignInButton>}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar">
          <section className="bg-[#0f172a] border border-slate-800 rounded-[32px] p-8 shadow-2xl relative">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-10">Risk Analytics Over Time</h3>
            <div className="w-full h-[320px]">{isClient && <RiskChart data={chartData} />}</div>
          </section>

          {/* ✅ REGISTER & EDIT UI */}
          {isAdmin && (
            <div className="space-y-6">
              {/* Add New Patient */}
              <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-[28px] grid gap-5">
                <h3 className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Register New Entry</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input className="bg-[#020617] border border-slate-800 p-4 rounded-xl text-sm text-white outline-none" placeholder="Patient Name" value={name} onChange={(e) => setName(e.target.value)} />
                  <input className="bg-[#020617] border border-slate-800 p-4 rounded-xl text-sm text-white outline-none" placeholder="Age" type="number" value={age} onChange={(e) => setAge(e.target.value)} />
                  <input className="bg-[#020617] border border-slate-800 p-4 rounded-xl text-sm text-white outline-none" placeholder="Condition" value={disease} onChange={(e) => setDisease(e.target.value)} />
                </div>
                <div className="flex gap-4">
                  <input className="flex-1 bg-[#020617] border border-slate-800 p-4 rounded-xl text-sm text-white outline-none" placeholder="Medical History" value={history} onChange={(e) => setHistory(e.target.value)} />
                  <button className="bg-blue-600 px-10 py-4 rounded-xl font-black text-xs uppercase hover:bg-blue-500 shadow-lg transition-all" onClick={addPatient}>Register</button>
                </div>
              </div>

              {/* Edit Mode UI */}
              {editingPatient && (
                <div className="bg-yellow-500/5 border border-yellow-500/20 p-8 rounded-[28px] grid gap-5 animate-in slide-in-from-top duration-300">
                  <h3 className="text-[10px] font-black text-yellow-500 uppercase tracking-widest">Update Patient Profile</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input className="bg-[#020617] border border-yellow-500/20 p-4 rounded-xl text-sm text-white outline-none" value={editingPatient.name} onChange={(e) => setEditingPatient({...editingPatient, name: e.target.value})} />
                    <input className="bg-[#020617] border border-yellow-500/20 p-4 rounded-xl text-sm text-white outline-none" type="number" value={editingPatient.age} onChange={(e) => setEditingPatient({...editingPatient, age: e.target.value})} />
                    <input className="bg-[#020617] border border-yellow-500/20 p-4 rounded-xl text-sm text-white outline-none" value={editingPatient.disease} onChange={(e) => setEditingPatient({...editingPatient, disease: e.target.value})} />
                  </div>
                  <div className="flex gap-4">
                    <input className="flex-1 bg-[#020617] border border-yellow-500/20 p-4 rounded-xl text-sm text-white outline-none" value={editingPatient.history} onChange={(e) => setEditingPatient({...editingPatient, history: e.target.value})} />
                    <button className="bg-yellow-600 px-10 py-4 rounded-xl font-black text-xs text-black uppercase hover:bg-yellow-500 transition-all shadow-lg" onClick={updatePatient}>Update Record</button>
                    <button className="bg-slate-800 px-6 py-4 rounded-xl font-black text-xs uppercase" onClick={() => setEditingPatient(null)}>Cancel</button>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="grid gap-6 pb-20">
            {patients.filter(p => p.name.toLowerCase().includes(search.toLowerCase())).map((p) => (
              <div key={p._id} className={`bg-[#0f172a] border ${selectedPatient === p._id ? 'border-blue-500 bg-[#1e293b]' : 'border-slate-800'} p-8 rounded-[32px] hover:border-slate-600 transition-all shadow-xl`}>
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                  <div className="flex gap-5 items-center">
                    <div className="w-16 h-16 bg-slate-800 text-blue-400 rounded-2xl flex items-center justify-center text-2xl font-black italic">{p.name[0]}</div>
                    <div onClick={() => router.push(`/patient/${p._id}`)} className="cursor-pointer group">
                      <h4 className="font-bold text-2xl text-white italic group-hover:text-blue-400 transition-colors">{p.name}</h4>
                      <p className="text-[10px] text-slate-500 font-black uppercase mt-1 tracking-widest">{p.disease} • {p.age} YRS</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => setSelectedPatient(p._id)} className="px-5 py-3 bg-green-500/10 text-green-500 border border-green-500/20 rounded-xl text-[9px] font-black uppercase hover:bg-green-600 hover:text-white transition-all">Book Appt</button>
                    {isAdmin && (
                      <>
                        <button onClick={(e) => analyzePatient(p, e)} disabled={loadingId === p._id} className="px-5 py-3 bg-blue-600 text-white border border-blue-500/20 rounded-xl text-[9px] font-black uppercase hover:bg-blue-400 transition-all shadow-md">
                          {loadingId === p._id ? "Thinking..." : "AI Intelligence"}
                        </button>
                        {/* ✅ EDIT BUTTON IN LIST */}
                        <button onClick={() => setEditingPatient(p)} className="px-5 py-3 bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 rounded-xl text-[9px] font-black uppercase hover:bg-yellow-500 hover:text-black transition-all">Edit</button>
                        <button onClick={(e) => deletePatient(p._id, e)} className="px-5 py-3 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl text-[9px] font-black uppercase hover:bg-red-600 hover:text-white transition-all">Delete</button>
                      </>
                    )}
                  </div>
                </div>
                <div className="mt-8 grid md:grid-cols-2 gap-5">
                   <div className="p-6 bg-[#020617] rounded-[24px] border border-slate-800/60">
                      <p className="text-[10px] font-black text-slate-500 uppercase mb-3 tracking-widest">Medical History</p>
                      <p className="text-[14px] text-slate-300 leading-relaxed italic">{p.history || "No prior history recorded."}</p>
                   </div>
                   {p.suggestion && (
                    <div className={`p-6 bg-[#020617] rounded-[24px] border-l-4 shadow-2xl animate-in zoom-in duration-500 ${p.risk === "High" ? "border-red-500" : p.risk === "Medium" ? "border-yellow-500" : "border-blue-500"}`}>
                      <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-3">AI Diagnostic Summary</p>
                      <pre className="text-[12px] text-slate-300 font-sans whitespace-pre-wrap leading-normal uppercase tracking-tight italic">{p.suggestion}</pre>
                    </div>
                   )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Floating Chat */}
        <button onClick={() => setChatOpen(!chatOpen)} className="fixed bottom-10 right-10 w-16 h-16 bg-blue-600 text-white rounded-[22px] shadow-2xl flex items-center justify-center z-50 hover:scale-110 active:scale-95 transition-all">{chatOpen ? "✕" : "💬"}</button>
        {chatOpen && (
          <div className="fixed bottom-28 right-10 w-[420px] h-[550px] bg-[#0f172a] border border-slate-800 rounded-[32px] shadow-2xl flex flex-col overflow-hidden z-50 animate-in slide-in-from-bottom duration-300">
            <div className="bg-blue-600 p-5 flex items-center justify-between"><p className="text-white font-black text-xs uppercase italic">Mediflow Neural Chat</p></div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {chatHistory.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`p-4 max-w-[85%] rounded-[20px] text-xs ${msg.role === "user" ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-300 border border-slate-700"}`}>{msg.text}</div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            <div className="p-5 bg-[#020617] flex gap-3 border-t border-slate-800">
              <input value={message} onChange={(e) => setMessage(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleChat()} className="flex-1 bg-slate-900 border border-slate-800 p-4 rounded-xl text-xs text-white outline-none focus:border-blue-500" placeholder="Clinical inquiry..." />
              <button onClick={handleChat} className="bg-blue-600 text-white px-6 rounded-xl font-black text-[10px] uppercase shadow-lg transition-all">Send</button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
