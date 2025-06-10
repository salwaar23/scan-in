import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import Swal from "sweetalert2";

export default function Report() {
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const navigate = useNavigate();

  const fetchScans = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5000/scans"); 
      setScans(res.data);
    } catch (error) {
      console.error("Error fetching scans:", error);
      alert("Gagal mengambil data scan");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchScans();
  }, []);

  const handleDelete = async (id) => {
  const result = await Swal.fire({
    title: "Yakin ingin menghapus?",
    text: "Data ini akan dihapus secara permanen!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Ya, hapus!"
  });

  if (!result.isConfirmed) return;

  setDeletingId(id);

  try {
    await axios.delete(`http://localhost:5000/scans/${id}`);

    await Swal.fire({
      title: "Berhasil!",
      text: "Scan berhasil dihapus.",
      icon: "success"
    });

    fetchScans();
  } catch (error) {
    await Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "Gagal menghapus scan."
    });
    console.error(error);
  }

  setDeletingId(null);
};

  const handleDownloadPdf = (id) => {
    navigate(`/generatepdf/${id}`);
  };

  return (
    <main className="bg-slate-50 max-w-screen h-screen">
      <section className="grid grid-cols-[16rem_1fr]">
        <aside>
          <Sidebar />
        </aside>

        <section className="mt-6 ml-6 overflow-auto max-h-screen">
          <h2 className="text-3xl font-bold mb-6">Daftar Scan</h2>

          {loading ? (
            <p>Loading...</p>
          ) : (
            <table
              border="1"
              cellPadding="5"
              cellSpacing="0"
              className="w-full border-collapse"
            >
              <thead className="bg-gray-200">
                <tr>
                  <th>NO</th>
                  <th className="w-2/12">URL</th>
                  <th className="w-1/12 text-center">Tools</th>
                  <th>Status</th>
                  <th>Tanggal Scan</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {scans.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center">
                      Tidak ada data scan
                    </td>
                  </tr>
                ) : (
                  scans.map((scan, index) => (
                    <tr key={scan.id}>
                      <td className="pl-2">{index + 1}</td>
                      <td className="w-3/12">{scan.url}</td>
                      <td className="text-center">{scan.tools}</td>
                      <td className="text-center">{scan.status}</td>
                      <td className="text-center">{new Date(scan.created_at).toLocaleString()}</td>
                      <td className="flex justify-center">
                        <button
                          onClick={() => handleDownloadPdf(scan.id)}
                          disabled={deletingId === scan.id}
                          className="bg-blue-600 text-white px-2 py-1 rounded mr-2"
                        >
                          Download PDF
                        </button>
                        <button
                          onClick={() => handleDelete(scan.id)}
                          disabled={deletingId === scan.id}
                          className="bg-red-600 text-white px-2 py-1 rounded"
                        >
                          {deletingId === scan.id ? "Menghapus..." : "Hapus"}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </section>
      </section>
    </main>
  );
}
