import { useState, useEffect } from "react"
import { Card, Table, Form, Input, Select, Button, Space, Tag, Popconfirm, message } from "antd"
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons"
import api from "../api/api"

function Leases() {
  const [data, setData] = useState([])
  const [properties, setProperties] = useState([])
  const [tenants, setTenants] = useState([])
  const [loading, setLoading] = useState(true)
  const [editId, setEditId] = useState(null)
  const [form] = Form.useForm()

  const load = async () => {
    try {
      const [l, p, t] = await Promise.all([api.get("/leases"), api.get("/properties"), api.get("/tenants")])
      setData(l.data); setProperties(p.data); setTenants(t.data)
    } catch(e){console.error(e)} finally{setLoading(false)}
  }
  useEffect(() => { load() }, [])

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
    try {
      const payload = {
        start_date: values.startDate, end_date: values.endDate,
        rent_amount: values.rent, deposit: values.deposit || 0, status: values.status,
      }
      if (editId) { await api.put(`/leases/${editId}`, payload) }
      else { await api.post("/leases", { ...payload, property_id: values.propertyId, tenant_id: values.tenantId }) }
      message.success(editId ? "Lease updated!" : "Lease created!")
      form.resetFields(); setEditId(null); load()
    } catch (err) { message.error(err.response?.data?.message || "Failed") }
  }

  const edit = (r) => {
    setEditId(r.lease_id)
    form.setFieldsValue({
      propertyId: r.property_id, tenantId: r.tenant_id,
      startDate: r.start_date?.split("T")[0], endDate: r.end_date?.split("T")[0],
      rent: r.rent_amount, deposit: r.deposit, status: r.status,
    })
  }
  const cancel = () => { setEditId(null); form.resetFields() }
  const remove = async (id) => { await api.delete(`/leases/${id}`); message.success("Deleted"); load() }

  const statusColors = { active: "green", expired: "default", terminated: "red" }

  const columns = [
    { title: "Lease ID", dataIndex: "lease_id", key: "id", width: 100, render: (v) => <Tag color="cyan">L-{v}</Tag>, sorter: (a, b) => a.lease_id - b.lease_id },
    { title: "Property", dataIndex: "property_id", key: "prop", render: (id) => {
      const p = propertyMap[id]; return p ? <span><Tag color="blue">P-{id}</Tag> {p.address}</span> : `#${id}`
    }},
    { title: "Tenant", dataIndex: "tenant_id", key: "tenant", render: (id) => {
      const t = tenantMap[id]; return t ? <span><Tag color="purple">T-{id}</Tag> {t.full_name}</span> : `#${id}`
    }},
    { title: "Duration", key: "dur", render: (_, r) => `${r.start_date?.split("T")[0]} → ${r.end_date?.split("T")[0]}` },
    { title: "Rent", dataIndex: "rent_amount", key: "rent", render: (v) => <span style={{ fontWeight: 600 }}>₹{v}</span> },
    { title: "Status", dataIndex: "status", key: "status", render: (s) => <Tag color={statusColors[s]}>{s}</Tag>,
      filters: [{ text: "Active", value: "active" }, { text: "Expired", value: "expired" }, { text: "Terminated", value: "terminated" }], onFilter: (v, r) => r.status === v },
    {
      title: "Actions", key: "actions", width: 120, align: "right",
      render: (_, r) => (
        <Space>
          <Button type="text" icon={<EditOutlined />} onClick={() => edit(r)} />
          <Popconfirm title="Delete this lease?" onConfirm={() => remove(r.lease_id)}>
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <Card title={editId ? `Edit Lease L-${editId}` : "Create Lease"} extra={editId && <Button onClick={cancel}>Cancel</Button>} style={{ marginBottom: 16 }}>
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
            <Form.Item name="startDate" label="Start Date" rules={[{ required: true }]}><Input type="date" /></Form.Item>
            <Form.Item name="endDate" label="End Date" rules={[{ required: true }]}><Input type="date" /></Form.Item>
            <Form.Item name="rent" label="Rent (₹)" rules={[{ required: true }]}><Input type="number" placeholder="15000" /></Form.Item>
            <Form.Item name="deposit" label="Deposit (₹)"><Input type="number" placeholder="30000" /></Form.Item>
            <Form.Item name="status" label="Status">
              <Select options={[{ value: "active", label: "Active" }, { value: "expired", label: "Expired" }, { value: "terminated", label: "Terminated" }]} />
            </Form.Item>
          </div>
          <Button type="primary" htmlType="submit" icon={<PlusOutlined />}>{editId ? "Update Lease" : "Create Lease"}</Button>
        </Form>
      </Card>

      <Card title="All Leases">
        <Table dataSource={data} columns={columns} rowKey="lease_id" loading={loading}
          pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (t) => `${t} leases` }} size="middle" scroll={{ x: 900 }} />
      </Card>
    </div>
  )
}

export default Leases