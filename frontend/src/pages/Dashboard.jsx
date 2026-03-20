import { useEffect, useState } from "react"
import { Card, Row, Col, Statistic, Spin } from "antd"
import {
  HomeOutlined, TeamOutlined, FileTextOutlined,
  DollarOutlined, WarningOutlined,
} from "@ant-design/icons"
import { Bar } from "react-chartjs-2"
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js"
import api from "../api/api"

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const cards = [
  { key: "properties", title: "Properties", icon: <HomeOutlined />, color: "#3b82f6" },
  { key: "tenants", title: "Tenants", icon: <TeamOutlined />, color: "#8b5cf6" },
  { key: "leases", title: "Leases", icon: <FileTextOutlined />, color: "#10b981" },
  { key: "payments", title: "Payments", icon: <DollarOutlined />, color: "#f59e0b" },
  { key: "complaints", title: "Complaints", icon: <WarningOutlined />, color: "#ef4444" },
]

function Dashboard() {
  const [stats, setStats] = useState({ properties: 0, tenants: 0, leases: 0, payments: 0, complaints: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get("/properties"), api.get("/tenants"), api.get("/leases"),
      api.get("/payments"), api.get("/complaints"),
    ]).then(([p, t, l, pay, c]) => {
      setStats({ properties: p.data.length, tenants: t.data.length, leases: l.data.length, payments: pay.data.length, complaints: c.data.length })
    }).catch(console.error).finally(() => setLoading(false))
  }, [])

  const chartData = {
    labels: ["Properties", "Tenants", "Leases", "Payments", "Complaints"],
    datasets: [{
      label: "Count",
      data: Object.values(stats),
      backgroundColor: ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444"],
      borderRadius: 8,
      barThickness: 40,
    }]
  }

  const chartOpts = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, grid: { color: "#f0f0f0" }, ticks: { color: "#8c8c8c" } },
      x: { grid: { display: false }, ticks: { color: "#8c8c8c", font: { weight: 600 } } },
    },
  }

  if (loading) return <div style={{ display: "flex", justifyContent: "center", paddingTop: 100 }}><Spin size="large" /></div>

  return (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {cards.map(({ key, title, icon, color }) => (
          <Col key={key} xs={24} sm={12} lg={8} xl={4}>
            <Card hoverable styles={{ body: { padding: 20 } }}>
              <Statistic
                title={title}
                value={stats[key]}
                prefix={<span style={{
                  display: "inline-flex", width: 40, height: 40, borderRadius: 10,
                  background: color + "15", color: color,
                  alignItems: "center", justifyContent: "center", fontSize: 18, marginRight: 8,
                }}>{icon}</span>}
                valueStyle={{ fontSize: 28, fontWeight: 700 }}
              />
            </Card>
          </Col>
        ))}
      </Row>

      <Card title="Analytics Overview" styles={{ body: { padding: 24 } }}>
        <div style={{ height: 300 }}>
          <Bar data={chartData} options={chartOpts} />
        </div>
      </Card>
    </div>
  )
}

export default Dashboard