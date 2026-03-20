import { useState } from "react"
import { Navigate, useNavigate, useLocation, Link } from "react-router-dom"
import { Layout, Menu, Button, Typography, Avatar } from "antd"
import {
  DashboardOutlined, HomeOutlined, TeamOutlined,
  FileTextOutlined, DollarOutlined, WarningOutlined,
  LogoutOutlined,
} from "@ant-design/icons"

const { Sider, Header, Content } = Layout
const { Text } = Typography

const menuItems = [
  { key: "/dashboard", icon: <DashboardOutlined />, label: "Dashboard" },
  { key: "/properties", icon: <HomeOutlined />, label: "Properties" },
  { key: "/tenants", icon: <TeamOutlined />, label: "Tenants" },
  { key: "/leases", icon: <FileTextOutlined />, label: "Leases" },
  { key: "/payments", icon: <DollarOutlined />, label: "Payments" },
  { key: "/complaints", icon: <WarningOutlined />, label: "Complaints" },
]

const pageTitles = {
  "/dashboard": "Dashboard",
  "/properties": "Properties",
  "/tenants": "Tenants",
  "/leases": "Leases",
  "/payments": "Payments",
  "/complaints": "Complaints",
}

function AppLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false)
  const navigate = useNavigate()
  const { pathname } = useLocation()

  if (!localStorage.getItem("token")) return <Navigate to="/" />

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
          background: "linear-gradient(180deg, #1e1b4b 0%, #312e81 100%)",
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
            style={{ backgroundColor: "#6366f1", fontWeight: 700, fontSize: 18, flexShrink: 0 }}
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
          items={menuItems}
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
            background: "#fff",
            padding: "0 28px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid #f0f0f0",
            position: "sticky",
            top: 0,
            zIndex: 40,
            height: 64,
          }}
        >
          <Text strong style={{ fontSize: 18 }}>{pageTitles[pathname] || "Dashboard"}</Text>
          <Button
            icon={<LogoutOutlined />}
            onClick={logout}
            danger
            type="text"
          >
            Logout
          </Button>
        </Header>

        <Content style={{ padding: 24, background: "#f5f5f5", minHeight: "calc(100vh - 64px)" }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  )
}

export default AppLayout
