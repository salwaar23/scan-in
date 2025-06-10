import fs from 'fs';
import path from 'path';
import { Recommendation } from '../models/index.js';
import db from '../database/database.js';

export const seedRecommendations = async () => {
  try {
    const filePath = path.resolve('seed/recommendation.json');
    const rawData = fs.readFileSync(filePath, 'utf-8');
    const recommendations = JSON.parse(rawData);

    let inserted = 0;
    for (const rec of recommendations) {
      const exists = await Recommendation.findOne({
        where: { alert_name: rec.alert_name }
      });

      if (!exists) {
        await Recommendation.create(rec);
        inserted++;
      }
    }

    console.log(`✅ Selesai. ${inserted} rekomendasi berhasil diinsert.`);
  } catch (error) {
    console.error('❌ Gagal mengimpor rekomendasi:', error.message);
  }
};

export default seedRecommendations;
