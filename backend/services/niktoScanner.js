import { exec } from 'child_process';

// Fungsi untuk menjalankan Nikto via Docker dan parsing hasilnya
const runNiktoScan = (url) => {
    return new Promise((resolve, reject) => {
        if (!url) return reject('URL is required for Nikto scan');

        const cmd = `docker run --rm alpine/nikto -h ${url}`;
        exec(cmd, (error, stdout, stderr) => {
            if (error) {
                console.error('Nikto error:', stderr || error.message);
                reject(`Nikto error: ${stderr || error.message}`);
            } else {
                const findings = parseNiktoOutput(stdout, url);
                resolve(findings);
            }
        });
    });
};

function parseNiktoOutput(output, url) {
  const findings = [];
  const lines = output.split('\n');

  const keywords = [
    'not present',
    'not defined',
    'not set',
    'vulnerable',
    'missing',
    'wildcard certificate',
    'alert',
    'exposure',
    'leak',
    'susceptible',
    'misconfiguration',
    'uncommon',
    'x-powered-by',
    'found',
    'retrieved'
  ];

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('+')) {
      const message = trimmed.substring(1).trim().toLowerCase();

      if (keywords.some(keyword => message.includes(keyword))) {
        // Ambil hanya sampai titik pertama saja
        let shortMessage = trimmed.substring(1).trim();
        const dotIndex = shortMessage.indexOf('.');
        if (dotIndex !== -1) {
          shortMessage = shortMessage.substring(0, dotIndex + 1);
        }

        findings.push({
          alert: shortMessage,
          url,
        });
      }
    }
  }

  return findings;
}


export default runNiktoScan;
