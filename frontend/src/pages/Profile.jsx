import { useState, useEffect } from "react"
import { Card, Form, Input, Select, Button, message, Divider, Tag, Typography } from "antd"
import { UserOutlined, SaveOutlined } from "@ant-design/icons"
import api from "../api/api"

const { Title, Text } = Typography

function Profile() {
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
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
          occupation: t.occupation, income: t.income,
          ec_name: t.emergency_contact_name, ec_phone: t.emergency_contact_phone,
        })
      } else if (res.data.user.role === "landlord" && res.data.landlord) {
        const l = res.data.landlord
        form.setFieldsValue({
          full_name: l.full_name, phone: l.phone_number, email: l.email, address: l.address,
        })
      } else {
        form.setFieldsValue({ email: res.data.user.email, full_name: res.data.user.name })
      }
    } catch(e) { console.error(e) } finally { setLoading(false) }
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load() }, [])

  const onFinish = async (values) => {
    setSubmitting(true)
    const hide = message.loading("Updating profile...", 0)
    try {
      if (context.user.role === "tenant") {
        const payload = {
          full_name: values.full_name,
          date_of_birth: values.dob || null,
          gender: values.gender || "male",
          phone_number: values.phone,
          email: values.email || null,
          permanent_address: values.address || null,
          aadhaar_number: values.aadhaar || null,
          pan_number: values.pan || null,
          occupation: values.occupation || null,
          income: values.income || null,
          emergency_contact_name: values.ec_name || null,
          emergency_contact_phone: values.ec_phone || null,
          user_id: context.user.user_id
        }
        if (context.tenant) await api.put(`/tenants/${context.tenant.tenant_id}`, payload)
        else await api.post("/tenants", payload)
      } else if (context.user.role === "landlord") {
        const payload = {
          full_name: values.full_name, phone_number: values.phone,
          email: values.email, address: values.address, user_id: context.user.user_id
        }
        if (context.landlord) await api.put(`/landlords/${context.landlord.landlord_id}`, payload)
        else await api.post("/landlords", payload)
      }
      hide()
      message.success("Profile updated successfully! ✔")
      load()
    } catch (e) {
      hide()
      message.error(e.response?.data?.message || "Failed to update profile")
    } finally { setSubmitting(false) }
  }

  const onFinishFailed = () => {
    message.error("Please fill all required fields marked with *")
  }

  if (loading || !context) return <div style={{ padding: 24 }}>Loading profile...</div>

  if (context.user.role === "admin") {
    return (
      <Card className="glass-card" title="Admin Profile" style={{ maxWidth: 600, margin: "0 auto" }}>
        <Text>You are logged in as an Administrator.</Text>
      </Card>
    )
  }

  return (
    <div style={{ maxWidth: 800, margin: "0 auto" }}>
      <Card className="glass-card" title={
        <div>
          <Title level={4} style={{ margin: 0 }}>My Profile</Title>
          <Text type="secondary">Manage your {context.user.role} information.</Text>
        </div>
      }>

        <Form form={form} layout="vertical" onFinish={onFinish} onFinishFailed={onFinishFailed}>
          {context.user.role === "tenant" ? (
            <>
              <Divider orientation="left" plain><UserOutlined /> Personal Details</Divider>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
                <Form.Item name="full_name" label="Full Name" rules={[{ required: true, message: "Full name is required" }]}>
                  <Input placeholder="Your full name" />
                </Form.Item>
                <Form.Item name="dob" label="Date of Birth">
                  <Input type="date" />
                </Form.Item>
                <Form.Item name="gender" label="Gender">
                  <Select options={[
                    { value: "male", label: "Male" },
                    { value: "female", label: "Female" },
                    { value: "other", label: "Other" }
                  ]} />
                </Form.Item>
                <Form.Item name="phone" label="Phone" rules={[{ required: true, message: "Phone number is required" }]}>
                  <Input placeholder="+91 9876543210" />
                </Form.Item>
                <Form.Item name="email" label="Email">
                  <Input placeholder="email@example.com" />
                </Form.Item>
                <Form.Item name="occupation" label="Occupation">
                  <Input placeholder="Student, Engineer..." />
                </Form.Item>
                <Form.Item name="income" label="Monthly Income (₹)">
                  <Input type="number" placeholder="50000" />
                </Form.Item>
              </div>

              <Divider orientation="left" plain>📄 Verifications</Divider>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
                <Form.Item name="aadhaar" label="Aadhaar Number">
                  <Input maxLength={12} placeholder="1234 5678 9012" />
                </Form.Item>
                <Form.Item name="pan" label="PAN Number">
                  <Input maxLength={10} style={{ textTransform: "uppercase" }} placeholder="ABCDE1234F" />
                </Form.Item>
              </div>

              <Divider orientation="left" plain>📍 Contact</Divider>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 12 }}>
                <Form.Item name="address" label="Permanent Address">
                  <Input.TextArea rows={2} placeholder="Full permanent address" />
                </Form.Item>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <Form.Item name="ec_name" label="Emergency Contact">
                    <Input placeholder="Contact person name" />
                  </Form.Item>
                  <Form.Item name="ec_phone" label="Emergency Phone">
                    <Input placeholder="+91 9876543210" />
                  </Form.Item>
                </div>
              </div>
            </>
          ) : (
            <>
              <Divider orientation="left" plain><UserOutlined /> Contact Information</Divider>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12 }}>
                <Form.Item name="full_name" label="Full Name" rules={[{ required: true }]}>
                  <Input />
                </Form.Item>
                <Form.Item name="phone" label="Primary Phone" rules={[{ required: true }]}>
                  <Input />
                </Form.Item>
                <Form.Item name="email" label="Contact Email">
                  <Input />
                </Form.Item>
              </div>
              <Form.Item name="address" label="Mailing Address" style={{ marginTop: 12 }}>
                <Input.TextArea rows={3} />
              </Form.Item>
            </>
          )}

          <Button
            type="primary"
            htmlType="submit"
            icon={<SaveOutlined />}
            size="large"
            style={{ marginTop: 16 }}
            loading={submitting}
          >
            {context?.tenant || context?.landlord ? "Update Profile" : "Save Profile"}
          </Button>
        </Form>
      </Card>
    </div>
  )
}

export default Profile
