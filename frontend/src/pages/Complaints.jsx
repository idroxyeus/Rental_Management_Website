import {useState,useEffect} from "react"
import api from "../api/api"
import Sidebar from "../components/Sidebar"

function Complaints(){

const[tenantId,setTenantId]=useState("")
const[propertyId,setPropertyId]=useState("")
const[description,setDescription]=useState("")
const[status,setStatus]=useState("open")
const[editId,setEditId]=useState(null)

const[data,setData]=useState([])

const token=localStorage.getItem("token")

const load=async()=>{
const res=await api.get("/complaints",{headers:{Authorization:`Bearer ${token}`}})
setData(res.data)
}

useEffect(()=>{load()},[])

const submit=async(e)=>{
e.preventDefault()

if(editId){
await api.put(`/complaints/${editId}`,{description,status},{headers:{Authorization:`Bearer ${token}`}})
setEditId(null)
}else{
await api.post("/complaints",{tenant_id:tenantId,property_id:propertyId,description,status},{headers:{Authorization:`Bearer ${token}`}})
}

load()
}

const remove=async(id)=>{
await api.delete(`/complaints/${id}`,{headers:{Authorization:`Bearer ${token}`}})
load()
}

const edit=(c)=>{
setEditId(c.complaint_id)
setTenantId(c.tenant_id)
setPropertyId(c.property_id)
setDescription(c.description)
setStatus(c.status)
}

return(
<div style={{display:"flex"}}>
<Sidebar/>
<div style={{padding:"20px",width:"100%"}}>

<form onSubmit={submit}>
<input value={tenantId} placeholder="Tenant ID" onChange={(e)=>setTenantId(e.target.value)}/>
<br/><br/>
<input value={propertyId} placeholder="Property ID" onChange={(e)=>setPropertyId(e.target.value)}/>
<br/><br/>
<input value={description} placeholder="Description" onChange={(e)=>setDescription(e.target.value)}/>
<br/><br/>
<button type="submit">{editId?"Update":"Add"}</button>
</form>

<ul>
{data.map(c=>(
<li key={c.complaint_id}>
Tenant {c.tenant_id} - {c.description}
<button onClick={()=>edit(c)}>Edit</button>
<button onClick={()=>remove(c.complaint_id)}>Delete</button>
</li>
))}
</ul>

</div>
</div>
)
}

export default Complaints