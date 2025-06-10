import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar.jsx';
import axios from 'axios';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

const Dashboard = () => {
    const [allscan, setAllScan] = useState([]);
    const [latestScan, setLatestScan] = useState(null);
    const [totalScan, setTotalScan] = useState(0);

    useEffect(() => {
        getAllScans();
    }, []);

    const getAllScans = async () => {
        try {
            const response = await axios.get("http://localhost:5000/scans/");
            const allData = response.data;

            const sorted = allData.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            setAllScan(sorted.slice(0, 10));   
            setTotalScan(allData.length);

            if (sorted.length > 0) {
                const latestTool = sorted[0].tools.toLowerCase();
                getLatestFinding(latestTool);
            }
        } catch (error) {
            console.error("Gagal mengambil semua scan:", error);
        }
    };

    const getLatestFinding = async (tool) => {
        try {
            const response = await axios.get(`http://localhost:5000/findings/latest`, {
                params: { tool },
            });
            setLatestScan(response.data);
        } catch (error) {
            console.error("Gagal mengambil latest finding:", error);
            setLatestScan(null);
        }
    };

    const latestFindings = latestScan?.findings || [];
    const highCount = latestFindings.filter(f => f.risk === 'Tinggi').length;
    const mediumCount = latestFindings.filter(f => f.risk === 'Sedang').length;
    const lowCount = latestFindings.filter(f => f.risk === 'Rendah').length;
    const infoCount = latestFindings.filter(f => f.risk === 'Informational').length;

    const chartData = [
        { name: 'Tinggi', value: highCount },
        { name: 'Sedang', value: mediumCount },
        { name: 'Rendah', value: lowCount },
        { name: 'Informational', value: infoCount },
    ];

    const COLORS = ['#dc2626', '#FB9E3A', '#facc15', '#16610E'];

    return (
        <div className="bg-slate-50 max-w-screen h-screen">
            <div className='grid grid-cols-[16rem_1fr]'>
                <section><Sidebar /></section>
                <main className='ml-6 mt-6'>
                    <h1 className='text-3xl font-bold'>Dashboard</h1>

                    <section className='flex gap-6 mt-6'>
                        <div className='w-60 h-32 rounded-md bg-slate-200 shadow-xl'>
                            <p className='text-xl font-bold text-center pt-4'>Total Scans</p>
                            <p className='text-3xl font-bold text-center mt-3'>{totalScan}</p>
                        </div>
                        <div className='w-60 h-32 rounded-md bg-slate-200 shadow-xl'>
                            <p className='text-xl font-bold text-center pt-4'>High Severity</p>
                            <p className='text-3xl font-bold text-center mt-3'>{highCount}</p>
                        </div>
                        <div className='w-60 h-32 rounded-md bg-slate-200 shadow-xl'>
                            <p className='text-xl font-bold text-center pt-4'>Medium Severity</p>
                            <p className='text-3xl font-bold text-center mt-3'>{mediumCount}</p>
                        </div>
                        <div className='w-60 h-32 rounded-md bg-slate-200 shadow-xl'>
                            <p className='text-xl font-bold text-center pt-4'>Last Scan</p>
                            <p className='text-2xl font-bold text-center mt-3'>
                                {latestScan?.scan?.created_at ? latestScan.scan.created_at.slice(0, 10) : '-'}
                            </p>
                        </div>
                    </section>

                    <section className='flex gap-6 mt-6'>
                        <section className='bg-white w-[500px] h-[350px] rounded-lg shadow-md flex flex-col justify-center items-center'>
                            <p className='text-2xl p-6 font-bold text-center'>Vulnerability Stats</p>
                            {chartData.some(d => d.value > 0) ? (
                                <PieChart width={400} height={250}>
                                    <Pie
                                        data={chartData}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={100}
                                        fill="#8884d8"
                                        label
                                    >
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            ) : (
                                <p className="text-center text-gray-500">Belum ada data untuk chart.</p>
                            )}
                            <p className="text-center text-sm text-gray-600">
                                Scan Date: {latestScan?.scan?.created_at ? latestScan.scan.created_at.slice(0, 10) : '-'}
                            </p>
                        </section>

                        <section className='bg-white w-wrap h-wrap rounded-lg shadow-md'>
                            <p className='text-2xl p-6 font-bold'>Recent Scans</p>
                            <table className='m-4'>
                                <thead className='border-b-2'>
                                    <tr>
                                        <th>No</th>
                                        <th className='pl-6 text-left'>URL</th>
                                        <th className='pl-6'>Tools</th>
                                        <th className='pl-6'>Tanggal</th>
                                        <th className='pl-6'>Status</th>
                                    </tr>
                                </thead>
                                <tbody className='border-b-2 text-xs'>
                                    {allscan.map((scan, index) => (
                                        <tr key={index}>
                                            <td>{index + 1}</td>
                                            <td className='pl-6'>{scan.url}</td>
                                            <td className='pl-6'>{scan.tools}</td>
                                            <td className='pl-6'>{scan.created_at.slice(0, 10)}</td>
                                            <td className='pl-6'>{scan.status}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </section>
                    </section>
                </main>
            </div>
        </div>
    );
};

export default Dashboard;
