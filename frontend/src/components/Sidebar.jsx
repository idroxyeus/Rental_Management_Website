import { Link } from "react-router-dom"
import { FaHome, FaBuilding, FaUsers, FaFileContract, FaMoneyBill, FaTools } from "react-icons/fa"

function Sidebar(){
return(
<div className="w-64 h-screen fixed top-0 left-0 
bg-gradient-to-b from-indigo-700 via-purple-700 to-pink-600 
text-white p-6 shadow-2xl">

<h2 className="text-3xl font-extrabold mb-10 tracking-wide">⚡ Rental</h2>

<ul className="space-y-6 text-lg">

<li><Link to="/dashboard" className="flex items-center gap-3 hover:scale-110 transition"><FaHome/> Dashboard</Link></li>
<li><Link to="/properties" className="flex items-center gap-3 hover:scale-110 transition"><FaBuilding/> Properties</Link></li>
<li><Link to="/tenants" className="flex items-center gap-3 hover:scale-110 transition"><FaUsers/> Tenants</Link></li>
<li><Link to="/leases" className="flex items-center gap-3 hover:scale-110 transition"><FaFileContract/> Leases</Link></li>
<li><Link to="/payments" className="flex items-center gap-3 hover:scale-110 transition"><FaMoneyBill/> Payments</Link></li>
<li><Link to="/complaints" className="flex items-center gap-3 hover:scale-110 transition"><FaTools/> Complaints</Link></li>

</ul>

</div>
)
}

export default Sidebar