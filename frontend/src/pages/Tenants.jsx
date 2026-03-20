import { useState, useEffect } from "react"
import { Card, Table, Form, Input, Select, Button, Space, Tag, Popconfirm, Drawer, Divider, Descriptions, message, Typography, Badge } from "antd"
import { PlusOutlined, EditOutlined, DeleteOutlined, TeamOutlined, EyeOutlined, UserOutlined } from "@ant-design/icons"
import api from "../api/api"

const { Title, Text } = Typography

function Tenants() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [editId, setEditId] = useState(null)
  const [form] = Form.useForm()

  // Family drawer state
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectedTenant, setSelectedTenant] = useState(null)
  const [familyMembers, setFamilyMembers] = useState([])
  const [familyLoading, setFamilyLoading] = useState(false)
  const [familyEditId, setFamilyEditId] = useState(null)
  const [familyForm] = Form.useForm()

  const load = async () => { try { setData((await api.get("/tenants")).data) } catch(e){console.error(e)} finally{setLoading(false)} }
  useEffect(() => { load() }, [])

  // ── Tenant CRUD ──
  const onFinish = async (values) => {
    try {
      const payload = {
        full_name: values.full_name, date_of_birth: values.dob || null, gender: values.gender,
        phone_number: values.phone, email: values.email || null, permanent_address: values.address || null,
        aadhaar_number: values.aadhaar || null, pan_number: values.pan || null,
        occupation: values.occupation || null, emergency_contact_name: values.ec_name || null,
        emergency_contact_phone: values.ec_phone || null, id_proof: values.id_proof || null,
      }
      if (editId) { await api.put(`/tenants/${editId}`, payload) }
      else { await api.post("/tenants", { ...payload, user_id: values.user_id }) }
      message.success(editId ? "Tenant updated!" : "Tenant added!")
      form.resetFields(); setEditId(null); load()
    } catch (err) { message.error(err.response?.data?.message || "Failed") }
  }

  const edit = (r) => {
    setEditId(r.tenant_id)
    form.setFieldsValue({
      user_id: r.user_id, full_name: r.full_name, dob: r.date_of_birth?.split("T")[0],
      gender: r.gender, phone: r.phone_number, email: r.email,
      address: r.permanent_address, aadhaar: r.aadhaar_number, pan: r.pan_number,
      occupation: r.occupation, ec_name: r.emergency_contact_name,
      ec_phone: r.emergency_contact_phone, id_proof: r.id_proof,
    })
  }
  const cancel = () => { setEditId(null); form.resetFields() }
  const remove = async (id) => { await api.delete(`/tenants/${id}`); message.success("Deleted"); load() }

  // ── Family Members ──
  const openFamily = async (tenant) => {
    setSelectedTenant(tenant); setDrawerOpen(true); setFamilyLoading(true)
    try { setFamilyMembers((await api.get(`/tenants/${tenant.tenant_id}/family`)).data) }
    catch(e) { console.error(e) }
    finally { setFamilyLoading(false) }
  }

  const addFamily = async (values) => {
    try {
      const payload = {
        full_name: values.fm_name, relationship: values.fm_rel,
        date_of_birth: values.fm_dob || null, gender: values.fm_gender || "male",
        aadhaar_number: values.fm_aadhaar || null, occupation: values.fm_occ || null,
        phone_number: values.fm_phone || null,
      }
      if (familyEditId) {
        await api.put(`/tenants/${selectedTenant.tenant_id}/family/${familyEditId}`, payload)
        setFamilyEditId(null)
      } else {
        await api.post(`/tenants/${selectedTenant.tenant_id}/family`, payload)
      }
      message.success(familyEditId ? "Updated!" : "Family member added!")
      familyForm.resetFields()
      setFamilyMembers((await api.get(`/tenants/${selectedTenant.tenant_id}/family`)).data)
    } catch (err) { message.error(err.response?.data?.message || "Failed") }
  }

  const editFamily = (m) => {
    setFamilyEditId(m.member_id)
    familyForm.setFieldsValue({
      fm_name: m.full_name, fm_rel: m.relationship, fm_dob: m.date_of_birth?.split("T")[0],
      fm_gender: m.gender, fm_aadhaar: m.aadhaar_number, fm_occ: m.occupation, fm_phone: m.phone_number,
    })
  }

  const removeFamily = async (memberId) => {
    await api.delete(`/tenants/${selectedTenant.tenant_id}/family/${memberId}`)
    message.success("Removed")
    setFamilyMembers((await api.get(`/tenants/${selectedTenant.tenant_id}/family`)).data)
  }

  const ic = { style: { width: "100%" } }

  const columns = [
    { title: "ID", dataIndex: "tenant_id", key: "id", width: 90, render: (v) => <Tag color="purple">T-{v}</Tag>, sorter: (a, b) => a.tenant_id - b.tenant_id },
    { title: "Name", dataIndex: "full_name", key: "name", render: (v) => <Text strong>{v}</Text> },
    { title: "Phone", dataIndex: "phone_number", key: "phone" },
    { title: "Gender", dataIndex: "gender", key: "gender", render: (g) => g ? g.charAt(0).toUpperCase() + g.slice(1) : "—" },
    { title: "Aadhaar", dataIndex: "aadhaar_number", key: "aadhaar", render: (v) => v || <Text type="secondary">—</Text> },
    { title: "Occupation", dataIndex: "occupation", key: "occ", render: (v) => v || <Text type="secondary">—</Text> },
    {
      title: "Actions", key: "actions", width: 160, align: "right",
      render: (_, r) => (
        <Space>
          <Button type="text" icon={<TeamOutlined />} onClick={() => openFamily(r)} title="Family Members" />
          <Button type="text" icon={<EditOutlined />} onClick={() => edit(r)} />
          <Popconfirm title="Delete this tenant and all family data?" onConfirm={() => remove(r.tenant_id)}>
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ]

  const familyColumns = [
    { title: "Name", dataIndex: "full_name", key: "name" },
    { title: "Relation", dataIndex: "relationship", key: "rel", render: (v) => <Tag>{v}</Tag> },
    { title: "Gender", dataIndex: "gender", key: "g", render: (g) => g ? g.charAt(0).toUpperCase() + g.slice(1) : "—" },
    { title: "DOB", dataIndex: "date_of_birth", key: "dob", render: (v) => v?.split("T")[0] || "—" },
    { title: "Aadhaar", dataIndex: "aadhaar_number", key: "aa", render: (v) => v || "—" },
    { title: "Occupation", dataIndex: "occupation", key: "occ", render: (v) => v || "—" },
    { title: "Phone", dataIndex: "phone_number", key: "ph", render: (v) => v || "—" },
    {
      title: "", key: "act", width: 80,
      render: (_, m) => (
        <Space>
          <Button type="text" size="small" icon={<EditOutlined />} onClick={() => editFamily(m)} />
          <Popconfirm title="Remove?" onConfirm={() => removeFamily(m.member_id)}>
            <Button type="text" size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div>
      {/* Add / Edit Tenant Form */}
      <Card title={editId ? `Edit Tenant T-${editId}` : "Add Tenant"} extra={editId && <Button onClick={cancel}>Cancel</Button>} style={{ marginBottom: 16 }}>
        <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{ gender: "male" }}>
          <Divider orientation="left" plain><UserOutlined /> Personal Details</Divider>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
            {!editId && <Form.Item name="user_id" label="User ID" rules={[{ required: true }]}><Input type="number" placeholder="Login user ID" /></Form.Item>}
            <Form.Item name="full_name" label="Full Name (as in Aadhaar)" rules={[{ required: true }]}><Input placeholder="Ravi Kumar Sharma" /></Form.Item>
            <Form.Item name="dob" label="Date of Birth"><Input type="date" /></Form.Item>
            <Form.Item name="gender" label="Gender">
              <Select options={[{ value: "male", label: "Male" }, { value: "female", label: "Female" }, { value: "other", label: "Other" }]} />
            </Form.Item>
            <Form.Item name="phone" label="Phone Number" rules={[{ required: true }]}><Input placeholder="+91 9876543210" /></Form.Item>
            <Form.Item name="email" label="Email"><Input placeholder="ravi@example.com" /></Form.Item>
            <Form.Item name="occupation" label="Occupation"><Input placeholder="Software Engineer, Teacher..." /></Form.Item>
          </div>

          <Divider orientation="left" plain>📄 ID Documents</Divider>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
            <Form.Item name="aadhaar" label="Aadhaar Number"><Input placeholder="1234 5678 9012" maxLength={12} /></Form.Item>
            <Form.Item name="pan" label="PAN Number"><Input placeholder="ABCDE1234F" maxLength={10} style={{ textTransform: "uppercase" }} /></Form.Item>
            <Form.Item name="id_proof" label="Other ID Proof"><Input placeholder="Passport, Driving License..." /></Form.Item>
          </div>

          <Divider orientation="left" plain>📍 Address & Emergency</Divider>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 12 }}>
            <Form.Item name="address" label="Permanent Address"><Input.TextArea rows={2} placeholder="Full permanent address as in Aadhaar" /></Form.Item>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Form.Item name="ec_name" label="Emergency Contact Name"><Input placeholder="Contact person" /></Form.Item>
              <Form.Item name="ec_phone" label="Emergency Contact Phone"><Input placeholder="+91 9876543210" /></Form.Item>
            </div>
          </div>

          <Button type="primary" htmlType="submit" icon={<PlusOutlined />} style={{ marginTop: 8 }}>
            {editId ? "Update Tenant" : "Add Tenant"}
          </Button>
        </Form>
      </Card>

      {/* Tenants Table */}
      <Card title="All Tenants">
        <Table dataSource={data} columns={columns} rowKey="tenant_id" loading={loading}
          pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (t) => `${t} tenants` }} size="middle"
          expandable={{
            expandedRowRender: (r) => (
              <Descriptions size="small" column={{ xs: 1, sm: 2, md: 3 }} bordered>
                <Descriptions.Item label="Full Name">{r.full_name}</Descriptions.Item>
                <Descriptions.Item label="DOB">{r.date_of_birth?.split("T")[0] || "—"}</Descriptions.Item>
                <Descriptions.Item label="Email">{r.email || "—"}</Descriptions.Item>
                <Descriptions.Item label="PAN">{r.pan_number || "—"}</Descriptions.Item>
                <Descriptions.Item label="Permanent Address" span={2}>{r.permanent_address || "—"}</Descriptions.Item>
                <Descriptions.Item label="Emergency Contact">{r.emergency_contact_name ? `${r.emergency_contact_name} (${r.emergency_contact_phone || "—"})` : "—"}</Descriptions.Item>
                <Descriptions.Item label="ID Proof">{r.id_proof || "—"}</Descriptions.Item>
              </Descriptions>
            ),
          }}
        />
      </Card>

      {/* Family Members Drawer */}
      <Drawer
        title={selectedTenant ? `Family Members — ${selectedTenant.full_name} (T-${selectedTenant.tenant_id})` : "Family Members"}
        open={drawerOpen} onClose={() => { setDrawerOpen(false); setFamilyEditId(null); familyForm.resetFields() }}
        width={700} placement="right"
      >
        <Card title={familyEditId ? "Edit Family Member" : "Add Family Member"} size="small" style={{ marginBottom: 16 }}
          extra={familyEditId && <Button size="small" onClick={() => { setFamilyEditId(null); familyForm.resetFields() }}>Cancel</Button>}>
          <Form form={familyForm} layout="vertical" onFinish={addFamily} initialValues={{ fm_gender: "male" }} size="small">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <Form.Item name="fm_name" label="Full Name" rules={[{ required: true }]}><Input placeholder="Name" /></Form.Item>
              <Form.Item name="fm_rel" label="Relationship" rules={[{ required: true }]}>
                <Select placeholder="Select..." options={[
                  { value: "spouse", label: "Spouse" }, { value: "son", label: "Son" },
                  { value: "daughter", label: "Daughter" }, { value: "father", label: "Father" },
                  { value: "mother", label: "Mother" }, { value: "brother", label: "Brother" },
                  { value: "sister", label: "Sister" }, { value: "other", label: "Other" },
                ]} />
              </Form.Item>
              <Form.Item name="fm_dob" label="Date of Birth"><Input type="date" /></Form.Item>
              <Form.Item name="fm_gender" label="Gender">
                <Select options={[{ value: "male", label: "Male" }, { value: "female", label: "Female" }, { value: "other", label: "Other" }]} />
              </Form.Item>
              <Form.Item name="fm_aadhaar" label="Aadhaar Number"><Input placeholder="1234 5678 9012" maxLength={12} /></Form.Item>
              <Form.Item name="fm_occ" label="Occupation"><Input placeholder="Student, Retired..." /></Form.Item>
              <Form.Item name="fm_phone" label="Phone"><Input placeholder="+91 ..." /></Form.Item>
            </div>
            <Button type="primary" htmlType="submit" icon={<PlusOutlined />}>{familyEditId ? "Update" : "Add Member"}</Button>
          </Form>
        </Card>

        <Table dataSource={familyMembers} columns={familyColumns} rowKey="member_id"
          loading={familyLoading} pagination={false} size="small" scroll={{ x: 600 }}
          locale={{ emptyText: "No family members added yet" }} />
      </Drawer>
    </div>
  )
}

export default Tenants