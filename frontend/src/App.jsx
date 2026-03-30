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
import Landing from "./pages/Landing"
import { ThemeProvider, useTheme } from "./context/ThemeContext"

function MainApp() {
  const { isDarkMode } = useTheme();

  return (
    <ConfigProvider
      theme={{
        algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorPrimary: "#6366f1",
          colorInfo: "#3b82f6",
          colorSuccess: "#10b981",
          colorWarning: "#f59e0b",
          colorError: "#ef4444",
          borderRadius: 12,
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        },
        components: {
          Card: {
            boxShadowTertiary: "0 10px 40px -10px rgba(0,0,0,0.08)",
            borderRadiusLG: 16,
          },
          Button: {
            controlHeight: 40,
            borderRadius: 8,
          },
        }
      }}
    >
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
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

function App() {
  return (
    <ThemeProvider>
      <MainApp />
    </ThemeProvider>
  )
}

export default App