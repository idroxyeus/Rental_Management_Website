import {useNavigate} from "react-router-dom"

function Navbar(){

const navigate=useNavigate()

const logout=()=>{
localStorage.removeItem("token")
navigate("/")
}

return(
<div className="flex justify-between items-center px-6 py-4 
bg-white/20 backdrop-blur-lg shadow-md">

<h2 className="text-xl font-bold text-white">Dashboard</h2>

<button 
onClick={logout}
className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded text-white shadow-lg"
>
Logout
</button>

</div>
)
}

export default Navbar