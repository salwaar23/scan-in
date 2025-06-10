import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './component/Dashboard';
import Scan from './component/Scan';
import GeneratePdfPage from './component/GeneratePDF';
import Report from './component/Report';

function App(){
    return(
        <BrowserRouter>
        <Routes>
            <Route path="/" element={<Dashboard/>}/>
            <Route path="/Scan" element={<Scan/>}/>
            <Route path="/generatepdf" element={<GeneratePdfPage/>}/>
            <Route path="/generatepdf/:id" element={<GeneratePdfPage/>}/>
            <Route path="/report" element={<Report/>}/>
        </Routes>
        </BrowserRouter>
    )
};

export default App;