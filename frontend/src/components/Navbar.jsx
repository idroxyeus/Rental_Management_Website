import { useNavigate, useLocation } from "react-router-dom"
import { FaSignOutAlt, FaSun, FaMoon } from "react-icons/fa"
import { useTheme } from "../context/ThemeContext"

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
  const { isDarkMode, toggleTheme } = useTheme()

  const logout = () => { localStorage.removeItem("token"); navigate("/") }

  return (
    <header className="flex items-center justify-between px-7 py-4 bg-white border-b border-slate-200 sticky top-0 z-40 dark:bg-slate-800 dark:border-slate-700">
      <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">{titles[pathname] || "Dashboard"}</h1>
      <div className="flex items-center gap-4">
        <button onClick={toggleTheme} className="p-2 text-slate-500 hover:text-indigo-600 transition-colors bg-slate-100 dark:bg-slate-700 dark:text-slate-300 rounded-full">
          {isDarkMode ? <FaSun className="text-lg" /> : <FaMoon className="text-lg" />}
        </button>
        <button onClick={logout}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-500 dark:text-slate-300
            hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg border border-slate-200 dark:border-slate-700
            hover:border-red-200 transition-all cursor-pointer">
          <FaSignOutAlt className="text-xs" /> Logout
        </button>
      </div>
    </header>
  )
}

export default Navbar