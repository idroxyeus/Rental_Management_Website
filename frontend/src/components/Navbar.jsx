import { useNavigate, useLocation } from "react-router-dom"
import { FaSignOutAlt } from "react-icons/fa"

const titles = {
  "/dashboard": "Dashboard",
  "/properties": "Properties",
  "/tenants": "Tenants",
  "/leases": "Leases",
  "/payments": "Payments",
  "/complaints": "Complaints",
}

function Navbar() {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const logout = () => { localStorage.removeItem("token"); navigate("/") }

  return (
    <header className="flex items-center justify-between px-7 py-4 bg-white border-b border-slate-200 sticky top-0 z-40">
      <h1 className="text-xl font-bold text-slate-800">{titles[pathname] || "Dashboard"}</h1>
      <button onClick={logout}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-500
          hover:text-red-600 hover:bg-red-50 rounded-lg border border-slate-200
          hover:border-red-200 transition-all cursor-pointer">
        <FaSignOutAlt className="text-xs" /> Logout
      </button>
    </header>
  )
}

export default Navbar