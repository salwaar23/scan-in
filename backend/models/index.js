import Scan from './Scan.js';
import NiktoFinding from './NiktoScan.js';
import ZapFinding from './ZapScan.js';
import Recommendation from './Recommendation.js';

// Definisikan relasi
Scan.hasMany(NiktoFinding, { foreignKey: 'scan_id' });
NiktoFinding.belongsTo(Scan, { foreignKey: 'scan_id' });

Scan.hasMany(ZapFinding, { foreignKey: 'scan_id' });
ZapFinding.belongsTo(Scan, { foreignKey: 'scan_id' });

Recommendation.hasMany(NiktoFinding, { foreignKey: 'recommendation_id' });
NiktoFinding.belongsTo(Recommendation, { foreignKey: 'recommendation_id' });

Recommendation.hasMany(ZapFinding, { foreignKey: 'recommendation_id' });
ZapFinding.belongsTo(Recommendation, { foreignKey: 'recommendation_id' });

export {
  Scan,
  NiktoFinding,
  ZapFinding,
  Recommendation,
};
