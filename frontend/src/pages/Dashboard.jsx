import { useEffect, useState } from "react"
import { Card, Row, Col, Statistic, Spin, List, Tag } from "antd"
import {
  HomeOutlined, TeamOutlined, FileTextOutlined,
  DollarOutlined, WarningOutlined,
  CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined
} from "@ant-design/icons"
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler
} from "chart.js"
import { Line } from "react-chartjs-2"
import api from "../api/api"

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

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
          api.get("/payments"), api.get("/complaints"), api.get("/expenses")
        ]).then(([p, t, l, pay, c, exp]) => {
          setStats({ 
            properties: p.data.length, tenants: t.data.length, leases: l.data.length, payments: pay.data.length, complaints: c.data.length,
            propertiesData: p.data, tenantsData: t.data, leasesData: l.data, paymentsData: pay.data, expensesData: exp.data 
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
    const currentExpenses = stats.expensesData?.filter(e => e.expense_date.startsWith(currentMonth))?.reduce((sum, e) => sum + Number(e.amount), 0) || 0;
    return { expected, collected, currentExpenses, netProfit: collected - currentExpenses };
  }
  
  const getChartData = () => {
    // Basic past 6 months aggregation
    const months = [];
    const incomeData = [];
    const expenseData = [];
    const date = new Date();
    for(let i=5; i>=0; i--) {
      const d = new Date(date.getFullYear(), date.getMonth() - i, 1);
      const monthStr = d.toISOString().substring(0, 7);
      months.push(d.toLocaleString('default', { month: 'short' }));
      const monthIncome = stats.paymentsData?.filter(p => p.month === monthStr && p.status === "paid")?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;
      incomeData.push(monthIncome);
      const monthExpense = stats.expensesData?.filter(e => e.expense_date.startsWith(monthStr))?.reduce((sum, e) => sum + Number(e.amount), 0) || 0;
      expenseData.push(monthExpense);
    }
    return {
      labels: months,
      datasets: [
        {
          label: 'Collected Rent (₹)',
          data: incomeData,
          fill: true,
          backgroundColor: 'rgba(99, 102, 241, 0.1)',
          borderColor: 'rgba(99, 102, 241, 1)',
          tension: 0.4,
          pointBackgroundColor: 'rgba(99, 102, 241, 1)',
        },
        {
          label: 'Expenses (₹)',
          data: expenseData,
          fill: true,
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          borderColor: 'rgba(239, 68, 68, 1)',
          tension: 0.4,
          pointBackgroundColor: 'rgba(239, 68, 68, 1)',
        }
      ]
    }
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
          <Card className="text-center py-6 border-red-400 bg-red-50 dark:bg-red-900/20 dark:border-red-800">
            <h3 className="text-red-600 dark:text-red-400 mt-0">Profile Incomplete!</h3>
            <p>Please navigate to your Profile to add your details before you can apply for a lease.</p>
          </Card>
        ) : !l ? (
          <Card className="text-center py-6 bg-slate-50 dark:bg-slate-800/50">
            <h3 className="mt-0">No Active Lease</h3>
            <p className="text-slate-500 dark:text-slate-400">You currently do not have a property assigned to you. Browse Properties to find your next home.</p>
          </Card>
        ) : (
          <Row gutter={[24, 24]}>
            <Col xs={24} md={12}>
              <Card title="My Active Lease" bordered={false} className="card-gradient-tenant" style={{ height: "100%" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
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
              <Card title="Upcoming Payment" bordered={false} style={{ marginTop: 24 }}>
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
              <Card title="Recent Activity" bordered={false} style={{ height: "100%" }}>
                <div style={{ marginBottom: 24 }}>
                  <span style={{ display: "block", color: "#8c8c8c", marginBottom: 4 }}>Recent Payments</span>
                  {tenantStats.payments.slice(0, 2).map(p => (
                    <div key={p.payment_id} className="flex justify-between text-[13px] mb-2 p-2 rounded bg-slate-100 dark:bg-slate-800">
                      <span>{p.month || p.payment_date.split("T")[0]}</span>
                      <strong style={{ color: p.status === "paid" ? "#52c41a" : "#faad14" }}>₹{p.amount} ({p.status})</strong>
                    </div>
                  ))}
                  {tenantStats.payments.length === 0 && <span style={{ fontSize: 13, color: "#bfbfbf" }}>No payments made yet.</span>}
                </div>
                <div>
                  <span style={{ display: "block", color: "#8c8c8c", marginBottom: 4 }}>Recent Maintenance</span>
                  {tenantStats.complaints.slice(0, 2).map(c => (
                    <div key={c.complaint_id} className="flex justify-between text-[13px] mb-2 p-2 rounded bg-slate-100 dark:bg-slate-800">
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
      <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
        {cards.map(({ key, title, icon, color }) => (
          <Col key={key} xs={24} sm={12} lg={8} xl={4}>
            <Card hoverable styles={{ body: { padding: 24 } }} className="hover-scale glass-card">
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

      <Row gutter={[24, 24]}>
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
          <Card className="glass-card" title="Income Overview (Last 6 Months)" styles={{ body: { padding: "16px 24px" } }} style={{ height: "100%" }}>
            <div style={{ height: 260 }}>
              <Line 
                data={getChartData()} 
                options={{ 
                  responsive: true, maintainAspectRatio: false,
                  plugins: { legend: { display: true, position: 'top' } },
                  scales: { y: { beginAtZero: true, grid: { color: "#f0f0f0" } }, x: { grid: { display: false } } },
                  interaction: { mode: 'index', intersect: false }
                }} 
              />
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={12}>
          <Card className="glass-card" title="Profit & Loss (Current Month)" styles={{ body: { padding: 32 } }} style={{ height: "100%" }}>
            <Row gutter={24}>
              <Col span={8}>
                <Statistic title="Expected Rent" value={`₹${computePnl().expected}`} valueStyle={{ color: '#10b981', fontSize: 20 }} />
              </Col>
              <Col span={8}>
                <Statistic title="Collected Rent" value={`₹${computePnl().collected}`} valueStyle={{ color: '#3b82f6', fontSize: 20 }} />
              </Col>
              <Col span={8}>
                <Statistic title="Expenses" value={`₹${computePnl().currentExpenses}`} valueStyle={{ color: '#ef4444', fontSize: 20 }} />
              </Col>
            </Row>
            <div style={{ marginTop: 24, paddingTop: 16, borderTop: "1px dashed #e2e8f0" }}>
               <Statistic title={<span className="text-slate-500 font-bold uppercase tracking-wider text-xs">Net Profit This Month</span>} value={`₹${computePnl().netProfit}`} valueStyle={{ color: computePnl().netProfit >= 0 ? '#10b981' : '#ef4444', fontSize: 28, fontWeight: 800 }} />
            </div>
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