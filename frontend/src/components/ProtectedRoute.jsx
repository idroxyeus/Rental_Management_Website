import { Navigate } from "react-router-dom"
import Sidebar from "./Sidebar"
import Navbar from "./Navbar"

function ProtectedRoute({ children }) {
  if (!localStorage.getItem("token")) return <Navigate to="/" />

  return (
    <div className="flex min-h-screen bg-[#f1f5f9]">
      <Sidebar />
      <div className="ml-60 flex-1 flex flex-col min-w-0">
        <Navbar />
        <main className="flex-1 p-7 overflow-x-hidden">{children}</main>
      </div>
    </div>
  )
}

export default ProtectedRoute