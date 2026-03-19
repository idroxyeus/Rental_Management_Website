import {useState,useEffect} from "react"
import api from "../api/api"
import Sidebar from "../components/Sidebar"

function Leases(){

const[propertyId,setPropertyId]=useState("")
const[tenantId,setTenantId]=useState("")
const[start,setStart]=useState("")
const[end,setEnd]=useState("")
const[rent,setRent]=useState("")
const[deposit,setDeposit]=useState("")
const[status,setStatus]=useState("active")
const[editId,setEditId]=useState(null)

const[data,setData]=useState([])

const token=localStorage.getItem("token")

const load=async()=>{
const res=await api.get("/leases",{headers:{Authorization:`Bearer ${token}`}})
setData(res.data)
}

useEffect(()=>{load()},[])

const submit=async(e)=>{
e.preventDefault()

if(editId){
await api.put(`/leases/${editId}`,{start_date:start,end_date:end,rent_amount:rent,deposit,status},{headers:{Authorization:`Bearer ${token}`}})
setEditId(null)
}else{
await api.post("/leases",{property_id:propertyId,tenant_id:tenantId,start_date:start,end_date:end,rent_amount:rent,deposit,status},{headers:{Authorization:`Bearer ${token}`}})
}

load()
}

const remove=async(id)=>{
await api.delete(`/leases/${id}`,{headers:{Authorization:`Bearer ${token}`}})
load()
}

const edit=(l)=>{
setEditId(l.lease_id)
setPropertyId(l.property_id)
setTenantId(l.tenant_id)
setStart(l.start_date)
setEnd(l.end_date)
setRent(l.rent_amount)
setDeposit(l.deposit)
setStatus(l.status)
}

return(
<div style={{display:"flex"}}>
<Sidebar/>
<div style={{padding:"20px",width:"100%"}}>

<form onSubmit={submit}>
<input value={propertyId} placeholder="Property ID" onChange={(e)=>setPropertyId(e.target.value)}/>
<br/><br/>
<input value={tenantId} placeholder="Tenant ID" onChange={(e)=>setTenantId(e.target.value)}/>
<br/><br/>
<input type="date" value={start} onChange={(e)=>setStart(e.target.value)}/>
<br/><br/>
<input type="date" value={end} onChange={(e)=>setEnd(e.target.value)}/>
<br/><br/>
<input value={rent} placeholder="Rent" onChange={(e)=>setRent(e.target.value)}/>
<br/><br/>
<input value={deposit} placeholder="Deposit" onChange={(e)=>setDeposit(e.target.value)}/>
<br/><br/>
<button type="submit">{editId?"Update":"Add"}</button>
</form>

<ul>
{data.map(l=>(
<li key={l.lease_id}>
Property {l.property_id} - Tenant {l.tenant_id}
<button onClick={()=>edit(l)}>Edit</button>
<button onClick={()=>remove(l.lease_id)}>Delete</button>
</li>
))}
</ul>

</div>
</div>
)
}

export default Leases