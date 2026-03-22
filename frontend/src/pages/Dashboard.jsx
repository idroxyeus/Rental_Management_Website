import { useEffect, useState } from "react"
import { Card, Row, Col, Statistic, Spin, List, Tag } from "antd"
import {
  HomeOutlined, TeamOutlined, FileTextOutlined,
  DollarOutlined, WarningOutlined,
  CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined
} from "@ant-design/icons"
import api from "../api/api"

const cards = [
  { key: "properties", title: "Properties", icon: <HomeOutlined />, color: "#3b82f6" },
  { key: "tenants", title: "Tenants", icon: <TeamOutlined />, color: "#8b5cf6" },
  { key: "leases", title: "Leases", icon: <FileTextOutlined />, color: "#10b981" },
  { key: "payments", title: "Payments", icon: <DollarOutlined />, color: "#f59e0b" },
  { key: "complaints", title: "Complaints", icon: <WarningOutlined />, color: "#ef4444" },
]

function getNextPaymentDate(startDateStr) {
  const start = new Date(startDateStr);
  const now = new Date();
  let nextDate = new Date(now.getFullYear(), now.getMonth(), start.getDate());
  if (nextDate < now) {
    nextDate.setMonth(nextDate.getMonth() + 1);
  }
  return nextDate.toISOString().split("T")[0];
}

function Dashboard() {
  const [userCtx, setUserCtx] = useState(null)
  const [stats, setStats] = useState({ properties: 0, tenants: 0, leases: 0, payments: 0, complaints: 0 })
  const [tenantStats, setTenantStats] = useState({ payments: [], complaints: [] })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get("/me").then(res => {
      setUserCtx(res.data)
      if (res.data.user.role === "tenant") {
        Promise.all([api.get("/payments"), api.get("/complaints")])
          .then(([pay, c]) => setTenantStats({ payments: pay.data, complaints: c.data }))
          .finally(() => setLoading(false))
      } else {
        Promise.all([
          api.get("/properties"), api.get("/tenants"), api.get("/leases"),
          api.get("/payments"), api.get("/complaints"),
        ]).then(([p, t, l, pay, c]) => {
          setStats({ 
            properties: p.data.length, tenants: t.data.length, leases: l.data.length, payments: pay.data.length, complaints: c.data.length,
            propertiesData: p.data, tenantsData: t.data, leasesData: l.data, paymentsData: pay.data 
          })
          setTenantStats({ complaints: c.data })
        }).finally(() => setLoading(false))
      }
    }).catch(console.error)
  }, [])

  const computePnl = () => {
    const currentMonth = new Date().toISOString().substring(0, 7);
    const expected = stats.leasesData?.filter(l => l.status === "active")?.reduce((sum, l) => sum + Number(l.rent_amount), 0) || 0;
    const collected = stats.paymentsData?.filter(p => p.month === currentMonth && p.status === "paid")?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;
    return { expected, collected };
  }
  
  const getRemainingDues = () => {
    const currentMonth = new Date().toISOString().substring(0, 7);
    return stats.paymentsData?.filter(p => p.month === currentMonth && p.status !== "paid") || [];
  }

  if (loading) return <div style={{ textAlign: "center", marginTop: 100 }}><Spin size="large" /></div>

  // Tenant POV
  if (userCtx?.user.role === "tenant") {
    const l = userCtx.activeLease
    return (
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>Welcome back, {userCtx.user.name}</h2>
        {!userCtx.tenant ? (
          <Card style={{ textAlign: "center", padding: 40, border: "1px solid #ff4d4f", background: "#fff2f0" }}>
            <h3 style={{ color: "#cf1322", marginTop: 0 }}>Profile Incomplete!</h3>
            <p>Please navigate to your Profile to add your details before you can apply for a lease.</p>
          </Card>
        ) : !l ? (
          <Card style={{ textAlign: "center", padding: 40, background: "#fafafa" }}>
            <h3 style={{ marginTop: 0 }}>No Active Lease</h3>
            <p>You currently do not have a property assigned to you. Browse Properties to find your next home.</p>
          </Card>
        ) : (
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Card title="My Active Lease" bordered={false} style={{ height: "100%", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#8c8c8c" }}>Status</span>
                    <span style={{ color: "#52c41a", fontWeight: "bold" }}>ACTIVE</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#8c8c8c" }}>Rent Amount</span>
                    <span style={{ fontSize: 18, fontWeight: "bold" }}>₹{l.rent_amount}/mo</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#8c8c8c" }}>Security Deposit</span>
                    <span>₹{l.deposit}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#8c8c8c" }}>Lease Duration</span>
                    <span>{l.start_date.split("T")[0]} to {l.end_date.split("T")[0]}</span>
                  </div>
                </div>
              </Card>
              <Card title="Upcoming Payment" bordered={false} style={{ marginTop: 16, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <span style={{ display: "block", color: "#8c8c8c" }}>Next Due Date</span>
                    <strong style={{ fontSize: 16 }}>{getNextPaymentDate(l.start_date)}</strong>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <span style={{ display: "block", color: "#8c8c8c" }}>Amount</span>
                    <strong style={{ fontSize: 18, color: "#f59e0b" }}>₹{l.rent_amount}</strong>
                  </div>
                </div>
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card title="Recent Activity" bordered={false} style={{ height: "100%", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
                <div style={{ marginBottom: 16 }}>
                  <span style={{ display: "block", color: "#8c8c8c", marginBottom: 4 }}>Recent Payments</span>
                  {tenantStats.payments.slice(0, 2).map(p => (
                    <div key={p.payment_id} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 8, padding: 8, background: "#f5f5f5", borderRadius: 4 }}>
                      <span>{p.month || p.payment_date.split("T")[0]}</span>
                      <strong style={{ color: p.status === "paid" ? "#52c41a" : "#faad14" }}>₹{p.amount} ({p.status})</strong>
                    </div>
                  ))}
                  {tenantStats.payments.length === 0 && <span style={{ fontSize: 13, color: "#bfbfbf" }}>No payments made yet.</span>}
                </div>
                <div>
                  <span style={{ display: "block", color: "#8c8c8c", marginBottom: 4 }}>Recent Maintenance</span>
                  {tenantStats.complaints.slice(0, 2).map(c => (
                    <div key={c.complaint_id} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 8, padding: 8, background: "#f5f5f5", borderRadius: 4 }}>
                      <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 150 }}>{c.description}</span>
                      <strong style={{ color: c.status === "resolved" ? "#52c41a" : "#faad14" }}>{c.status.replace("_", " ")}</strong>
                    </div>
                  ))}
                  {tenantStats.complaints.length === 0 && <span style={{ fontSize: 13, color: "#bfbfbf" }}>No complaints filed.</span>}
                </div>
              </Card>
            </Col>
          </Row>
        )}
      </div>
    )
  }

  // Admin / Landlord POV
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

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="Recent Open Complaints" styles={{ body: { padding: 0 } }}>
            {tenantStats.complaints && tenantStats.complaints.filter(c => c.status !== "resolved").length > 0 ? (
              <List
                dataSource={tenantStats.complaints.filter(c => c.status !== "resolved").slice(0, 5)}
                renderItem={item => (
                  <List.Item style={{ padding: "16px 24px" }}>
                    <List.Item.Meta title={`Property P-${item.property_id}`} description={item.description} />
                    <Tag color={item.status === 'open' ? 'red' : 'orange'}>{item.status.replace("_", " ")}</Tag>
                  </List.Item>
                )}
              />
            ) : <div style={{ padding: 24, textAlign: "center", color: "#bfbfbf" }}>No open complaints.</div>}
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Profit & Loss (Current Month)" styles={{ body: { padding: 24 } }} style={{ height: "100%" }}>
            <Row gutter={16}>
              <Col span={12}>
                <Statistic title="Expected Rent" value={`₹${computePnl().expected}`} valueStyle={{ color: '#10b981' }} />
              </Col>
              <Col span={12}>
                <Statistic title="Collected Rent" value={`₹${computePnl().collected}`} valueStyle={{ color: '#3b82f6' }} />
              </Col>
            </Row>
            <div style={{ marginTop: 24 }}>
              <strong>Unpaid Dues This Month</strong>
              <List
                size="small"
                style={{ marginTop: 8 }}
                dataSource={getRemainingDues()}
                renderItem={item => {
                  const lease = stats.leasesData?.find(l => l.lease_id === item.lease_id);
                  const t = stats.tenantsData?.find(x => x.tenant_id === lease?.tenant_id);
                  const p = stats.propertiesData?.find(x => x.property_id === lease?.property_id);
                  return (
                    <List.Item extra={<Tag color="orange">₹{item.amount}</Tag>}>
                      <List.Item.Meta title={t?.full_name || `T-${lease?.tenant_id}`} description={p?.address || `P-${lease?.property_id}`} />
                    </List.Item>
                  )
                }}
              />
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default Dashboard