import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { Form, Input, Button, Card, Typography, Select, message } from "antd"
import { UserOutlined, MailOutlined, LockOutlined, UserAddOutlined } from "@ant-design/icons"
import api from "../api/api"

const { Title, Text } = Typography

function Register() {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const onFinish = async (values) => {
    setLoading(true)
    try {
      const res = await api.post("/register", values)
      localStorage.setItem("token", res.data.token) // Auto-login
      message.success("Account created successfully! Welcome ✔")
      navigate("/dashboard")
    } catch (err) {
      message.error(err.response?.data?.message || "Registration failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex", alignItems: "center", justifyContent: "center",
      background: "linear-gradient(135deg, #7c3aed 0%, #4f46e5 50%, #6366f1 100%)",
      padding: 16,
    }}>
      <Card style={{ width: 420, borderRadius: 16, boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}
        styles={{ body: { padding: 32 } }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 16, margin: "0 auto 16px",
            background: "linear-gradient(135deg, #7c3aed, #ec4899)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 8px 20px rgba(124,58,237,0.4)",
          }}>
            <UserAddOutlined style={{ fontSize: 28, color: "#fff" }} />
          </div>
          <Title level={3} style={{ margin: 0 }}>Create Account</Title>
          <Text type="secondary">Join Rental Manager</Text>
        </div>

        <Form layout="vertical" onFinish={onFinish} size="large" initialValues={{ role: "tenant" }}>
          <Form.Item name="name" label="Full Name" rules={[{ required: true, message: "Enter your name" }]}>
            <Input prefix={<UserOutlined />} placeholder="John Doe" />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, type: "email", message: "Enter a valid email" }]}>
            <Input prefix={<MailOutlined />} placeholder="you@example.com" />
          </Form.Item>
          <Form.Item name="password" label="Password" rules={[{ required: true, min: 6, message: "Min 6 characters" }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="Create a password" />
          </Form.Item>
          <Form.Item name="role" label="Role">
            <Select options={[
              { value: "tenant", label: "Tenant" },
              { value: "landlord", label: "Landlord" },
              { value: "admin", label: "Admin" },
            ]} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}
              style={{ height: 44, fontWeight: 600, background: "linear-gradient(90deg, #7c3aed, #ec4899)" }}>
              Create Account
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: "center" }}>
          <Text type="secondary">Already have an account? </Text>
          <Link to="/"><Text strong style={{ color: "#4f46e5" }}>Sign in</Text></Link>
        </div>
      </Card>
    </div>
  )
}

export default Register
