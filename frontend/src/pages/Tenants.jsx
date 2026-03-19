import {useState,useEffect} from "react"
import api from "../api/api"
import Sidebar from "../components/Sidebar"

function Tenants(){

const[userId,setUserId]=useState("")
const[phone,setPhone]=useState("")
const[idProof,setIdProof]=useState("")
const[editId,setEditId]=useState(null)

const[data,setData]=useState([])

const token=localStorage.getItem("token")

const load=async()=>{
const res=await api.get("/tenants",{headers:{Authorization:`Bearer ${token}`}})
setData(res.data)
}

useEffect(()=>{load()},[])

const submit=async(e)=>{
e.preventDefault()

if(editId){
await api.put(`/tenants/${editId}`,{phone_number:phone,id_proof:idProof},{headers:{Authorization:`Bearer ${token}`}})
setEditId(null)
}else{
await api.post("/tenants",{user_id:userId,phone_number:phone,id_proof:idProof},{headers:{Authorization:`Bearer ${token}`}})
}

setUserId("")
setPhone("")
setIdProof("")
load()
}

const remove=async(id)=>{
await api.delete(`/tenants/${id}`,{headers:{Authorization:`Bearer ${token}`}})
load()
}

const edit=(t)=>{
setEditId(t.tenant_id)
setUserId(t.user_id)
setPhone(t.phone_number)
setIdProof(t.id_proof)
}

return(
<div style={{display:"flex"}}>
<Sidebar/>
<div style={{padding:"20px",width:"100%"}}>

<form onSubmit={submit}>
<input value={userId} placeholder="User ID" onChange={(e)=>setUserId(e.target.value)}/>
<br/><br/>
<input value={phone} placeholder="Phone" onChange={(e)=>setPhone(e.target.value)}/>
<br/><br/>
<input value={idProof} placeholder="ID Proof" onChange={(e)=>setIdProof(e.target.value)}/>
<br/><br/>
<button type="submit">{editId?"Update":"Add"}</button>
</form>

<ul>
{data.map(t=>(
<li key={t.tenant_id}>
User {t.user_id} - {t.phone_number}
<button onClick={()=>edit(t)}>Edit</button>
<button onClick={()=>remove(t.tenant_id)}>Delete</button>
</li>
))}
</ul>

</div>
</div>
)
}

export default Tenants