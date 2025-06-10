import React, { useState } from "react";
import axios from "axios";
import Sidebar from "./Sidebar";
import Swal from "sweetalert2";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";

const COLORS = ['#dc2626', '#FB9E3A', '#facc15', '#16610E'];

const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch (_) {
    return false;
  }
};

const Scan = () => {
  const [target, setTarget] = useState("");
  const [tool, setTool] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [findings, setFindings] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
      if (!target) {
        await Swal.fire({
          icon: "warning",
          title: "URL kosong",
          text: "Masukkan URL terlebih dahulu",
        });
        return;
      }

      if (!isValidUrl(target)) {
        await Swal.fire({
          icon: "error",
          title: "URL tidak valid",
          text: "Masukkan URL yang benar, contoh: https://example.com",
        });
        return;
      }

      if (!tool) {
        await Swal.fire({
          icon: "info",
          title: "Tools belum dipilih",
          text: "Pilih tools scan terlebih dahulu",
        });
        return;
      }

    setLoading(true);
    setResponse(null);
    setFindings([]);

    try {
      const endpoint = tool.toLowerCase() === "zap" ? "/zap" : "/nikto";

      await axios.post(`http://localhost:5000${endpoint}`, { url: target });

      const result = await axios.get(`http://localhost:5000/findings/latest`, {
        params: { tool }
      });

      setFindings(result.data.findings || []);

      await Swal.fire({
        position: "center",
        icon: "success",
        title: "Pemindaian selesai",
        showConfirmButton: false,
        timer: 1500
      });
    } catch (err) {
      setResponse({ error: err.message || "Error saat scan" });
    }

    setLoading(false);
  };

  const riskLevels = ["Tinggi", "Sedang", "Rendah", "Informational"];
    const riskData = riskLevels.map((risk) => ({
      name: risk,
      value: findings.filter(f => f.risk?.toLowerCase() === risk.toLowerCase()).length
    }));

  return (
    <main className="bg-slate-50 max-w-screen h-screen">
      <section className="grid grid-cols-[16rem_1fr]">
        <section>
          <Sidebar />
        </section>
        <section className="mt-6 ml-6 flex flex-col gap-6">
          <div className="grid grid-cols-2 gap-6 max-w-full">
            <div>
              <h1 className="text-3xl font-bold">Scan</h1>
              <form onSubmit={handleSubmit} className="mt-12 grid grid-rows gap-4 max-w-md">
                <p>Masukkan URL :</p>
                <input
                  type="text"
                  placeholder="Masukkan URL"
                  className="w-full bg-slate-200 rounded-lg py-2 px-2"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                />

                <p>Pilih Tools</p>
                <select
                  className="w-full bg-slate-200 py-2 px-2 rounded-lg"
                  value={tool}
                  onChange={(e) => setTool(e.target.value)}
                >
                  <option value="">Pilih Tools</option>
                  <option value="ZAP">ZAP</option>
                  <option value="Nikto">Nikto</option>
                </select>

                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-950 w-28 rounded-lg p-2 mt-6 text-white disabled:opacity-50"
                >
                  {loading ? "Scanning..." : "Start Scan"}
                </button>
              </form>
              {response && (
                <div className="mt-6 p-4 bg-white rounded shadow max-w-md whitespace-pre-wrap font-mono text-sm overflow-auto max-h-64">
                  <pre>{JSON.stringify(response, null, 2)}</pre>
                </div>
              )}
            </div>

           <div className="bg-white rounded-md shadow-md h-[400px] w-auto flex flex-col justify-center items-center text-center">
                <h2 className="text-xl font-bold mb-4">Distribusi Risiko</h2>
                    {riskData.length > 0 ? (
                      <div className="flex justify-center items-center">
                        <PieChart width={400} height={300}>
                          <Pie
                            data={riskData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            label
                          >
                            {riskData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend 
                          layout="horizontal" 
                          verticalAlign="bottom" 
                          align="center" 
                          height={36} 
                          wrapperStyle={{ marginTop: 10 }}/>
                        </PieChart>
                      </div>
                    ) : (
                      <p className="text-gray-500 italic">Tidak ada data risiko untuk ditampilkan</p>
                    )}
                  </div>
          </div>

         
          {findings.length > 0 && (
            <div className="p-4 bg-white rounded shadow max-w-full">
              <h2 className="text-xl font-bold mb-4">Hasil Scan:</h2>
              <ul className="list-disc pl-5 max-h-64 overflow-auto">
                {findings.map((item) => (
                  <li key={item.id} className="mt-2">
                    <strong>{item.alert || "Nikto"}</strong>
                    <p className="mt-1">Risk: {item.risk || ""}</p>
                    <p className="mt-1">Deskripsi: {item.description || "Tidak ada deskripsi"}</p>
                    <p className="mt-1">Solusi: {item.solution || "Tidak ada solusi tersedia"}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      </section>
    </main>
  );
};

export default Scan;
