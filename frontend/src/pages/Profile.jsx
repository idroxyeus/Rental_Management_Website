import { useState, useEffect } from "react"
import { Card, Form, Input, Select, Button, message, Divider, Tag, Typography } from "antd"
import { UserOutlined, SaveOutlined } from "@ant-design/icons"
import api from "../api/api"

const { Title, Text } = Typography

function Profile() {
  const [loading, setLoading] = useState(true)
  const [context, setContext] = useState(null)
  const [form] = Form.useForm()

  const load = async () => {
    try {
      const res = await api.get("/me")
      setContext(res.data)
      
      if (res.data.user.role === "tenant" && res.data.tenant) {
        const t = res.data.tenant
        form.setFieldsValue({
          full_name: t.full_name, dob: t.date_of_birth?.split("T")[0],
          gender: t.gender, phone: t.phone_number, email: t.email,
          address: t.permanent_address, aadhaar: t.aadhaar_number, pan: t.pan_number,
          id_proof: t.id_proof, occupation: t.occupation, income: t.income,
          ec_name: t.emergency_contact_name, ec_phone: t.emergency_contact_phone,
        })
      } else if (res.data.user.role === "landlord" && res.data.landlord) {
        const l = res.data.landlord
        form.setFieldsValue({
          full_name: l.full_name, phone: l.phone_number, email: l.email,
          address: l.address, id_proof: l.id_proof,
        })
      } else {
        // PRE-FILL defaults if first time
        form.setFieldsValue({ 
          email: res.data.user.email,
          full_name: res.data.user.name 
        })
      }
    } catch(e) { console.error(e) } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const onFinish = async (values) => {
    try {
      if (context.user.role === "tenant") {
        const payload = {
          full_name: values.full_name, date_of_birth: values.dob || null, gender: values.gender,
          phone_number: values.phone, email: values.email || null, permanent_address: values.address || null,
          aadhaar_number: values.aadhaar || null, pan_number: values.pan || null,
          occupation: values.occupation || null, income: values.income || null,
          emergency_contact_name: values.ec_name || null, emergency_contact_phone: values.ec_phone || null,
          id_proof: values.id_proof || null, user_id: context.user.user_id
        }
        if (context.tenant) await api.put(`/tenants/${context.tenant.tenant_id}`, payload)
        else await api.post("/tenants", payload)
      } else if (context.user.role === "landlord") {
        const payload = {
          full_name: values.full_name, phone_number: values.phone, email: values.email,
          address: values.address, id_proof: values.id_proof, user_id: context.user.user_id
        }
        if (context.landlord) await api.put(`/landlords/${context.landlord.landlord_id}`, payload)
        else await api.post("/landlords", payload)
      }
      message.success("Profile saved successfully!")
      load()
    } catch (err) {
      message.error(err.response?.data?.message || "Failed to save profile")
    }
  }

  // Tenant form
  const TenantFields = () => (
    <>
      <Divider orientation="left" plain><UserOutlined /> Personal Details</Divider>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
        <Form.Item name="full_name" label="Full Name" rules={[{ required: true }]}><Input /></Form.Item>
        <Form.Item name="dob" label="Date of Birth"><Input type="date" /></Form.Item>
        <Form.Item name="gender" label="Gender"><Select options={[{ value: "male", label: "Male" }, { value: "female", label: "Female" }, { value: "other", label: "Other" }]} /></Form.Item>
        <Form.Item name="phone" label="Phone" rules={[{ required: true }]}><Input /></Form.Item>
        <Form.Item name="email" label="Email"><Input /></Form.Item>
        <Form.Item name="occupation" label="Occupation"><Input /></Form.Item>
        <Form.Item name="income" label="Monthly Income (₹)"><Input type="number" /></Form.Item>
      </div>
      <Divider orientation="left" plain>📄 Verifications</Divider>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
        <Form.Item name="aadhaar" label="Aadhaar Number"><Input maxLength={12} /></Form.Item>
        <Form.Item name="pan" label="PAN Number"><Input maxLength={10} style={{ textTransform: "uppercase" }} /></Form.Item>
        <Form.Item name="id_proof" label="Other ID Proof"><Input placeholder="Passport, Driving License..." /></Form.Item>
      </div>
      <Divider orientation="left" plain>📍 Contact</Divider>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 12 }}>
        <Form.Item name="address" label="Permanent Address"><Input.TextArea rows={2} /></Form.Item>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Form.Item name="ec_name" label="Emergency Contact"><Input /></Form.Item>
          <Form.Item name="ec_phone" label="Emergency Phone"><Input /></Form.Item>
        </div>
      </div>
    </>
  )

  // Landlord form
  const LandlordFields = () => (
    <>
      <Divider orientation="left" plain><UserOutlined /> Contact Information</Divider>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12 }}>
        <Form.Item name="full_name" label="Full Name" rules={[{ required: true }]}><Input /></Form.Item>
        <Form.Item name="phone" label="Primary Phone" rules={[{ required: true }]}><Input /></Form.Item>
        <Form.Item name="email" label="Contact Email"><Input /></Form.Item>
        <Form.Item name="id_proof" label="ID Proof Document"><Input /></Form.Item>
      </div>
      <Form.Item name="address" label="Mailing Address" style={{ marginTop: 12 }}><Input.TextArea rows={3} /></Form.Item>
    </>
  )

  if (loading || !context) return <div style={{ padding: 24 }}>Loading profile...</div>

  // Admins do not need a profile form for now
  if (context.user.role === "admin") {
    return (
      <Card title="Admin Profile" style={{ maxWidth: 600, margin: "0 auto" }}>
        <Text>You are logged in as an Administrator.</Text>
      </Card>
    )
  }

  return (
    <div style={{ maxWidth: 800, margin: "0 auto" }}>
      <Card title={
        <div>
          <Title level={4} style={{ margin: 0 }}>My Profile</Title>
          <Text type="secondary">Manage your {context.user.role} information.</Text>
        </div>
      }>
        {context.user.role === "tenant" && !context.tenant && (
          <div style={{ marginBottom: 16 }}>
            <Tag color="orange">Missing Profile</Tag>
            <Text type="secondary">Please complete your profile to enable lease applications.</Text>
          </div>
        )}
        
        <Form form={form} layout="vertical" onFinish={onFinish}>
          {context.user.role === "tenant" ? <TenantFields /> : <LandlordFields />}
          
          <Button type="primary" htmlType="submit" icon={<SaveOutlined />} size="large" style={{ marginTop: 16 }}>
            Save Profile
          </Button>
        </Form>
      </Card>
    </div>
  )
}

export default Profile
