import {useState,useEffect} from "react"
import api from "../api/api"
import Sidebar from "../components/Sidebar"
import Navbar from "../components/Navbar"

function Properties(){

const[address,setAddress]=useState("")
const[type,setType]=useState("")
const[rent,setRent]=useState("")
const[status,setStatus]=useState("vacant")
const[editId,setEditId]=useState(null)

const[data,setData]=useState([])
const token=localStorage.getItem("token")

const load=async()=>{
const res=await api.get("/properties",{headers:{Authorization:`Bearer ${token}`}})
setData(res.data)
}

useEffect(()=>{load()},[])

const submit=async(e)=>{
e.preventDefault()

if(editId){
await api.put(`/properties/${editId}`,{address,property_type:type,rent_amount:rent,status},{headers:{Authorization:`Bearer ${token}`}})
setEditId(null)
}else{
await api.post("/properties",{address,property_type:type,rent_amount:rent,status},{headers:{Authorization:`Bearer ${token}`}})
}

setAddress("")
setType("")
setRent("")
load()
}

const remove=async(id)=>{
await api.delete(`/properties/${id}`,{headers:{Authorization:`Bearer ${token}`}})
load()
}

const edit=(p)=>{
setEditId(p.property_id)
setAddress(p.address)
setType(p.property_type)
setRent(p.rent_amount)
setStatus(p.status)
}

return(
<div className="flex min-h-screen bg-gradient-to-br from-black via-gray-900 to-indigo-900 text-white">

<Sidebar/>

<div className="ml-64 flex-1">

<Navbar/>

<div className="p-6">

<form onSubmit={submit} className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl shadow mb-6 flex gap-3 flex-wrap">

<input className="p-2 rounded bg-black/30 border border-gray-500" placeholder="Address" value={address} onChange={(e)=>setAddress(e.target.value)}/>
<input className="p-2 rounded bg-black/30 border border-gray-500" placeholder="Type" value={type} onChange={(e)=>setType(e.target.value)}/>
<input className="p-2 rounded bg-black/30 border border-gray-500" placeholder="Rent" value={rent} onChange={(e)=>setRent(e.target.value)}/>

<select className="p-2 rounded bg-black/30 border border-gray-500" value={status} onChange={(e)=>setStatus(e.target.value)}>
<option value="vacant">vacant</option>
<option value="occupied">occupied</option>
</select>

<button className="bg-gradient-to-r from-indigo-500 to-pink-500 px-4 py-2 rounded text-white shadow-lg hover:scale-105 transition">
{editId?"Update":"Add"}
</button>

</form>

<table className="w-full bg-white/10 backdrop-blur-lg rounded-2xl overflow-hidden shadow">

<thead className="bg-indigo-600/50">
<tr>
<th className="p-3">Address</th>
<th className="p-3">Type</th>
<th className="p-3">Rent</th>
<th className="p-3">Actions</th>
</tr>
</thead>

<tbody>
{data.map(p=>(
<tr key={p.property_id} className="border-t border-gray-700 hover:bg-white/10 transition">

<td className="p-3">{p.address}</td>
<td className="p-3">{p.property_type}</td>
<td className="p-3">{p.rent_amount}</td>

<td className="p-3">
<button onClick={()=>edit(p)} className="text-blue-400 mr-2">Edit</button>
<button onClick={()=>remove(p.property_id)} className="text-red-400">Delete</button>
</td>

</tr>
))}
</tbody>

</table>

</div>

</div>
</div>
)
}

export default Properties