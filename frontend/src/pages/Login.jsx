import { useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../api/api"

function Login(){
const[email,setEmail]=useState("")
const[password,setPassword]=useState("")
const navigate=useNavigate()

const submit=async(e)=>{
e.preventDefault()
try{
const res=await api.post("/login",{email,password})
localStorage.setItem("token",res.data.token)
navigate("/dashboard")
}catch{
alert("Login failed")
}
}

return(
<div style={{display:"flex",justifyContent:"center",alignItems:"center",height:"100vh"}}>
<form onSubmit={submit}>
<h2>Login</h2>
<input placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)}/>
<br/><br/>
<input type="password" placeholder="Password" value={password} onChange={(e)=>setPassword(e.target.value)}/>
<br/><br/>
<button type="submit">Login</button>
</form>
</div>
)
}

export default Login