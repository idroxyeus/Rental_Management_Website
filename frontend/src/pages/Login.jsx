import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { Form, Input, Button, Card, Typography, message } from "antd"
import { LockOutlined, MailOutlined, HomeOutlined } from "@ant-design/icons"
import api from "../api/api"

const { Title, Text } = Typography

function Login() {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const onFinish = async (values) => {
    setLoading(true)
    try {
      const res = await api.post("/login", values)
      localStorage.setItem("token", res.data.token)
      navigate("/dashboard")
    } catch (err) {
      message.error(err.response?.data?.message || "Login failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #4f46e5 100%)",
      padding: 16,
    }}>
      <Card
        style={{ width: 420, borderRadius: 16, boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}
        styles={{ body: { padding: 32 } }}
      >
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 16, margin: "0 auto 16px",
            background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 8px 20px rgba(79,70,229,0.4)",
          }}>
            <HomeOutlined style={{ fontSize: 28, color: "#fff" }} />
          </div>
          <Title level={3} style={{ margin: 0 }}>Welcome Back</Title>
          <Text type="secondary">Sign in to Rental Manager</Text>
        </div>

        <Form layout="vertical" onFinish={onFinish} size="large">
          <Form.Item name="email" label="Email" rules={[{ required: true, type: "email", message: "Enter a valid email" }]}>
            <Input prefix={<MailOutlined />} placeholder="you@example.com" />
          </Form.Item>
          <Form.Item name="password" label="Password" rules={[{ required: true, message: "Enter your password" }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="Password" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}
              style={{ height: 44, fontWeight: 600 }}>
              Sign In
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: "center" }}>
          <Text type="secondary">Don't have an account? </Text>
          <Link to="/register"><Text strong style={{ color: "#4f46e5" }}>Create one</Text></Link>
        </div>
      </Card>
    </div>
  )
}

export default Login