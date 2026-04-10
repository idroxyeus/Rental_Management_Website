import { useState, useEffect } from "react"
import { Card, Table, Form, Input, Select, Button, Space, Tag, Popconfirm, message, Modal, Spin, Typography, Divider } from "antd"
import { PlusOutlined, EditOutlined, DeleteOutlined, DownloadOutlined, CreditCardOutlined, LockOutlined, CheckCircleFilled } from "@ant-design/icons"
import api from "../api/api"
import confetti from "canvas-confetti"

const { Text, Title } = Typography

function Payments() {
  const [data, setData] = useState([])
  const [leases, setLeases] = useState([])
  const [properties, setProperties] = useState([])
  const [tenants, setTenants] = useState([])
  const [loading, setLoading] = useState(true)
  const [userCtx, setUserCtx] = useState(null)
  const [editId, setEditId] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [form] = Form.useForm()

  const [checkoutPayment, setCheckoutPayment] = useState(null)
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [checkoutSuccess, setCheckoutSuccess] = useState(false)

  const load = async () => {
    try {
      const u = await api.get("/me")
      if (u.data.user.role !== "tenant") {
        await api.post("/payments/generate").catch(() => {})
      }
      const [pay, l, p, t] = await Promise.all([api.get("/payments"), api.get("/leases"), api.get("/properties"), api.get("/tenants")])
      setData(pay.data); setLeases(l.data); setProperties(p.data); setTenants(t.data); setUserCtx(u.data)
    } catch(e){console.error(e)} finally{setLoading(false)}
  }
  useEffect(() => { load() }, [])

  const propMap = Object.fromEntries(properties.map(p => [p.property_id, p]))
  const tenantMap = Object.fromEntries(tenants.map(t => [t.tenant_id, t]))

  const leaseOptions = leases.map(l => {
    const p = propMap[l.property_id]; const t = tenantMap[l.tenant_id]
    return {
      value: l.lease_id,
      label: `L-${l.lease_id}  •  ${p ? p.address : "Property #" + l.property_id}  →  ${t ? t.full_name : "Tenant #" + l.tenant_id}  (₹${l.rent_amount}/mo, ${l.status})`,
    }
  })

  const leaseMap = Object.fromEntries(leases.map(l => [l.lease_id, l]))

  const onFinish = async (values) => {
    setSubmitting(true)
    const hide = message.loading("Processing payment...", 0)
    try {
      const payload = { amount: values.amount, payment_date: values.date, month: values.month, status: values.status }
      if (editId) { await api.put(`/payments/${editId}`, payload) }
      else { await api.post("/payments", { ...payload, lease_id: values.leaseId }) }
      hide()
      message.success(editId ? "Payment updated! ✔" : "Payment recorded! ✔")
      form.resetFields(); setEditId(null); load()
    } catch (err) { hide(); message.error(err.response?.data?.message || "Failed") }
    finally { setSubmitting(false) }
  }

  const edit = (r) => {
    setEditId(r.payment_id)
    form.setFieldsValue({ leaseId: r.lease_id, amount: r.amount, date: r.payment_date?.split("T")[0], month: r.month, status: r.status })
  }
  const cancel = () => { setEditId(null); form.resetFields() }
  const remove = async (id) => {
    const hide = message.loading("Deleting...", 0)
    await api.delete(`/payments/${id}`); hide(); message.success("Deleted"); load()
  }

  const handleCheckout = async () => {
    setCheckoutLoading(true)
    await new Promise(r => setTimeout(r, 2000)) // Mock gateway delay
    try {
      await api.put(`/payments/${checkoutPayment.payment_id}`, {
        amount: checkoutPayment.amount,
        payment_date: new Date().toISOString().split("T")[0],
        month: checkoutPayment.month,
        status: "paid"
      });
      setCheckoutSuccess(true)
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#6366f1', '#10b981', '#f59e0b', '#ec4899']
      });
      load()
    } catch(err) {
      message.error("Payment failed. Please try again.")
    } finally {
      setCheckoutLoading(false)
    }
  }

  const closeCheckout = () => {
    setCheckoutPayment(null)
    setTimeout(() => setCheckoutSuccess(false), 300)
  }

  const exportCSV = () => {
    const headers = ["Payment ID", "Lease ID", "Amount", "Date", "Month", "Status"];
    const csvData = data.map(p => [
      p.payment_id, p.lease_id, p.amount, p.payment_date?.split("T")[0], p.month, p.status
    ]);
    const csvContent = [headers, ...csvData].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `payments_export_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  }

  const statusColors = { paid: "green", pending: "orange", overdue: "red" }

  const columns = [
    { title: "Payment ID", dataIndex: "payment_id", key: "id", width: 110, render: (v) => <Tag color="gold">PAY-{v}</Tag>, sorter: (a, b) => a.payment_id - b.payment_id },
    { title: "Lease", dataIndex: "lease_id", key: "lease", render: (id) => {
      const l = leaseMap[id]; const p = l && propMap[l.property_id]
      return <span><Tag color="cyan">L-{id}</Tag>{p ? ` ${p.address}` : ""}</span>
    }},
    { title: "Amount", dataIndex: "amount", key: "amt", render: (v) => <span style={{ fontWeight: 600 }}>₹{v}</span>, sorter: (a, b) => a.amount - b.amount },
    { title: "Date", dataIndex: "payment_date", key: "date", render: (v) => v?.split("T")[0] },
    { title: "Month", dataIndex: "month", key: "month", render: (v) => v || <span style={{ color: "#bbb" }}>—</span> },
    { title: "Status", dataIndex: "status", key: "status", render: (s) => <Tag color={statusColors[s]}>{s}</Tag>,
      filters: [{ text: "Paid", value: "paid" }, { text: "Pending", value: "pending" }, { text: "Overdue", value: "overdue" }], onFilter: (v, r) => r.status === v },
  ]

  if (userCtx?.user.role !== "tenant") {
    columns.push({
      title: "Actions", key: "actions", width: 120, align: "right",
      render: (_, r) => (
        <Space>
          <Button type="text" icon={<EditOutlined />} onClick={() => edit(r)} />
          <Popconfirm title="Delete this payment?" onConfirm={() => remove(r.payment_id)}>
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    })
  } else {
    columns.push({
      title: "Actions", key: "actions", width: 120, align: "right",
      render: (_, r) => r.status === 'pending' ? (
        <Button size="small" type="primary" onClick={() => setCheckoutPayment(r)} className="bg-gradient-to-r from-indigo-500 to-purple-500 border-0 shadow-sm shadow-indigo-200 dark:shadow-none hover:shadow-indigo-300">
           Pay Now
        </Button>
      ) : null
    })
  }

  return (
    <div>
      {userCtx?.user.role !== "tenant" && (
        <Card className="glass-card" title={editId ? `Edit Payment PAY-${editId}` : "Record Payment"} extra={editId && <Button onClick={cancel}>Cancel</Button>} style={{ marginBottom: 24 }}>
          <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{ status: "pending" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
              <Form.Item name="leaseId" label="Select Lease" rules={[{ required: !editId, message: "Pick a lease" }]}>
                <Select placeholder="Search leases..." showSearch disabled={!!editId}
                  optionFilterProp="label" options={leaseOptions}
                  notFoundContent="No leases available" />
              </Form.Item>
              <Form.Item name="amount" label="Amount (₹)" rules={[{ required: true }]}><Input type="number" placeholder="15000" /></Form.Item>
              <Form.Item name="date" label="Payment Date" rules={[{ required: true }]}><Input type="date" /></Form.Item>
              <Form.Item name="month" label="Month"><Input placeholder="March 2026" /></Form.Item>
              <Form.Item name="status" label="Status">
                <Select options={[{ value: "paid", label: "Paid" }, { value: "pending", label: "Pending" }, { value: "overdue", label: "Overdue" }]} />
              </Form.Item>
            </div>
            <Button type="primary" htmlType="submit" icon={<PlusOutlined />} loading={submitting}>{editId ? "Update Payment" : "Submit Payment Record"}</Button>
          </Form>
        </Card>
      )}

      <Card 
        className="glass-card" 
        title={userCtx?.user.role === "tenant" ? "My Payment History" : "All Payments"}
        extra={<Button icon={<DownloadOutlined />} onClick={exportCSV}>Export CSV</Button>}
      >
        <Table dataSource={data} columns={columns} rowKey="payment_id" loading={loading}
          pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (t) => `${t} payments` }} size="middle" scroll={{ x: 800 }} />
      </Card>
      <Modal
        open={!!checkoutPayment}
        footer={null}
        onCancel={closeCheckout}
        width={420}
        destroyOnClose
        centered
        className="checkout-modal"
        styles={{ content: { borderRadius: 16, padding: "32px 24px" } }}
      >
        {checkoutSuccess ? (
          <div className="text-center py-8">
            <CheckCircleFilled className="text-6xl text-emerald-500 mb-4" />
            <Title level={3} className="!mt-0 !mb-2 text-slate-800 dark:text-white">Payment Successful!</Title>
            <Text className="text-slate-500 dark:text-slate-400 block mb-6">Your rent for {checkoutPayment?.month} has been paid.</Text>
            <Button type="primary" block size="large" onClick={closeCheckout} className="bg-emerald-500 hover:bg-emerald-600 border-0 h-12 text-lg font-medium rounded-xl shadow-lg shadow-emerald-200 dark:shadow-none">
              Done
            </Button>
          </div>
        ) : (
          <Spin spinning={checkoutLoading} tip="Processing Payment..." size="large">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                <CreditCardOutlined />
              </div>
              <Text className="text-slate-500 dark:text-slate-400 font-medium uppercase tracking-widest text-xs">Total to Pay</Text>
              <Title level={2} className="!mt-1 !mb-0 text-slate-800 dark:text-white">₹{checkoutPayment?.amount}</Title>
              <Text className="text-slate-400 text-sm">Rent for {checkoutPayment?.month}</Text>
            </div>
            
            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 mb-6">
              <Form layout="vertical" requiredMark={false}>
                <Form.Item label={<span className="text-slate-500 dark:text-slate-400 mb-1 text-xs uppercase font-bold tracking-wider">Card Details</span>} className="mb-0">
                  <div className="border border-slate-200 dark:border-slate-600 rounded-lg overflow-hidden bg-white dark:bg-slate-900 focus-within:ring-2 focus-within:ring-indigo-500 transition-shadow">
                    <Input placeholder="Card number" bordered={false} className="border-b border-slate-200 dark:border-slate-700 rounded-none h-11" suffix={<CreditCardOutlined className="text-slate-400" />} />
                    <div className="flex">
                      <Input placeholder="MM / YY" bordered={false} className="border-r border-slate-200 dark:border-slate-700 rounded-none h-11 w-1/2" />
                      <Input placeholder="CVC" bordered={false} className="rounded-none h-11 w-1/2" />
                    </div>
                  </div>
                </Form.Item>
              </Form>
            </div>

            <Button 
              type="primary" 
              block 
              size="large" 
              onClick={handleCheckout} 
              className="bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-500 border-0 h-14 text-lg font-medium rounded-xl shadow-xl shadow-slate-200 dark:shadow-none flex items-center justify-center gap-2"
            >
              Pay ₹{checkoutPayment?.amount}
            </Button>

            <div className="text-center mt-5 text-slate-400 dark:text-slate-500 flex items-center gap-1 justify-center text-xs">
              <LockOutlined /> Secured by RentalManager Pay
            </div>
          </Spin>
        )}
      </Modal>

    </div>
  )
}

export default Payments