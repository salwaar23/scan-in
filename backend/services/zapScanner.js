import axios from "axios";

const ZAP_BASE = "http://zap:8080";

const delay = (ms) => new Promise(res => setTimeout(res, ms));

const SCAN_TIMEOUT = 50 * 60 * 1000;

const optimizeZAPSettings = async () => {
  try {
    console.log("⚙️ Mengoptimalkan konfigurasi ZAP...");
    await axios.get(`${ZAP_BASE}/JSON/ascan/action/enableAllScanners/`);
    await axios.get(`${ZAP_BASE}/JSON/ascan/action/setOptionThreadPerHost/`, {
      params: { Integer: 20 }
    });
    await axios.get(`${ZAP_BASE}/JSON/ascan/action/setOptionMaxRuleDurationInMins/`, {
      params: { Integer: 15 }
    });
    await axios.get(`${ZAP_BASE}/JSON/ascan/action/setOptionMaxScansInUI/`, {
      params: { Integer: 10 }
    });
    console.log("✅ Konfigurasi ZAP berhasil dioptimalkan.");
  } catch (err) {
    console.error('❌ Gagal mengoptimalkan ZAP:', err.message);
    throw new Error('ZAP optimization error');
  }
};

// Spider klasik
export const runZAPSpider = async (url) => {
  try {
    await axios.get(`${ZAP_BASE}/JSON/core/action/accessUrl/`, { params: { url, recurse: true } });
    const { data: start } = await axios.get(`${ZAP_BASE}/JSON/spider/action/scan/`, { params: { url } });
    const scanId = start.scan;
    console.log(`🕷️ Spider scan started: ${scanId}`);

    let status = '0';
    const startTime = Date.now();
    while (status !== '100') {
      if (Date.now() - startTime > SCAN_TIMEOUT) throw new Error("Spider timeout");
      await delay(2000);
      const { data } = await axios.get(`${ZAP_BASE}/JSON/spider/view/status/`, { params: { scanId } });
      status = data.status;
      console.log(`🕷️ Spider progress: ${status}%`);
    }

    console.log(`✅ Spider finished: ${scanId}`);
  } catch (err) {
    console.error('❌ ZAP Spider error:', err.message);
    throw new Error(`Spider error: ${err.message}`);
  }
};

// AJAX Spider
export const runZAPAjaxSpider = async (url) => {
  try {
    await axios.get(`${ZAP_BASE}/JSON/ajaxSpider/action/scan/`, { params: { url } });
    console.log('⚡ AJAX Spider started...');

    let status = '';
    const startTime = Date.now();
    while (status !== 'stopped') {
      if (Date.now() - startTime > SCAN_TIMEOUT) throw new Error("AJAX Spider timeout");
      await delay(3000);
      const { data } = await axios.get(`${ZAP_BASE}/JSON/ajaxSpider/view/status/`);
      status = data.status;
      console.log(`⚡ AJAX Spider status: ${status}`);
    }

    console.log('✅ AJAX Spider finished.');
  } catch (err) {
    console.error('❌ AJAX Spider error:', err.message);
    throw new Error(`AJAX Spider error: ${err.message}`);
  }
};

export const getZAPPassiveScanResults = async () => {
  try {
    const { data } = await axios.get(`${ZAP_BASE}/JSON/pscan/view/recordsToScan/`);
    const recordsRemaining = parseInt(data.recordsToScan, 10);

    let waitTime = 0;
    while (recordsRemaining > 0 && waitTime < SCAN_TIMEOUT) {
      console.log(`🔎 Passive scan records remaining: ${recordsRemaining}`);
      await delay(2000);
      const { data: update } = await axios.get(`${ZAP_BASE}/JSON/pscan/view/recordsToScan/`);
      if (parseInt(update.recordsToScan, 10) === 0) break;
      waitTime += 2000;
    }

    console.log("✅ Passive scan completed.");
  } catch (err) {
    console.error("❌ Passive scan error:", err.message);
    throw new Error("Passive Scan error");
  }
};

// Active Scan
//export const runZAPScan = async (url) => {
//  try {
//    const { data: start } = await axios.get(`${ZAP_BASE}/JSON/ascan/action/scan/`, { params: { url } });
//    const scanId = start.scan;
//    console.log(`🔥 Active Scan started: ${scanId}`);

//   let status = '0';
//    const startTime = Date.now();
//    while (status !== '100') {
//      if (Date.now() - startTime > SCAN_TIMEOUT) throw new Error("Active Scan timeout");
//      await delay(5000);
//      const { data } = await axios.get(`${ZAP_BASE}/JSON/ascan/view/status/`, { params: { scanId } });
//      status = data.status;
//    console.log(`🔥 Active scan progress: ${status}%`);
//    }

//    console.log(`✅ Active Scan finished: ${scanId}`);
//    return scanId;
//  } catch (err) {
//    console.error('❌ Active Scan error:', err.message);
//    throw new Error(`Active Scan error: ${err.message}`);
//  }
//};

// Ambil alert hasil scan
export const getZAPAlerts = async (url) => {
  try {
    const { data } = await axios.get(`${ZAP_BASE}/JSON/core/view/alerts/`, {
      params: { baseurl: url, start: 0, count: 1000 }
    });
    return data.alerts;
  } catch (err) {
    console.error('❌ Fetch ZAP Alerts error:', err.message);
    throw new Error('Failed to fetch alerts');
  }
};

// Full scan function (dengan optimasi)
export const runZAPFullScan = async (url) => {
  try {
    console.log(`🔍 Starting full scan for: ${url}`);
    await optimizeZAPSettings();          // ✅ optimasi konfigurasi
    await runZAPSpider(url);              // 🕷️ spider klasik
    await runZAPAjaxSpider(url);          // ⚡ ajax spider
    await getZAPPassiveScanResults();      //passive scan
    //await runZAPScan(url);                // 🔥 active scan
    const alerts = await getZAPAlerts(url); // 📋 ambil hasil
    console.log(`✅ Full scan completed for: ${url}`);
    return { alerts };
  } catch (err) {
    console.error(`💥 Full scan failed: ${err.message}`);
    throw new Error(`Full scan error: ${err.message}`);
  }
};
