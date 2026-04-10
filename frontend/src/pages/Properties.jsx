import { useState, useEffect } from "react"
import { Card, Form, Input, Select, Button, Space, Tag, Popconfirm, message, Descriptions, Drawer, Row, Col, Empty, Upload } from "antd"
import { useNavigate } from "react-router-dom"
import { PlusOutlined, EditOutlined, DeleteOutlined, HeartOutlined, HeartFilled, EyeOutlined, CheckOutlined, FileImageOutlined, UploadOutlined, LeftOutlined, RightOutlined } from "@ant-design/icons"
import api from "../api/api"
import { Carousel } from "antd"

function Properties() {
  const [data, setData] = useState([])
  const [userCtx, setUserCtx] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editId, setEditId] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [form] = Form.useForm()
  const navigate = useNavigate()
  
  const [clickedInterests, setClickedInterests] = useState([])
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [selectedProperty, setSelectedProperty] = useState(null)
  const [images, setImages] = useState([]) // Array of base64 strings

  const load = async () => { 
    try { 
      const [p, u] = await Promise.all([api.get("/properties"), api.get("/me")])
      setData(p.data) 
      setUserCtx(u.data)
      if (u.data.user.role === "tenant") {
        const intRes = await api.get("/properties/interests/me")
        setClickedInterests(intRes.data.map(id => Number(id)))
      }
    } catch(e){console.error(e)} finally{setLoading(false)} 
  }
  useEffect(() => { load() }, [])

  const onFinish = async (values) => {
    setSubmitting(true)
    const hide = message.loading("Saving property...", 0)
    try {
      const payload = {
        address: values.address,
        property_type: values.type,
        rent_amount: values.rent,
        status: values.status,
        images: images,
        facilities: values.facilities || []
      }
      if (editId) { await api.put(`/properties/${editId}`, payload) }
      else { await api.post("/properties", payload) }
      hide()
      message.success(editId ? "Property updated! ✔" : "Property added! ✔")
      form.resetFields(); setEditId(null); setImages([]); load()
    } catch (err) { hide(); message.error(err.response?.data?.message || "Failed") }
    finally { setSubmitting(false) }
  }

  const edit = (r) => {
    setEditId(r.property_id)
    setImages(r.images || [])
    form.setFieldsValue({ address: r.address, type: r.property_type, rent: r.rent_amount, status: r.status, facilities: r.facilities || [] })
  }
  const cancel = () => { setEditId(null); setImages([]); form.resetFields() }
  const remove = async (id) => { 
    const hide = message.loading("Deleting...", 0)
    await api.delete(`/properties/${id}`); hide(); message.success("Deleted"); load() 
  }

  const handleInterest = async (id, revertFn) => {
    const hide = message.loading("Expressing interest...", 0)
    try {
      await api.post(`/properties/${id}/interest`)
      hide()
      message.success("Interest sent to landlord!")
    } catch(e) { 
      hide(); 
      message.error(e.response?.data?.message || "Failed to express interest");
      if (revertFn) revertFn();
    }
  }

  // Foolproof Interest Button Component
  const InterestButton = ({ r, isInterested }) => {
    const [localClick, setLocalClick] = useState(isInterested);

    useEffect(() => { setLocalClick(isInterested); }, [isInterested]);

    const handleClick = (e) => {
      e.stopPropagation();
      if (localClick) return;
      setLocalClick(true);
      handleInterest(r.property_id, () => setLocalClick(false));
    }

    return (
      <Button
        type="text"
        block
        disabled={r.status !== "vacant"}
        icon={localClick ? <HeartFilled style={{ color: "#ec4899" }} /> : <HeartOutlined />}
        onClick={handleClick}
        style={localClick ? { color: "#ec4899" } : {}}
      >
        {localClick ? "Interested" : "Express Interest"}
      </Button>
    )
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
        <InterestButton r={r} isInterested={clickedInterests.includes(Number(r.property_id))} />
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
        <Card className="glass-card" title={editId ? `Edit Property P-${editId}` : "Add Property"} extra={editId && <Button onClick={cancel}>Cancel</Button>} style={{ marginBottom: 24 }}>
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
              <Form.Item name="facilities" label="Facilities">
                <Select mode="multiple" placeholder="WiFi, AC, Parking..." options={[
                  { value: "WiFi", label: "WiFi" }, { value: "AC", label: "AC" },
                  { value: "Parking", label: "Parking" }, { value: "Gym", label: "Gym" },
                  { value: "Pool", label: "Pool" }, { value: "Security", label: "Security" },
                  { value: "Power Backup", label: "Power Backup" }, { value: "Geyser", label: "Geyser" },
                ]} />
              </Form.Item>
              <Form.Item label="Property Images (Multiple)">
                <Upload
                  accept="image/*"
                  showUploadList={false}
                  multiple
                  beforeUpload={(file) => {
                    const reader = new FileReader()
                    reader.onload = (e) => setImages(prev => [...prev, e.target.result])
                    reader.readAsDataURL(file)
                    return false
                  }}
                >
                  <Button icon={<UploadOutlined />}>Upload Images</Button>
                </Upload>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
                  {images.map((img, idx) => (
                    <div key={idx} style={{ position: "relative" }}>
                      <img src={img} alt="preview" style={{ height: 60, width: 80, objectFit: "cover", borderRadius: 4 }} />
                      <Button type="primary" danger size="small" shape="circle" icon={<DeleteOutlined style={{ fontSize: 10 }} />}
                        style={{ position: "absolute", top: -5, right: -5, width: 18, height: 18, minWidth: 18 }}
                        onClick={() => setImages(prev => prev.filter((_, i) => i !== idx))} />
                    </div>
                  ))}
                </div>
              </Form.Item>
              <Form.Item name="status" label="Status">
                <Select options={[{ value: "vacant", label: "Vacant" }, { value: "occupied", label: "Occupied" }]} />
              </Form.Item>
            </div>
            <Button type="primary" htmlType="submit" icon={<PlusOutlined />} loading={submitting}>{editId ? "Update Property" : "Add Property"}</Button>
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

      <Card className="glass-card" title={userCtx?.user.role === "tenant" ? "Vacant Properties Available" : "All Properties"} styles={{ body: { padding: "24px", background: "transparent" } }}>
        <Row gutter={[24, 24]}>
          {(userCtx?.user.role === "tenant" ? data.filter(p => p.status === "vacant" || p.property_id === userCtx.activeLease?.property_id) : data).map((r) => {
            const isTenant = userCtx?.user.role === "tenant";
            return (
              <Col xs={24} sm={12} lg={8} xl={6} key={r.property_id}>
                <Card 
                  hoverable
                  className="overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  cover={
                    <div className="h-48 overflow-hidden relative group bg-indigo-50 dark:bg-slate-700">
                      {r.images && r.images.length > 0 ? (
                        <Carousel arrows prevArrow={<LeftOutlined />} nextArrow={<RightOutlined />}>
                          {r.images.map((img, i) => (
                            <div key={i} className="h-48">
                              <img src={img} alt={`property-${i}`} className="w-full h-48 object-cover" />
                            </div>
                          ))}
                        </Carousel>
                      ) : (
                        <div className="h-full flex items-center justify-center">
                          <FileImageOutlined className="text-4xl text-indigo-200 dark:text-slate-500" />
                        </div>
                      )}
                      <div className="absolute top-3 right-3 z-10">
                        <Tag color="purple" className="shadow-sm border-0 font-medium">P-{r.property_id}</Tag>
                      </div>
                      <div className="absolute top-3 left-3 z-10">
                        <Tag color={r.status === "vacant" ? "green" : "orange"} className="shadow-sm border-0 font-medium">
                          {r.status.toUpperCase()}
                        </Tag>
                      </div>
                    </div>
                  }
                  actions={
                    isTenant ? [
                      <Button type="text" icon={<EyeOutlined />} onClick={() => viewDetails(r)} title="View Details" />,
                      <InterestButton r={r} isInterested={clickedInterests.includes(Number(r.property_id))} />
                    ] : [
                      <Button type="text" icon={<EyeOutlined />} onClick={() => viewDetails(r)} className="hover:text-indigo-500" title="View Details" />,
                      <Button type="text" icon={<HeartOutlined />} onClick={() => navigate(`/tenants?interested_in=${r.property_id}`)} className="hover:text-rose-500" title="View Interested Tenants" />,
                      <Button type="text" icon={<EditOutlined />} onClick={() => edit(r)} title="Edit Property" />,
                      <Popconfirm title="Delete this property?" onConfirm={() => remove(r.property_id)}>
                        <Button type="text" danger icon={<DeleteOutlined />} title="Delete Property" />
                      </Popconfirm>
                    ]
                  }
                >
                  <Card.Meta 
                    title={<h3 className="text-lg font-bold truncate text-slate-800 dark:text-slate-100">{r.address}</h3>}
                    description={
                      <div className="flex flex-col gap-1 mt-2">
                        <span className="text-slate-500 dark:text-slate-400 font-medium">{r.property_type}</span>
                        <span className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-1">₹{r.rent_amount}<span className="text-sm font-normal text-slate-400">/mo</span></span>
                      </div>
                    }
                  />
                </Card>
              </Col>
            );
          })}
        </Row>
        {data.length === 0 && !loading && <Empty description="No properties found" className="my-10" />}
      </Card>

      {/* Landlord View Details Drawer */}
      <Drawer title={`Property Details: P-${selectedProperty?.property_id}`} open={detailsOpen} onClose={() => setDetailsOpen(false)} width={480}>
        {selectedProperty && (
          <div>
            {/* Photo Carousel */}
            {selectedProperty.images && selectedProperty.images.length > 0 ? (
              <div style={{ marginBottom: 20, borderRadius: 10, overflow: "hidden" }}>
                <Carousel arrows prevArrow={<LeftOutlined />} nextArrow={<RightOutlined />} dots={{ className: "carousel-dots" }}>
                  {selectedProperty.images.map((img, i) => (
                    <div key={i}>
                      <img src={img} alt={`photo-${i+1}`} style={{ width: "100%", height: 240, objectFit: "cover" }} />
                    </div>
                  ))}
                </Carousel>
                <div style={{ textAlign: "center", marginTop: 6, fontSize: 12, color: "#888" }}>
                  {selectedProperty.images.length} photo{selectedProperty.images.length > 1 ? "s" : ""} — use arrows to browse
                </div>
              </div>
            ) : (
              <div style={{ height: 120, background: "#f5f5f5", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20, color: "#bbb", fontSize: 13 }}>
                No photos uploaded
              </div>
            )}

            <Descriptions column={1} bordered>
              <Descriptions.Item label="Property ID">P-{selectedProperty.property_id}</Descriptions.Item>
              <Descriptions.Item label="Address">{selectedProperty.address}</Descriptions.Item>
              <Descriptions.Item label="Type">{selectedProperty.property_type}</Descriptions.Item>
              <Descriptions.Item label="Rent">₹{selectedProperty.rent_amount}</Descriptions.Item>
              <Descriptions.Item label="Status"><Tag color={selectedProperty.status === "vacant" ? "green" : "orange"}>{selectedProperty.status}</Tag></Descriptions.Item>
              <Descriptions.Item label="Facilities">
                {selectedProperty.facilities && selectedProperty.facilities.length > 0
                  ? selectedProperty.facilities.map(f => <Tag key={f} color="blue" style={{ marginBottom: 4 }}>{f}</Tag>)
                  : <span style={{ color: "#999" }}>None specified</span>}
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
        {selectedProperty?.status === "occupied" && userCtx?.user.role !== "tenant" && (
           <Button type="primary" style={{ marginTop: 16, width: "100%" }} onClick={() => navigate(`/tenants?property_id=${selectedProperty.property_id}`)}>
             Update Family Members
           </Button>
        )}
        {selectedProperty?.status === "vacant" && userCtx?.user.role !== "tenant" && (
           <Button type="primary" style={{ marginTop: 16, width: "100%", backgroundColor: "#ec4899", borderColor: "#ec4899" }} icon={<HeartFilled />} onClick={() => navigate(`/tenants?interested_in=${selectedProperty.property_id}`)}>
             Show Interested Tenants
           </Button>
        )}
      </Drawer>
    </div>
  )
}

export default Properties