import { useState, useEffect } from "react"
import { Card, Table, Form, Input, Select, Button, Space, Tag, Popconfirm, message } from "antd"
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons"
import api from "../api/api"

function Payments() {
  const [data, setData] = useState([])
  const [leases, setLeases] = useState([])
  const [properties, setProperties] = useState([])
  const [tenants, setTenants] = useState([])
  const [loading, setLoading] = useState(true)
  const [userCtx, setUserCtx] = useState(null)
  const [editId, setEditId] = useState(null)
  const [form] = Form.useForm()

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
    const hide = message.loading("Processing payment...", 0)
    try {
      const payload = { amount: values.amount, payment_date: values.date, month: values.month, status: values.status }
      if (editId) { await api.put(`/payments/${editId}`, payload) }
      else { await api.post("/payments", { ...payload, lease_id: values.leaseId }) }
      hide()
      message.success(editId ? "Payment updated!" : "Payment recorded!")
      form.resetFields(); setEditId(null); load()
    } catch (err) { hide(); message.error(err.response?.data?.message || "Failed") }
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
        <Button size="small" type="primary" onClick={() => {
           setEditId(r.payment_id);
           form.setFieldsValue({ leaseId: r.lease_id, amount: r.amount, date: r.payment_date?.split("T")[0] || new Date().toISOString().split("T")[0], month: r.month, status: "paid" });
        }}>Pay Now</Button>
      ) : null
    })
  }

  return (
    <div>
      <Card title={editId ? `Edit Payment PAY-${editId}` : "Record Payment"} extra={editId && <Button onClick={cancel}>Cancel</Button>} style={{ marginBottom: 16 }}>
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
            {userCtx?.user.role !== "tenant" && (
              <Form.Item name="status" label="Status">
                <Select options={[{ value: "paid", label: "Paid" }, { value: "pending", label: "Pending" }, { value: "overdue", label: "Overdue" }]} />
              </Form.Item>
            )}
          </div>
          <Button type="primary" htmlType="submit" icon={<PlusOutlined />}>{editId ? "Update Payment" : "Submit Payment Record"}</Button>
        </Form>
      </Card>

      <Card title={userCtx?.user.role === "tenant" ? "My Payment History" : "All Payments"}>
        <Table dataSource={data} columns={columns} rowKey="payment_id" loading={loading}
          pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (t) => `${t} payments` }} size="middle" scroll={{ x: 800 }} />
      </Card>
    </div>
  )
}

export default Payments