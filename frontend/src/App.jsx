import {BrowserRouter,Routes,Route} from "react-router-dom"
import Login from "./pages/Login"
import Dashboard from "./pages/Dashboard"
import Properties from "./pages/Properties"
import Tenants from "./pages/Tenants"
import Leases from "./pages/Leases"
import Payments from "./pages/Payments"
import Complaints from "./pages/Complaints"
import ProtectedRoute from "./components/ProtectedRoute"

function App(){
return(
<BrowserRouter>

<Routes>

<Route path="/" element={<Login/>}/>

<Route path="/dashboard" element={
<ProtectedRoute>
<Dashboard/>
</ProtectedRoute>
}/>

<Route path="/properties" element={
<ProtectedRoute>
<Properties/>
</ProtectedRoute>
}/>

<Route path="/tenants" element={
<ProtectedRoute>
<Tenants/>
</ProtectedRoute>
}/>

<Route path="/leases" element={
<ProtectedRoute>
<Leases/>
</ProtectedRoute>
}/>

<Route path="/payments" element={
<ProtectedRoute>
<Payments/>
</ProtectedRoute>
}/>

<Route path="/complaints" element={
<ProtectedRoute>
<Complaints/>
</ProtectedRoute>
}/>

</Routes>

</BrowserRouter>
)
}

export default App