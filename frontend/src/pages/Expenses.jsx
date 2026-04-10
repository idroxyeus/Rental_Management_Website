import { useState, useEffect } from "react"
import { Card, Table, Form, Input, Select, Button, DatePicker, message, Popconfirm, Tag, Space, Typography } from "antd"
import { PlusOutlined, DeleteOutlined, AreaChartOutlined } from "@ant-design/icons"
import api from "../api/api"
import dayjs from "dayjs"

const { Text, Title } = Typography

function Expenses() {
  const [expenses, setExpenses] = useState([])
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form] = Form.useForm()

  const loadData = async () => {
    try {
      const [resExp, resProp] = await Promise.all([
        api.get("/expenses"),
        api.get("/properties")
      ])
      setExpenses(resExp.data)
      setProperties(resProp.data)
    } catch (err) {
      console.error(err)
      message.error("Failed to load expenses")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

  const onFinish = async (values) => {
    setSubmitting(true)
    const hide = message.loading("Saving expense...", 0)
    try {
      const payload = {
        property_id: values.property_id,
        amount: values.amount,
        category: values.category,
        description: values.description,
        expense_date: values.expense_date.format("YYYY-MM-DD")
      }
      await api.post("/expenses", payload)
      hide()
      message.success("Expense added successfully! ✔")
      form.resetFields()
      setIsAdding(false)
      loadData()
    } catch (err) {
      hide()
      message.error(err.response?.data?.message || "Failed to add expense")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    const hide = message.loading("Deleting...", 0)
    try {
      await api.delete(`/expenses/${id}`)
      hide()
      message.success("Expense deleted")
      loadData()
    } catch (err) {
      hide()
      message.error("Failed to delete expense")
    }
  }

  const columns = [
    { 
      title: "Date", dataIndex: "expense_date", key: "date",
      render: (v) => dayjs(v).format("MMM D, YYYY"),
      sorter: (a, b) => new Date(a.expense_date) - new Date(b.expense_date)
    },
    { 
      title: "Property", dataIndex: "property_id", key: "property",
      render: (v) => {
        const p = properties.find(prop => prop.property_id === v)
        return p ? <Tag color="blue">{p.address}</Tag> : `P-${v}`
      }
    },
    { title: "Category", dataIndex: "category", key: "category", render: (v) => <Tag color="orange">{v}</Tag> },
    { title: "Description", dataIndex: "description", key: "desc" },
    { 
      title: "Amount", dataIndex: "amount", key: "amount",
      render: (v) => <Text strong type="danger">₹{v}</Text>,
      sorter: (a, b) => a.amount - b.amount
    },
    {
      title: "Actions", key: "actions", align: "right",
      render: (_, r) => (
        <Popconfirm title="Delete this expense?" onConfirm={() => handleDelete(r.expense_id)}>
          <Button type="text" danger icon={<DeleteOutlined />} />
        </Popconfirm>
      )
    }
  ]

  const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0)

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <Title level={4} style={{ margin: 0 }}>Property Expenses</Title>
          <Text type="secondary">Track maintenance, repairs, and other costs</Text>
        </div>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={() => setIsAdding(!isAdding)}
          size="large"
        >
          {isAdding ? "Cancel" : "Add Expense"}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="glass-card">
          <Text type="secondary" className="uppercase text-xs font-bold tracking-wider">Total Expenses All Time</Text>
          <div className="text-3xl font-extrabold text-red-500 mt-2 flex items-center gap-2">
            ₹{totalExpenses.toLocaleString()}
          </div>
        </Card>
      </div>

      {isAdding && (
        <Card className="glass-card mb-8 border-t-4 border-t-indigo-500" title="Log New Expense">
          <Form form={form} layout="vertical" onFinish={onFinish}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Form.Item name="property_id" label="Property" rules={[{ required: true }]}>
                <Select placeholder="Select Property">
                  {properties.map(p => (
                    <Select.Option key={p.property_id} value={p.property_id}>
                      P-{p.property_id} - {p.address}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item name="amount" label="Amount (₹)" rules={[{ required: true }]}>
                <Input type="number" placeholder="5000" />
              </Form.Item>
              <Form.Item name="category" label="Category" rules={[{ required: true }]}>
                <Select placeholder="Select category">
                  <Select.Option value="Maintenance">Maintenance</Select.Option>
                  <Select.Option value="Repairs">Repairs</Select.Option>
                  <Select.Option value="Taxes">Taxes</Select.Option>
                  <Select.Option value="Utilities">Utilities</Select.Option>
                  <Select.Option value="Other">Other</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item name="expense_date" label="Date" rules={[{ required: true }]}>
                <DatePicker className="w-full" />
              </Form.Item>
            </div>
            <Form.Item name="description" label="Description" rules={[{ required: true }]}>
              <Input.TextArea placeholder="E.g., Plumbing repair for apartment 4A" rows={2} />
            </Form.Item>
            <Button type="primary" htmlType="submit" icon={<AreaChartOutlined />} loading={submitting}>Save Expense</Button>
          </Form>
        </Card>
      )}

      <Card className="glass-card">
        <Table 
          columns={columns} 
          dataSource={expenses} 
          rowKey="expense_id" 
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </div>
  )
}

export default Expenses
