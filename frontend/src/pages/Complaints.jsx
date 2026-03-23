import { useState, useEffect } from "react"
import { Card, Table, Form, Input, Select, Button, Space, Tag, Popconfirm, message } from "antd"
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons"
import api from "../api/api"

function Complaints() {
  const [data, setData] = useState([])
  const [properties, setProperties] = useState([])
  const [tenants, setTenants] = useState([])
  const [leases, setLeases] = useState([])
  const [userCtx, setUserCtx] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editId, setEditId] = useState(null)
  const [form] = Form.useForm()

  const load = async () => {
    try {
      const [c, p, t, u, l] = await Promise.all([api.get("/complaints"), api.get("/properties"), api.get("/tenants"), api.get("/me"), api.get("/leases")])
      setData(c.data); setProperties(p.data); setTenants(t.data); setUserCtx(u.data); setLeases(l.data)
    } catch(e){console.error(e)} finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const propertyOptions = properties.map(p => ({ value: p.property_id, label: `P-${p.property_id} - ${p.address}` }))
  const tenantOptions = tenants.map(t => ({ value: t.tenant_id, label: `T-${t.tenant_id} - ${t.full_name}` }))

  const selectedPropertyId = Form.useWatch("propertyId", form)
  const activeLease = leases.find(l => l.property_id === selectedPropertyId && l.status === "active")
  const dynamicTenantOpts = activeLease ? tenantOptions.filter(t => t.value === activeLease.tenant_id) : tenantOptions

  useEffect(() => {
    if (activeLease && form.getFieldValue("tenantId") !== activeLease.tenant_id) {
      form.setFieldsValue({ tenantId: activeLease.tenant_id })
    }
  }, [selectedPropertyId, activeLease, form])

  const tenantMap = Object.fromEntries(tenants.map(t => [t.tenant_id, t]))
  const propMap = Object.fromEntries(properties.map(p => [p.property_id, p]))

  const onFinish = async (values) => {
    const hide = message.loading("Saving complaint...", 0)
    try {
      const tenantId = userCtx?.user.role === "tenant" ? userCtx.tenant?.tenant_id : values.tenantId;
      if (editId) { await api.put(`/complaints/${editId}`, { description: values.description, status: values.status }) }
      else { await api.post("/complaints", { tenant_id: tenantId, property_id: values.propertyId, description: values.description, status: values.status || "open" }) }
      hide()
      message.success(editId ? "Complaint updated!" : "Complaint submitted!")
      form.resetFields(); setEditId(null); load()
    } catch (err) { hide(); message.error(err.response?.data?.message || "Failed to submit request") }
  }

  const edit = (r) => { setEditId(r.complaint_id); form.setFieldsValue({ propertyId: r.property_id, tenantId: r.tenant_id, description: r.description, status: r.status }) }
  const cancel = () => { setEditId(null); form.resetFields() }
  const remove = async (id) => {
    const hide = message.loading("Deleting...", 0)
    await api.delete(`/complaints/${id}`); hide(); message.success("Deleted"); load()
  }

  const statusColors = { open: "orange", in_progress: "blue", resolved: "green" }

  const columns = [
    { title: "ID", dataIndex: "complaint_id", key: "id", width: 90, render: (v) => <Tag color="red">C-{v}</Tag>, sorter: (a, b) => a.complaint_id - b.complaint_id },
    { title: "Tenant", dataIndex: "tenant_id", key: "tenant", render: (id) => {
      const t = tenantMap[id]; return <span><Tag color="purple">T-{id}</Tag>{t ? ` ${t.full_name}` : ""}</span>
    }},
    { title: "Property", dataIndex: "property_id", key: "prop", render: (id) => {
      const p = propMap[id]; return <span><Tag color="blue">P-{id}</Tag>{p ? ` ${p.address}` : ""}</span>
    }},
    { title: "Description", dataIndex: "description", key: "desc", ellipsis: true },
    { title: "Status", dataIndex: "status", key: "status", render: (s) => <Tag color={statusColors[s]}>{s?.replace("_", " ")}</Tag>,
      filters: [{ text: "Open", value: "open" }, { text: "In Progress", value: "in_progress" }, { text: "Resolved", value: "resolved" }], onFilter: (v, r) => r.status === v },
  ]

  const resolve = async (r) => {
    const hide = message.loading("Marking resolved...", 0)
    try {
      await api.put(`/complaints/${r.complaint_id}`, { description: r.description, status: "resolved" })
      hide()
      message.success("Complaint marked as resolved")
      load()
    } catch(e) { hide(); message.error("Failed to update status") }
  }

  if (userCtx?.user.role === "tenant") {
    columns.push({
      title: "Actions", key: "actions", width: 140, align: "right",
      render: (_, r) => r.status !== "resolved" ? (
        <Button size="small" type="primary" onClick={() => resolve(r)}>
          Mark as Resolved
        </Button>
      ) : <Tag color="green">Resolved</Tag>
    })
  } else if (userCtx?.user.role !== "tenant") {
    columns.push({
      title: "Actions", key: "actions", width: 120, align: "right",
      render: (_, r) => (
        <Space>
          <Button type="text" icon={<EditOutlined />} onClick={() => edit(r)} />
          <Popconfirm title="Delete this complaint?" onConfirm={() => remove(r.complaint_id)}>
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    })
  }

  return (
    <div>
      <Card className="glass-card" title={editId ? `Edit Complaint C-${editId}` : "File Complaint"} extra={editId && <Button onClick={cancel}>Cancel</Button>} style={{ marginBottom: 24 }}>
        <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{ status: "open" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
            <Form.Item name="propertyId" label="Select Property" rules={[{ required: !editId, message: "Pick a property" }]}>
              <Select placeholder="Search properties..." showSearch disabled={!!editId}
                optionFilterProp="label" options={propertyOptions}
                notFoundContent="No properties available" />
            </Form.Item>
            {userCtx?.user.role !== "tenant" && (
              <Form.Item name="tenantId" label="Tenant" rules={[{ required: true, message: "Pick a tenant" }]}>
                <Select placeholder="Select tenant" options={dynamicTenantOpts} disabled={!!activeLease || !!editId} />
              </Form.Item>
            )}
            <Form.Item name="description" label="Description" rules={[{ required: true }]}>
              <Input.TextArea placeholder="Water leakage in kitchen, broken AC..." rows={1} />
            </Form.Item>
            {userCtx?.user.role !== "tenant" && (
              <Form.Item name="status" label="Status">
                <Select options={[{ value: "open", label: "Open" }, { value: "in_progress", label: "In Progress" }, { value: "resolved", label: "Resolved" }]} />
              </Form.Item>
            )}
          </div>
          <Button type="primary" htmlType="submit" icon={<PlusOutlined />}>{editId ? "Update Complaint" : "File Complaint"}</Button>
        </Form>
      </Card>

      <Card className="glass-card" title={userCtx?.user.role === "tenant" ? "My Complaints" : "All Complaints"}>
        <Table dataSource={data} columns={columns} rowKey="complaint_id" loading={loading}
          pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (t) => `${t} complaints` }} size="middle" scroll={{ x: 700 }} />
      </Card>
    </div>
  )
}

export default Complaints