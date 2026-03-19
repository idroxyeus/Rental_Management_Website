import {useState,useEffect} from "react"
import api from "../api/api"
import Sidebar from "../components/Sidebar"

function Payments(){

const[leaseId,setLeaseId]=useState("")
const[amount,setAmount]=useState("")
const[paymentDate,setPaymentDate]=useState("")
const[month,setMonth]=useState("")
const[status,setStatus]=useState("paid")
const[editId,setEditId]=useState(null)

const[data,setData]=useState([])

const token=localStorage.getItem("token")

const load=async()=>{
const res=await api.get("/payments",{headers:{Authorization:`Bearer ${token}`}})
setData(res.data)
}

useEffect(()=>{load()},[])

const submit=async(e)=>{
e.preventDefault()

if(editId){
await api.put(`/payments/${editId}`,{amount,payment_date:paymentDate,month,status},{headers:{Authorization:`Bearer ${token}`}})
setEditId(null)
}else{
await api.post("/payments",{lease_id:leaseId,amount,payment_date:paymentDate,month,status},{headers:{Authorization:`Bearer ${token}`}})
}

load()
}

const remove=async(id)=>{
await api.delete(`/payments/${id}`,{headers:{Authorization:`Bearer ${token}`}})
load()
}

const edit=(p)=>{
setEditId(p.payment_id)
setLeaseId(p.lease_id)
setAmount(p.amount)
setPaymentDate(p.payment_date)
setMonth(p.month)
setStatus(p.status)
}

return(
<div style={{display:"flex"}}>
<Sidebar/>
<div style={{padding:"20px",width:"100%"}}>

<form onSubmit={submit}>
<input value={leaseId} placeholder="Lease ID" onChange={(e)=>setLeaseId(e.target.value)}/>
<br/><br/>
<input value={amount} placeholder="Amount" onChange={(e)=>setAmount(e.target.value)}/>
<br/><br/>
<input type="date" value={paymentDate} onChange={(e)=>setPaymentDate(e.target.value)}/>
<br/><br/>
<input value={month} placeholder="Month" onChange={(e)=>setMonth(e.target.value)}/>
<br/><br/>
<button type="submit">{editId?"Update":"Add"}</button>
</form>

<ul>
{data.map(p=>(
<li key={p.payment_id}>
Lease {p.lease_id} - {p.amount}
<button onClick={()=>edit(p)}>Edit</button>
<button onClick={()=>remove(p.payment_id)}>Delete</button>
</li>
))}
</ul>

</div>
</div>
)
}

export default Payments