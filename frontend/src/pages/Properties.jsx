import { useState, useEffect } from "react"
import { Card, Table, Form, Input, Select, Button, Space, Tag, Popconfirm, message } from "antd"
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons"
import api from "../api/api"

function Properties() {
  const [data, setData] = useState([])
  const [userCtx, setUserCtx] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editId, setEditId] = useState(null)
  const [form] = Form.useForm()

  const load = async () => { 
    try { 
      const [p, u] = await Promise.all([api.get("/properties"), api.get("/me")])
      setData(p.data) 
      setUserCtx(u.data)
    } catch(e){console.error(e)} finally{setLoading(false)} 
  }
  useEffect(() => { load() }, [])

  const onFinish = async (values) => {
    try {
      const payload = { address: values.address, property_type: values.type, rent_amount: values.rent, status: values.status }
      if (editId) { await api.put(`/properties/${editId}`, payload) }
      else { await api.post("/properties", payload) }
      message.success(editId ? "Property updated!" : "Property added!")
      form.resetFields(); setEditId(null); load()
    } catch (err) { message.error(err.response?.data?.message || "Failed") }
  }

  const edit = (r) => { setEditId(r.property_id); form.setFieldsValue({ address: r.address, type: r.property_type, rent: r.rent_amount, status: r.status }) }
  const cancel = () => { setEditId(null); form.resetFields() }
  const remove = async (id) => { await api.delete(`/properties/${id}`); message.success("Deleted"); load() }

  const columns = [
    { title: "Property ID", dataIndex: "property_id", key: "id", width: 110, render: (v) => <Tag color="blue">P-{v}</Tag>, sorter: (a, b) => a.property_id - b.property_id },
    { title: "Address", dataIndex: "address", key: "address", ellipsis: true },
    { title: "Type", dataIndex: "property_type", key: "type" },
    { title: "Rent", dataIndex: "rent_amount", key: "rent", render: (v) => <span style={{ fontWeight: 600 }}>₹{v}</span>, sorter: (a, b) => a.rent_amount - b.rent_amount },
    { title: "Status", dataIndex: "status", key: "status", render: (s) => <Tag color={s === "vacant" ? "green" : "orange"}>{s}</Tag>,
      filters: [{ text: "Vacant", value: "vacant" }, { text: "Occupied", value: "occupied" }], onFilter: (val, r) => r.status === val },
  ]

  if (userCtx?.user.role !== "tenant") {
    columns.push({
      title: "Actions", key: "actions", width: 120, align: "right",
      ),
    })
  }

  return (
    <div>
      {userCtx?.user.role !== "tenant" && (
        <Card title={editId ? `Edit Property P-${editId}` : "Add Property"} extra={editId && <Button onClick={cancel}>Cancel</Button>} style={{ marginBottom: 16 }}>
          <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{ status: "vacant" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
              <Form.Item name="address" label="Address" rules={[{ required: true }]}><Input placeholder="123 Main St" /></Form.Item>
              <Form.Item name="type" label="Type" rules={[{ required: true }]}>
                <Select placeholder="Select type" showSearch options={[
                  { value: "Apartment", label: "Apartment" }, { value: "House", label: "House" },
                  { value: "Villa", label: "Villa" }, { value: "Shop", label: "Shop" },
                  { value: "Office", label: "Office" }, { value: "Other", label: "Other" },
                ]} />
              </Form.Item>
              <Form.Item name="rent" label="Rent (₹)" rules={[{ required: true }]}><Input type="number" placeholder="15000" /></Form.Item>
              <Form.Item name="status" label="Status">
                <Select options={[{ value: "vacant", label: "Vacant" }, { value: "occupied", label: "Occupied" }]} />
              </Form.Item>
            </div>
            <Button type="primary" htmlType="submit" icon={<PlusOutlined />}>{editId ? "Update Property" : "Add Property"}</Button>
          </Form>
        </Card>
      )}

      <Card title={userCtx?.user.role === "tenant" ? "Vacant Properties Available" : "All Properties"}>
        <Table dataSource={data} columns={columns} rowKey="property_id" loading={loading}
          pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (t) => `${t} properties` }} size="middle" />
      </Card>
    </div>
  )
}

export default Properties