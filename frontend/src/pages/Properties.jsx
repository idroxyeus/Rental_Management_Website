import { useState, useEffect } from "react"
import { Card, Table, Form, Input, Select, Button, Space, Tag, Popconfirm, message, Descriptions, Drawer } from "antd"
import { useNavigate } from "react-router-dom"
import { PlusOutlined, EditOutlined, DeleteOutlined, HeartOutlined, EyeOutlined, CheckOutlined } from "@ant-design/icons"
import api from "../api/api"

function Properties() {
  const [data, setData] = useState([])
  const [userCtx, setUserCtx] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editId, setEditId] = useState(null)
  const [form] = Form.useForm()
  const navigate = useNavigate()
  
  const [clickedInterests, setClickedInterests] = useState([])
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [selectedProperty, setSelectedProperty] = useState(null)

  const load = async () => { 
    try { 
      const [p, u] = await Promise.all([api.get("/properties"), api.get("/me")])
      setData(p.data) 
      setUserCtx(u.data)
    } catch(e){console.error(e)} finally{setLoading(false)} 
  }
  useEffect(() => { load() }, [])

  const onFinish = async (values) => {
    const hide = message.loading("Saving property...", 0)
    try {
      const payload = { address: values.address, property_type: values.type, rent_amount: values.rent, status: values.status }
      if (editId) { await api.put(`/properties/${editId}`, payload) }
      else { await api.post("/properties", payload) }
      hide()
      message.success(editId ? "Property updated!" : "Property added!")
      form.resetFields(); setEditId(null); load()
    } catch (err) { hide(); message.error(err.response?.data?.message || "Failed") }
  }

  const edit = (r) => { setEditId(r.property_id); form.setFieldsValue({ address: r.address, type: r.property_type, rent: r.rent_amount, status: r.status }) }
  const cancel = () => { setEditId(null); form.resetFields() }
  const remove = async (id) => { 
    const hide = message.loading("Deleting...", 0)
    await api.delete(`/properties/${id}`); hide(); message.success("Deleted"); load() 
  }

  const handleInterest = async (id) => {
    const hide = message.loading("Expressing interest...", 0)
    try {
      await api.post(`/properties/${id}/interest`)
      hide()
      message.success("Interest sent to landlord!")
      setClickedInterests(prev => [...prev, id])
    } catch(e) { hide(); message.error(e.response?.data?.message || "Failed to express interest") }
  }

  const viewDetails = (r) => { setSelectedProperty(r); setDetailsOpen(true) }

  const columns = [
    { title: "Property ID", dataIndex: "property_id", key: "id", width: 110, render: (v) => <Tag color="blue">P-{v}</Tag>, sorter: (a, b) => a.property_id - b.property_id },
    { title: "Address", dataIndex: "address", key: "address", ellipsis: true },
    { title: "Type", dataIndex: "property_type", key: "type" },
    { title: "Rent", dataIndex: "rent_amount", key: "rent", render: (v) => <span style={{ fontWeight: 600 }}>₹{v}</span>, sorter: (a, b) => a.rent_amount - b.rent_amount },
    { title: "Status", dataIndex: "status", key: "status", render: (s) => <Tag color={s === "vacant" ? "green" : "orange"}>{s}</Tag>,
      filters: [{ text: "Vacant", value: "vacant" }, { text: "Occupied", value: "occupied" }], onFilter: (val, r) => r.status === val },
  ]

  if (userCtx?.user.role === "tenant") {
    columns.push({
      title: "Actions", key: "actions", width: 150, align: "right",
      render: (_, r) => r.status === "vacant" ? (
        <Button size="small" type="primary" disabled={clickedInterests.includes(r.property_id)} icon={clickedInterests.includes(r.property_id) ? <CheckOutlined /> : <HeartOutlined />} onClick={() => handleInterest(r.property_id)}>
          {clickedInterests.includes(r.property_id) ? "Interested" : "I'm Interested"}
        </Button>
      ) : null
    })
  } else if (userCtx?.user.role && userCtx.user.role !== "tenant") {
    columns.push({
      title: "Actions", key: "actions", width: 280, align: "right",
      render: (_, r) => (
        <Space>
          <Button size="small" onClick={() => navigate(`/tenants?interested_in=${r.property_id}`)} icon={<HeartOutlined />}>Interests</Button>
          <Button size="small" onClick={() => viewDetails(r)} icon={<EyeOutlined />}>View Details</Button>
          <Button type="text" icon={<EditOutlined />} onClick={() => edit(r)} />
          <Popconfirm title="Delete this property?" onConfirm={() => remove(r.property_id)}>
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
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

      {userCtx?.user.role === "tenant" && userCtx.activeLease && data.find(p => p.property_id === userCtx.activeLease.property_id) && (
        <Card title="My Current Property" style={{ marginBottom: 24, boxShadow: "0 4px 12px rgba(0,0,0,0.05)", borderLeft: "4px solid #10b981" }}>
          <Descriptions column={{ xxl: 4, xl: 3, lg: 3, md: 3, sm: 2, xs: 1 }} bordered>
            <Descriptions.Item label="Property ID"><Tag color="blue">P-{userCtx.activeLease.property_id}</Tag></Descriptions.Item>
            <Descriptions.Item label="Address" span={2}>{data.find(p => p.property_id === userCtx.activeLease.property_id).address}</Descriptions.Item>
            <Descriptions.Item label="Type">{data.find(p => p.property_id === userCtx.activeLease.property_id).property_type}</Descriptions.Item>
            <Descriptions.Item label="Rent">₹{userCtx.activeLease.rent_amount}</Descriptions.Item>
            <Descriptions.Item label="Status"><Tag color="green">Occupied (By You)</Tag></Descriptions.Item>
          </Descriptions>
        </Card>
      )}

      <Card title={userCtx?.user.role === "tenant" ? "Vacant Properties Available" : "All Properties"}>
        <Table dataSource={userCtx?.user.role === "tenant" ? data.filter(p => p.status === "vacant" || p.property_id === userCtx.activeLease?.property_id) : data} 
          columns={columns} rowKey="property_id" loading={loading}
          pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (t) => `${t} properties` }} size="middle" />
      </Card>

      {/* Landlord View Details Drawer */}
      <Drawer title={`Property Details: P-${selectedProperty?.property_id}`} open={detailsOpen} onClose={() => setDetailsOpen(false)} width={400}>
        {selectedProperty && (
          <Descriptions column={1} bordered>
            <Descriptions.Item label="Property ID">P-{selectedProperty.property_id}</Descriptions.Item>
            <Descriptions.Item label="Address">{selectedProperty.address}</Descriptions.Item>
            <Descriptions.Item label="Type">{selectedProperty.property_type}</Descriptions.Item>
            <Descriptions.Item label="Rent">₹{selectedProperty.rent_amount}</Descriptions.Item>
            <Descriptions.Item label="Status"><Tag color={selectedProperty.status === "vacant" ? "green" : "orange"}>{selectedProperty.status}</Tag></Descriptions.Item>
          </Descriptions>
        )}
        {selectedProperty?.status === "occupied" && userCtx?.user.role !== "tenant" && (
           <Button type="primary" style={{ marginTop: 16, width: "100%" }} onClick={() => navigate(`/tenants?property_id=${selectedProperty.property_id}`)}>
             Update Family Members
           </Button>
        )}
      </Drawer>
    </div>
  )
}

export default Properties