import { Link, useLocation } from "react-router-dom"
import { FaHome, FaBuilding, FaUsers, FaFileContract, FaMoneyBillWave, FaExclamationCircle } from "react-icons/fa"

const navItems = [
  { path: "/dashboard", label: "Dashboard", icon: FaHome },
  { path: "/properties", label: "Properties", icon: FaBuilding },
  { path: "/tenants", label: "Tenants", icon: FaUsers },
  { path: "/leases", label: "Leases", icon: FaFileContract },
  { path: "/payments", label: "Payments", icon: FaMoneyBillWave },
  { path: "/complaints", label: "Complaints", icon: FaExclamationCircle },
]

function Sidebar() {
  const { pathname } = useLocation()

  return (
    <aside className="w-60 min-h-screen fixed top-0 left-0 z-50 bg-[#1e1b4b] flex flex-col">
      {/* Logo */}
      <div className="px-6 py-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center text-white font-extrabold text-lg shadow-md">R</div>
        <div>
          <h1 className="text-white font-bold text-lg leading-none">Rental</h1>
          <span className="text-indigo-300 text-[11px] font-medium tracking-widest uppercase">Manager</span>
        </div>
      </div>

      <div className="mt-2 mx-5 h-px bg-indigo-400/10" />

      {/* Links */}
      <nav className="flex-1 px-4 pt-5 pb-4 space-y-1">
        {navItems.map((item) => {
          const { path, label, icon: Icon } = item;
          const active = pathname === path
          return (
            <Link key={path} to={path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                ${active
                  ? "bg-indigo-500 text-white shadow-md shadow-indigo-600/30"
                  : "text-indigo-200/70 hover:bg-indigo-400/10 hover:text-white"
                }`}>
              <Icon className="text-base" />
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="px-5 pb-5">
        <div className="rounded-lg bg-indigo-400/10 px-4 py-3 text-center">
          <p className="text-indigo-300/60 text-[11px]">&copy; 2026 Rental System</p>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar