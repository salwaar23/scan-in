const normalize = str =>
  str
    .replace(/['"]/g, '') 
    .replace(/\s+/g, ' ') 
    .trim();

export const findZAPRecommendation = (alertText, recommendations) => {
  const normalizedAlert = normalize(alertText);
  return recommendations.find(r => normalize(r.alert_name) === normalizedAlert) || null;
};

const tokenize = str =>
  str.toLowerCase().split(/\s+/).filter(Boolean);

// Fungsi mencocokan pattern
const matchRatio = (patternTokens, alertTokens) => {
  const matchedCount = patternTokens.filter(token => alertTokens.has(token)).length;
  return matchedCount / patternTokens.length; 
};

export const findNiktoRecommendation = (alertText, recommendations) => {
  const alertTokens = new Set(tokenize(alertText));

  for (const r of recommendations) {
    try {
      const patterns = r.pattern_match;
      if (Array.isArray(patterns)) {
        for (const pattern of patterns) {
          const patternTokens = tokenize(pattern);
          const matchedCount = patternTokens.filter(token => alertTokens.has(token)).length;
          const ratio = matchedCount / patternTokens.length;

           const isMatch =
            (patternTokens.length >= 4 && ratio >= 0.6 && matchedCount >= 3) ||  
            (patternTokens.length === 3 && matchedCount >= 2) ||                 
            (patternTokens.length === 2 && matchedCount === 2 && alertTokens.size <= 6) || 
            (patternTokens.length === 1 && matchedCount === 1 && alertTokens.size <= 4);  

          if (isMatch) {
            return r;
          }
        }
      }
    } catch (err) {
      console.warn(`❗ Gagal parsing pattern_match: ${r.pattern_match}`, err.message);
    }
  }

  return null;
};
