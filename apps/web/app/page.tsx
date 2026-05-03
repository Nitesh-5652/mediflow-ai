"use client";

import { useUser, SignInButton, UserButton } from "@clerk/nextjs";
import { useEffect, useState, useRef } from "react";
import RiskChart from "./components/RiskChart";

export default function Home() {
  const { user, isLoaded } = useUser();
  const role = user?.publicMetadata?.role;

  const [search, setSearch] = useState("");
  const [patients, setPatients] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [disease, setDisease] = useState("");
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [chartData, setChartData] = useState([]);

  // --- Chat States ---
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
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  const fetchPatients = async () => {
    try {
      const res = await fetch("/api/patients");
      const data = await res.json();
      setPatients(Array.isArray(data) ? [...data] : []);
    } catch (err) { console.error("Fetch Error:", err); }
  };

  const fetchChartStats = async () => {
    try {
      const res = await fetch("/api/stats");
      const data = await res.json();
      setChartData(Array.isArray(data) ? [...data] : []);
    } catch (err) { console.error("Chart Error:", err); }
  };

  const addPatient = async () => {
    if (role !== "admin") return alert("Access Denied");
    if (!name || !age || !disease) return alert("Fill all fields");
    await fetch("/api/patients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, age: Number(age), disease }),
    });
    setName(""); setAge(""); setDisease("");
    fetchPatients();
    fetchChartStats();
  };

  // ✅ EDIT FUNCTION (RE-ADDED)
  const editPatient = async (p: any) => {
    if (role !== "admin") return alert("Access Denied");
    const newName = prompt("Edit Name:", p.name);
    const newAge = prompt("Edit Age:", p.age);
    const newDisease = prompt("Edit Condition:", p.disease);
    const parsedAge = Number(newAge);

    if (!newName || isNaN(parsedAge) || !newDisease) return alert("Invalid Input");

    try {
      await fetch("/api/patients", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: p._id, name: newName, age: parsedAge, disease: newDisease }),
      });
      fetchPatients();
      fetchChartStats();
    } catch (err) { console.error("Edit Error:", err); }
  };

  const analyzePatient = async (p: any) => {
    if (role !== "admin") return alert("Access Denied");
    setLoadingId(p._id);
    try {
      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: p.name, age: p.age, disease: p.disease }),
      });
      const data = await res.json();
      const aiResponse = data.reply;

      let risk = "Low";
      if (aiResponse.toLowerCase().includes("high")) risk = "High";
      else if (aiResponse.toLowerCase().includes("medium")) risk = "Medium";
      
      await fetch("/api/patients", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: p._id, risk, suggestion: aiResponse }),
      });

      // Manual state update for instant UI response
      setPatients(prev => prev.map(item => 
        item._id === p._id ? { ...item, suggestion: aiResponse, risk: risk } : item
      ));

      fetchChartStats();
    } catch (error) {
      console.error("Analysis Failed:", error);
    } finally { setLoadingId(null); }
  };

  const deletePatient = async (id: string) => {
    if (role !== "admin") return alert("Access Denied");
    if (!confirm("Delete this record?")) return;
    await fetch("/api/patients", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setPatients(prev => prev.filter(p => p._id !== id));
    fetchChartStats();
  };

  const handleChat = async () => {
    if (!message.trim()) return;
    const userMsg = message;
    setMessage("");
    setChatHistory(prev => [...prev, { role: "user", text: userMsg }]);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg }),
      });
      const data = await res.json();
      setChatHistory(prev => [...prev, { role: "ai", text: data.reply }]);
    } catch { setChatHistory(prev => [...prev, { role: "ai", text: "Error..." }]); }
  };

  if (!isLoaded) return <div className="h-screen bg-[#020617] flex items-center justify-center text-blue-500 font-black italic">LOADING MEDIFLOW...</div>;

  if (!user) return (
    <div className="h-screen bg-[#020617] flex flex-col items-center justify-center">
       <h1 className="text-6xl font-black text-white italic mb-8 tracking-tighter">MEDIFLOW<span className="text-blue-500">AI</span></h1>
       <SignInButton mode="modal">
         <button className="bg-blue-600 text-white px-10 py-4 rounded-xl font-bold uppercase tracking-widest text-xs">Launch System</button>
       </SignInButton>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#020617] text-slate-200 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-72 bg-[#020617] border-r border-slate-800/60 p-8 hidden lg:flex flex-col justify-between">
        <div>
          <div className="font-black text-white text-2xl italic mb-12 tracking-tighter">MEDIFLOW AI</div>
          <div className="bg-blue-600/10 border border-blue-500/20 p-4 rounded-2xl">
            <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Active Session</p>
            <p className="text-white font-bold mt-1 uppercase">{role || "Staff"}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 p-4 bg-slate-900/50 rounded-2xl border border-slate-800">
           <UserButton />
           <div className="overflow-hidden">
              <p className="text-xs font-bold text-white truncate">{user.firstName}</p>
              <p className="text-[10px] text-slate-500 uppercase font-black">Settings</p>
           </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 flex items-center justify-between px-10 border-b border-slate-800/60 bg-[#020617]/80 backdrop-blur-md">
          <h2 className="text-sm font-black uppercase tracking-[2px] text-slate-400">Clinical Dashboard</h2>
          <input className="bg-slate-900 border border-slate-800 p-2.5 px-6 rounded-xl text-xs w-64 text-white outline-none focus:border-blue-500" placeholder="Search patients..." onChange={(e) => setSearch(e.target.value)} />
        </header>

        <div className="flex-1 overflow-y-auto p-10 space-y-8">
          {/* Chart */}
          <section className="bg-[#0f172a] border border-slate-800 rounded-[32px] p-8 shadow-2xl">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6">Patient Risk Analytics</h3>
            <div className="w-full h-[280px]">{isClient && <RiskChart data={chartData} />}</div>
          </section>

          {/* Add Patient */}
          {role === "admin" && (
            <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-[24px] flex flex-col md:flex-row gap-4">
              <input className="flex-1 bg-[#020617] border border-slate-800 p-4 rounded-xl text-sm" placeholder="Patient Name" value={name} onChange={(e) => setName(e.target.value)} />
              <input className="w-24 bg-[#020617] border border-slate-800 p-4 rounded-xl text-sm" placeholder="Age" type="number" value={age} onChange={(e) => setAge(e.target.value)} />
              <input className="flex-1 bg-[#020617] border border-slate-800 p-4 rounded-xl text-sm" placeholder="Condition" value={disease} onChange={(e) => setDisease(e.target.value)} />
              <button className="bg-blue-600 px-8 py-4 rounded-xl font-black text-xs uppercase hover:bg-blue-500 transition-all shadow-lg shadow-blue-900/20" onClick={addPatient}>Register</button>
            </div>
          )}

          {/* Patient List */}
          <div className="grid gap-4">
            {patients.filter(p => p.name.toLowerCase().includes(search.toLowerCase())).map((p) => (
              <div key={p._id} className="bg-[#0f172a] border border-slate-800 p-6 rounded-[24px] hover:border-slate-600 transition-all group">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                  <div className="flex gap-4 items-center flex-1">
                    <div className="w-12 h-12 bg-slate-800 text-blue-400 rounded-xl flex items-center justify-center font-black group-hover:bg-blue-600 group-hover:text-white transition-all">{p.name.charAt(0)}</div>
                    <div>
                      <h4 className="font-bold text-lg text-white">{p.name}</h4>
                      <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{p.disease} • {p.age} Yrs</p>
                    </div>
                  </div>

                  <div className="flex gap-2 w-full lg:w-auto">
                    {role === "admin" && (
                      <>
                        <button onClick={() => analyzePatient(p)} disabled={loadingId === p._id} className="flex-1 lg:flex-none px-4 py-2 bg-blue-600/10 text-blue-400 border border-blue-500/20 rounded-lg text-[10px] font-black uppercase hover:bg-blue-600 hover:text-white transition-all">
                          {loadingId === p._id ? "Processing..." : "AI Intelligence"}
                        </button>
                        {/* ✅ EDIT BUTTON ADDED BACK */}
                        <button onClick={() => editPatient(p)} className="flex-1 lg:flex-none px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-[10px] font-black uppercase hover:bg-slate-700 transition-all">
                          Edit
                        </button>
                        <button onClick={() => deletePatient(p._id)} className="flex-1 lg:flex-none px-4 py-2 bg-red-500/10 text-red-500 border border-red-500/20 rounded-lg text-[10px] font-black uppercase hover:bg-red-600 hover:text-white transition-all">
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* AI Result Box */}
                {loadingId === p._id ? (
                  <div className="mt-4 text-[10px] font-black text-blue-500 animate-pulse uppercase">Analyzing Clinical Data...</div>
                ) : (
                  p.suggestion && (
                    <div className="mt-4 p-4 bg-[#020617] rounded-xl border-l-4 border-blue-500">
                      <p className="text-xs italic text-slate-400 leading-relaxed">"{p.suggestion}"</p>
                    </div>
                  )
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Floating Chat */}
        <button onClick={() => setChatOpen(!chatOpen)} className="fixed bottom-8 right-8 bg-blue-600 text-white w-14 h-14 rounded-2xl shadow-2xl flex items-center justify-center text-xl z-50 hover:scale-110 active:scale-95 transition-all border border-blue-400/30">
          {chatOpen ? "✕" : "💬"}
        </button>

        {chatOpen && (
          <div className="fixed bottom-24 right-8 w-96 h-[500px] bg-[#0f172a] border border-slate-800 rounded-[32px] shadow-2xl flex flex-col overflow-hidden z-50">
            <div className="bg-blue-600 p-5 font-black text-[10px] uppercase text-white tracking-widest">MediFlow Assistant</div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatHistory.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`p-3 max-w-[80%] rounded-xl text-xs ${msg.role === "user" ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-300"}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            <div className="p-4 bg-[#020617] flex gap-2">
              <input value={message} onChange={(e) => setMessage(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleChat()} className="flex-1 bg-slate-900 border border-slate-800 p-3 rounded-lg text-xs text-white" placeholder="Ask AI..." />
              <button onClick={handleChat} className="bg-blue-600 text-white px-4 rounded-lg font-bold text-xs uppercase">Send</button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}