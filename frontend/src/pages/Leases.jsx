import { useState, useEffect } from "react"
import { useSearchParams } from "react-router-dom"
import { Card, Table, Form, Input, Select, Button, Space, Tag, Popconfirm, message, Typography } from "antd"
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons"
import api from "../api/api"

const { Text } = Typography

function Leases() {
  const [data, setData] = useState([])
  const [properties, setProperties] = useState([])
  const [tenants, setTenants] = useState([])
  const [userCtx, setUserCtx] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editId, setEditId] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [form] = Form.useForm()
  
  const [searchParams] = useSearchParams()
  const pId = searchParams.get("property_id")
  const tId = searchParams.get("tenant_id")

  const load = async () => {
    try {
      const [l, p, t, u] = await Promise.all([api.get("/leases"), api.get("/properties"), api.get("/tenants"), api.get("/me")])
      setData(l.data); setProperties(p.data); setTenants(t.data); setUserCtx(u.data)
      if (pId && tId) {
        form.setFieldsValue({ propertyId: Number(pId), tenantId: Number(tId) })
      }
    } catch(e){console.error(e)} finally{setLoading(false)}
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load() }, [pId, tId])

  const propertyOptions = properties.map(p => ({
    value: p.property_id,
    label: `P-${p.property_id}  •  ${p.address}  (${p.property_type}, ₹${p.rent_amount}, ${p.status})`,
  }))

  const tenantOptions = tenants.map(t => ({
    value: t.tenant_id,
    label: `T-${t.tenant_id}  •  ${t.full_name}  (${t.phone_number})`,
  }))

  const propertyMap = Object.fromEntries(properties.map(p => [p.property_id, p]))
  const tenantMap = Object.fromEntries(tenants.map(t => [t.tenant_id, t]))

  const onFinish = async (values) => {
    setSubmitting(true)
    const hide = message.loading("Saving lease...", 0)
    try {
      const payload = { property_id: values.propertyId, tenant_id: values.tenantId, start_date: values.start, end_date: values.end, rent_amount: values.rent, deposit: values.deposit, status: values.status }
      if (editId) { await api.put(`/leases/${editId}`, payload) }
      else { await api.post("/leases", payload) }
      hide()
      message.success(editId ? "Lease updated! ✔" : "Lease created! ✔")
      form.resetFields(); setEditId(null); load()
    } catch (err) { hide(); message.error(err.response?.data?.message || "Failed") }
    finally { setSubmitting(false) }
  }

  const edit = (r) => { setEditId(r.lease_id); form.setFieldsValue({ propertyId: r.property_id, tenantId: r.tenant_id, start: r.start_date?.split("T")[0], end: r.end_date?.split("T")[0], rent: r.rent_amount, deposit: r.deposit, status: r.status }) }
  const cancel = () => { setEditId(null); form.resetFields() }
  const remove = async (id) => { 
    const hide = message.loading("Deleting...", 0)
    await api.delete(`/leases/${id}`); hide(); message.success("Deleted"); load() 
  }

  const statusColors = { active: "green", expired: "default", terminated: "red" }

  const columns = [
    { title: "ID", dataIndex: "lease_id", key: "id", width: 90, render: (v) => <Tag color="cyan">L-{v}</Tag>, sorter: (a, b) => a.lease_id - b.lease_id },
    { title: "Property", dataIndex: "property_id", key: "pid", render: (v) => <Text strong>{properties.find(p => p.property_id === v)?.address || `P-${v}`}</Text> },
    { title: "Tenant", dataIndex: "tenant_id", key: "tenant", render: (id) => {
      const t = tenantMap[id]; return t ? <span><Tag color="purple">T-{id}</Tag> {t.full_name}</span> : `#${id}`
    }},
    { title: "Duration", key: "dur", render: (_, r) => `${r.start_date?.split("T")[0]} → ${r.end_date?.split("T")[0]}` },
    { title: "Rent", dataIndex: "rent_amount", key: "rent", render: (v) => <span style={{ fontWeight: 600 }}>₹{v}</span> },
    { title: "Status", dataIndex: "status", key: "status", render: (s) => <Tag color={statusColors[s]}>{s}</Tag>,
      filters: [{ text: "Active", value: "active" }, { text: "Expired", value: "expired" }, { text: "Terminated", value: "terminated" }], onFilter: (v, r) => r.status === v },
  ]

  if (userCtx?.user.role !== "tenant") {
    columns.push({
      title: "Actions", key: "actions", width: 120, align: "right",
      render: (_, r) => (
        <Space>
          <Button type="text" icon={<EditOutlined />} onClick={() => edit(r)} />
          <Popconfirm title="Delete this lease?" onConfirm={() => remove(r.lease_id)}>
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    })
  }

  return (
    <div>
      {userCtx?.user.role !== "tenant" && (
        <Card className="glass-card" title={editId ? `Edit Lease L-${editId}` : "Create Lease"} extra={editId && <Button onClick={cancel}>Cancel</Button>} style={{ marginBottom: 24 }}>
          <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{ status: "active" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
              <Form.Item name="propertyId" label="Select Property" rules={[{ required: !editId, message: "Pick a property" }]}>
                <Select placeholder="Search properties..." showSearch disabled={!!editId}
                  optionFilterProp="label" options={propertyOptions}
                  notFoundContent="No properties available" />
              </Form.Item>
              <Form.Item name="tenantId" label="Select Tenant" rules={[{ required: !editId, message: "Pick a tenant" }]}>
                <Select placeholder="Search tenants..." showSearch disabled={!!editId}
                  optionFilterProp="label" options={tenantOptions}
                  notFoundContent="No tenants available" />
              </Form.Item>
              <Form.Item name="start" label="Start Date" rules={[{ required: true }]}><Input type="date" /></Form.Item>
              <Form.Item name="end" label="End Date" rules={[{ required: true }]}><Input type="date" /></Form.Item>
              <Form.Item name="rent" label="Rent (₹)" rules={[{ required: true }]}><Input type="number" placeholder="15000" /></Form.Item>
              <Form.Item name="deposit" label="Deposit (₹)"><Input type="number" placeholder="30000" /></Form.Item>
              <Form.Item name="status" label="Status">
                <Select options={[{ value: "active", label: "Active" }, { value: "expired", label: "Expired" }, { value: "terminated", label: "Terminated" }]} />
              </Form.Item>
            </div>
            <Button type="primary" htmlType="submit" icon={<PlusOutlined />} loading={submitting}>{editId ? "Update Lease" : "Create Lease"}</Button>
          </Form>
        </Card>
      )}

      <Card className="glass-card" title={userCtx?.user.role === "tenant" ? "My Active Leases" : "All Leases"}>
        <Table dataSource={data} columns={columns} rowKey="lease_id" loading={loading}
          pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (t) => `${t} leases` }} size="middle" scroll={{ x: 900 }} />
      </Card>
    </div>
  )
}

export default Leases