import { useState, useEffect } from "react"
import { Navigate, useNavigate, useLocation, Link } from "react-router-dom"
import { Layout, Menu, Button, Typography, Avatar, Tag, Space } from "antd"
import {
  DashboardOutlined, HomeOutlined, TeamOutlined,
  FileTextOutlined, DollarOutlined, WarningOutlined,
  LogoutOutlined, UserOutlined, AreaChartOutlined
} from "@ant-design/icons"
import { FaSun, FaMoon } from "react-icons/fa"
import { useTheme } from "../context/ThemeContext"
import api from "../api/api"

const { Sider, Header, Content } = Layout
const { Text } = Typography

const baseMenuItems = [
  { key: "/dashboard", icon: <DashboardOutlined />, label: "Dashboard" },
  { key: "/profile", icon: <UserOutlined />, label: "Profile" },
  { key: "/properties", icon: <HomeOutlined />, label: "Properties" },
  { key: "/tenants", icon: <TeamOutlined />, label: "Tenants", roles: ["admin"] },
  { key: "/leases", icon: <FileTextOutlined />, label: "Leases", requiresLease: true },
  { key: "/payments", icon: <DollarOutlined />, label: "Payments", requiresLease: true },
  { key: "/expenses", icon: <AreaChartOutlined />, label: "Expenses", roles: ["admin"] },
  { key: "/complaints", icon: <WarningOutlined />, label: "Complaints", requiresLease: true },
]

const pageTitles = {
  "/dashboard": "Dashboard",
  "/profile": "My Profile",
  "/properties": "Properties",
  "/tenants": "Tenants",
  "/leases": "Leases",
  "/payments": "Payments",
  "/expenses": "Expenses",
  "/complaints": "Complaints",
}

function AppLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false)
  const [userCtx, setUserCtx] = useState(null)
  const { isDarkMode, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const { pathname } = useLocation()

  useEffect(() => {
    if (!localStorage.getItem("token")) return navigate("/")
    api.get("/me").then(res => setUserCtx(res.data)).catch(() => navigate("/"))
  }, [navigate])

  if (!localStorage.getItem("token")) return <Navigate to="/" />
  if (!userCtx) return <div style={{ padding: 50, textAlign: "center" }}>Loading application...</div>

  const allowedMenus = baseMenuItems.filter(m => {
    if (m.roles && !m.roles.includes(userCtx.user.role)) return false;
    if (userCtx.user.role === "tenant" && m.requiresLease && !userCtx.activeLease) return false;
    return true;
  }).map(({ key, icon, label }) => ({ key, icon, label }))

  const logout = () => {
    localStorage.removeItem("token")
    navigate("/")
  }

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        width={220}
        style={{
          background: "radial-gradient(circle at top left, #1e1b4b 0%, #0f172a 100%)",
          borderRight: "1px solid rgba(255,255,255,0.05)",
          boxShadow: "4px 0 24px rgba(0,0,0,0.2)",
          overflow: "auto",
          height: "100vh",
          position: "fixed",
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 50,
        }}
        theme="dark"
      >
        <div style={{ padding: collapsed ? "20px 12px" : "20px 20px", display: "flex", alignItems: "center", gap: 10 }}>
          <Avatar
            style={{ backgroundColor: "#818cf8", fontWeight: 700, fontSize: 18, flexShrink: 0, boxShadow: "0 4px 12px rgba(99,102,241,0.4)" }}
            size={collapsed ? 36 : 40}
          >
            R
          </Avatar>
          {!collapsed && (
            <div>
              <Text strong style={{ color: "#fff", fontSize: 16, display: "block", lineHeight: 1.2 }}>Rental</Text>
              <Text style={{ color: "#a5b4fc", fontSize: 11, letterSpacing: 2, textTransform: "uppercase" }}>Manager</Text>
            </div>
          )}
        </div>

        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[pathname]}
          items={allowedMenus}
          onClick={({ key }) => navigate(key)}
          style={{
            background: "transparent",
            borderRight: "none",
            marginTop: 8,
          }}
        />
      </Sider>

      <Layout style={{ marginLeft: collapsed ? 80 : 220, transition: "margin-left 0.2s" }}>
        <Header
          style={{
            background: isDarkMode ? "rgba(15, 23, 42, 0.8)" : "rgba(255, 255, 255, 0.7)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            padding: "0 28px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: isDarkMode ? "1px solid rgba(255,255,255,0.05)" : "1px solid rgba(0,0,0,0.04)",
            boxShadow: "0 4px 30px rgba(0,0,0,0.03)",
            position: "sticky",
            top: 0,
            zIndex: 40,
            height: 72,
          }}
        >
          <Text strong style={{ fontSize: 20, letterSpacing: "-0.5px" }}>{pageTitles[pathname] || "Dashboard"}</Text>
          <Space size="large">
            <span style={{ fontSize: 14 }}>
              <Text type="secondary">Welcome, </Text>
              <Text strong>{userCtx.user.name}</Text>
            </span>
            <Tag color={userCtx.user.role === "admin" ? "purple" : userCtx.user.role === "landlord" ? "volcano" : "cyan"} style={{ textTransform: "capitalize", borderRadius: 4, padding: "2px 8px" }}>
              {userCtx.user.role}
            </Tag>
            <Button
              type="text"
              onClick={toggleTheme}
              icon={isDarkMode ? <FaSun className="text-amber-400" /> : <FaMoon />}
              className="flex items-center justify-center p-2"
            />
            <Button
              icon={<LogoutOutlined />}
              onClick={logout}
              danger
              type="text"
              style={{ fontWeight: 500 }}
            >
              Logout
            </Button>
          </Space>
        </Header>

        <Content style={{ padding: "32px 32px", background: isDarkMode ? "#020617" : "#f8fafc", minHeight: "calc(100vh - 72px)" }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  )
}

export default AppLayout
