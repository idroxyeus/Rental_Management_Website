import { BrowserRouter, Routes, Route } from "react-router-dom"
import { ConfigProvider, theme } from "antd"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Dashboard from "./pages/Dashboard"
import Properties from "./pages/Properties"
import Tenants from "./pages/Tenants"
import Leases from "./pages/Leases"
import Payments from "./pages/Payments"
import Complaints from "./pages/Complaints"
import Profile from "./pages/Profile"
import AppLayout from "./components/AppLayout"

function App() {
  return (
    <ConfigProvider
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: {
          colorPrimary: "#4f46e5",
          borderRadius: 8,
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        },
      }}
    >
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<AppLayout><Profile /></AppLayout>} />
          <Route path="/dashboard" element={<AppLayout><Dashboard /></AppLayout>} />
          <Route path="/properties" element={<AppLayout><Properties /></AppLayout>} />
          <Route path="/tenants" element={<AppLayout><Tenants /></AppLayout>} />
          <Route path="/leases" element={<AppLayout><Leases /></AppLayout>} />
          <Route path="/payments" element={<AppLayout><Payments /></AppLayout>} />
          <Route path="/complaints" element={<AppLayout><Complaints /></AppLayout>} />
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  )
}

export default App