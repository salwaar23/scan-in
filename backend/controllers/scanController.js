import  runNiktoScan from "../services/niktoScanner.js";
import { runZAPFullScan } from "../services/zapScanner.js";
import { Scan, NiktoFinding, ZapFinding, Recommendation } from '../models/index.js';
import { findNiktoRecommendation, findZAPRecommendation } from "../utils/matched.js";
import { Sequelize } from "sequelize";

export const NiktoScan = async (req, res) => {
  const { url } = req.body;

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'URL tidak valid' });
  }

  try {
    const findings = await runNiktoScan(url);
    console.log('🔍 Parsed findings:', findings);

    const scan = await Scan.create({
      url,
      tools: 'nikto',
      started_at: new Date(),
      finished_at: new Date(),
      status: 'completed'
    });

    // Ambil semua rekomendasi dan simpan dalam Map
    const recommendations = await Recommendation.findAll();
    const recMap = new Map();
    recommendations.forEach(r => recMap.set(r.alert, r));

    let savedCount = 0;

    for (const item of findings) {
      if (!item.alert || !item.url) {
        console.warn('⛔ Skipping invalid finding:', item);
        continue;
      }

      try {
        const recommendation = findNiktoRecommendation(item.alert, recommendations);

        const newFinding = await NiktoFinding.create({
          scan_id: scan.id,
          alert: item.alert,
          url: item.url,
          risk: recommendation?.risk,
          description: recommendation?.description || 'Tidak ada deskripsi tersedia',
          solution: recommendation?.solution || 'Tidak ada solusi tersedia',
          recommendation_id: recommendation?.id || null,
        });

        savedCount++;
      } catch (err) {
        console.error('❌ Gagal menyimpan NiktoFinding:', err.message, item);
      }
    }


    if (savedCount === 0) {
      console.warn('⚠️ Tidak ada hasil Nikto yang tersimpan. Periksa parser dan hasil scan.');
    }

    return res.status(200).json({
      message: `Nikto scan completed. ${savedCount} findings saved.`,
      findings,
    });

  } catch (error) {
    console.error('💥 Error saat menjalankan Nikto scan:', error.message);
    return res.status(500).json({
      error: 'Error running Nikto scan',
      detail: error.message,
    });
  }
};

export const runZapScan = async (req, res) => {
  const { url } = req.body;
  try {
    const startTime = new Date();
    const { alerts } = await runZAPFullScan(url);
    const endTime = new Date();

    const scan = await Scan.create({
      url,
      tools: 'zap',
      started_at: startTime,
      finished_at: endTime,
      status: 'completed'
    });

    const recommendations = await Recommendation.findAll();

    const seenAlerts = new Set(); 
    let savedCount = 0;

    for (const alert of alerts) {
      const alertName = alert.alert?.toLowerCase().trim();
      if (!alertName || !alert.risk) {
        console.warn('⚠️ Melewatkan alert tidak valid:', alert);
        continue;
      }

      if (seenAlerts.has(alertName)) {
        console.log(`🔁 Duplikat alert dilewati: ${alertName}`);
        continue; 
      }

      seenAlerts.add(alertName);

      try {
        const recommendation = findZAPRecommendation(alert.alert, recommendations);

        await ZapFinding.create({
          scan_id: scan.id,
          alert: alert.alert,
          risk: recommendation?.risk,
          description: recommendation?.description || 'Tidak ada deskripsi',
          solution: recommendation?.solution || 'Tidak ada solusi tersedia',
          recommendation_id: recommendation?.id || null,
        });

        savedCount++;
      } catch (innerErr) {
        console.error('❌ Gagal menyimpan alert ZAP:', innerErr.message, alert);
      }
    }

    if (savedCount === 0) {
      console.warn('⚠️ Tidak ada hasil ZAP yang berhasil disimpan.');
    }

    res.status(200).json({
      message: `ZAP scan completed, ${savedCount} unique findings saved.`,
      totalOriginal: alerts.length,
      totalSaved: savedCount,
    });

  } catch (error) {
    console.error('💥 Error runZapScan:', error.message);
    res.status(500).json({ error: 'Error running ZAP scan', detail: error.message });
  }
};


export const getLatestFindings = async (req, res) => {
  const { tool } = req.query;

  if (!tool) {
    return res.status(400).json({ message: 'Tool harus disertakan' });
  }

  try {
    const latestScan = await Scan.findOne({
      where: Sequelize.where(
        Sequelize.fn('lower', Sequelize.col('tools')),
        tool.toLowerCase()
      ),
      order: [['created_at', 'DESC']],
    });

    if (!latestScan) {
      return res.status(404).json({ message: 'Scan tidak ditemukan' });
    }

    let findings;

    if (tool.toLowerCase() === 'zap') {
      findings = await ZapFinding.findAll({ where: { scan_id: latestScan.id } });
    } else if (tool.toLowerCase() === 'nikto') {
      findings = await NiktoFinding.findAll({ where: { scan_id: latestScan.id } });
    } else {
      return res.status(400).json({ message: 'Tool tidak valid' });
    }

    findings = findings.map(f => ({
      id: f.id,
      alert: f.alert,
      risk: f.risk || 'Tidak Ditemukan',
      description: f.description,
      solution: f.solution,
    }));

    const riskOrder = ['Tinggi', 'Sedang', 'Rendah', 'Informational'];

    findings.sort((a, b) => riskOrder.indexOf(a.risk) - riskOrder.indexOf(b.risk));

    res.status(200).json({
      scan: {
        id: latestScan.id,
        tools: latestScan.tools,
        created_at: latestScan.created_at,
      },
      findings,
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


export const getAllScans = async (req, res) => {
    try {
        const scans = await Scan.findAll({
            order: [['created_at', 'DESC']],
        });
        res.status(200).json(scans);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch scans', detail: error.message });
    }
};

export const getAllScansById = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: 'Parameter id scan diperlukan' });
  }

  try {
    const scan = await Scan.findByPk(id);

    if (!scan) {
      return res.status(404).json({ message: 'Scan tidak ditemukan' });
    }

    let findings = [];

    if (scan.tools === 'zap') {
      findings = await ZapFinding.findAll({ where: { scan_id: id } });
    } else if (scan.tools === 'nikto') {
      findings = await NiktoFinding.findAll({ where: { scan_id: id } });
    } else {
      return res.status(400).json({ message: 'Tool tidak dikenali' });
    }

    const formattedFindings = findings.map(f => ({
      id: f.id,
      alert: f.alert,
      risk: f.risk || 'Tidak Ditemukan',
      description: f.description || 'Tidak Ditemukan',
      solution: f.solution || 'Tidak Ditemukan',
    }));

    const riskOrder = ['Tinggi', 'Sedang', 'Rendah', 'Informational'];
    formattedFindings.sort((a, b) => riskOrder.indexOf(a.risk) - riskOrder.indexOf(b.risk));

    return res.status(200).json({
      scan: {
        id: scan.id,
        tools: scan.tools,
        url: scan.url,
        created_at: scan.created_at,
        status: scan.status,
      },
      findings: formattedFindings,
    });
  } catch (error) {
    console.error('Error getFindingsById:', error.message);
    res.status(500).json({ error: 'Gagal mengambil data scan', detail: error.message });
  }
};

export const getZapFindings = async (req, res) => {
    try {
        const zapFindings = await ZapFinding.findAll({
            order: [['created_at', 'DESC']],
        });
        res.status(200).json(zapFindings);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch ZAP findings', detail: error.message });
    }
};

export const getNiktoFindings = async (req, res) => {
    try {
        const niktoFindings = await NiktoFinding.findAll({
            order: [['created_at', 'DESC']],
        });
        res.status(200).json(niktoFindings);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch Nikto findings', detail: error.message });
    }
};

export const deleteScanById = async (req, res) => {
    const { id } = req.params;
    try {
        await ZapFinding.destroy({ where: { scan_id: id } });
        await NiktoFinding.destroy({ where: { scan_id: id } });
        await Scan.destroy({ where: { id } });

        res.status(200).json({ message: 'Scan and related data deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete scan', detail: error.message });
    }
};

