
import { useState } from "react";
import { Link } from "react-router";

const Sidebar = () => {
    const [openReport, setopenReport] = useState(false);

    return(
        <aside className="bg-[#2A4759] w-64 h-screen fixed">
            <h1 className="text-center text-white font-bold text-3xl py-10">Scan.In</h1>
            <Link to="/"><div className="shadow-2xl">
                <div className="text-md text-center p-4 text-white">Dashboard</div>
            </div></Link>
            <Link to="/Scan"><div className="shadow-2xl">
                <div className="text-md text-center p-4 text-white">Scan</div>
            </div></Link>
            <Link to="/report"><div className="shadow-2xl">
                <div className="text-md text-center p-4 text-white">Report</div>
            </div></Link>
        </aside>
    )
    
};

export default Sidebar;