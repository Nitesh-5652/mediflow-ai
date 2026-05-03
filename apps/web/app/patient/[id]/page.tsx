"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function PatientDetail() {
  const params = useParams();
  const id = params?.id;

  const [patient, setPatient] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchPatient = async () => {
      try {
        const res = await fetch(`/api/patients/${id}`);
        const data = await res.json();
        setPatient(data);
      } catch (err) {
        console.error("Error fetching patient:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPatient();
  }, [id]);

  if (loading) {
    return (
      <div className="p-6 text-blue-400">
        RETRIEVING CLINICAL DATA...
      </div>
    );
  }

  if (!patient) {
    return <div className="p-6 text-red-500">Patient not found</div>;
  }

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-bold mb-4">
        {patient.name}
      </h1>

      <div className="space-y-2 text-gray-300">

        <p><strong>Age:</strong> {patient.age}</p>

        <p><strong>Condition:</strong> {patient.disease}</p>

        <p><strong>Risk Level:</strong> {patient.risk}</p>

        <p><strong>Medical History:</strong> {patient.history || "No history available"}</p>

        <p><strong>Diagnosis / Notes:</strong> {patient.suggestion || "No notes available"}</p>

      </div>
    </div>
  );
}