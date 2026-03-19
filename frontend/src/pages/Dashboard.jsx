import {useEffect,useState} from "react"
import api from "../api/api"
import Sidebar from "../components/Sidebar"
import Navbar from "../components/Navbar"
import { Bar } from "react-chartjs-2"
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement } from "chart.js"

ChartJS.register(CategoryScale, LinearScale, BarElement)

function Dashboard(){

const[stats,setStats]=useState({
properties:0,tenants:0,leases:0,payments:0,complaints:0
})

const token=localStorage.getItem("token")

useEffect(()=>{
const load=async()=>{
const h={headers:{Authorization:`Bearer ${token}`}}

const p=await api.get("/properties",h)
const t=await api.get("/tenants",h)
const l=await api.get("/leases",h)
const pay=await api.get("/payments",h)
const c=await api.get("/complaints",h)

setStats({
properties:p.data.length,
tenants:t.data.length,
leases:l.data.length,
payments:pay.data.length,
complaints:c.data.length
})
}
load()
},[])

const chartData={
labels:["Properties","Tenants","Leases","Payments","Complaints"],
datasets:[{
label:"System",
data:Object.values(stats),
backgroundColor:["#6366F1","#8B5CF6","#EC4899","#F59E0B","#10B981"]
}]
}

return(
<div className="flex min-h-screen bg-gradient-to-br from-black via-gray-900 to-indigo-900 text-white">

<Sidebar/>

<div className="ml-64 flex-1">

<Navbar/>

<div className="p-6">

<h1 className="text-3xl font-bold mb-6">🚀 Dashboard</h1>

{/* CARDS */}
<div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">

{Object.entries(stats).map(([k,v])=>(
<div key={k}
className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl 
shadow-xl hover:scale-105 hover:shadow-indigo-500/50 transition">

<h3 className="text-gray-300 capitalize">{k}</h3>
<p className="text-4xl font-extrabold mt-2">{v}</p>

</div>
))}

</div>

{/* CHART */}
<div className="mt-10 bg-white/10 backdrop-blur-lg p-6 rounded-2xl shadow-xl">

<h2 className="mb-4 text-xl font-bold">📊 Analytics</h2>

<Bar data={chartData}/>

</div>

</div>

</div>
</div>
)
}

export default Dashboard