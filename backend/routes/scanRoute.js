import express from "express"
import {
    NiktoScan,
    runZapScan,
    getAllScans,
    getZapFindings,
    getNiktoFindings,
    getLatestFindings,
    deleteScanById,
    getAllScansById,
   
} from "../controllers/scanController.js";

const router = express.Router();

router.post('/nikto', NiktoScan);

router.post('/zap', runZapScan);

router.get('/scans', getAllScans);
router.get('/scans/:id', getAllScansById);
router.get('/findings/latest', getLatestFindings);
router.get('/finding/zap', getZapFindings);
router.get('/finding/nikto', getNiktoFindings);
router.delete('/scans/:id', deleteScanById);

export default router;
