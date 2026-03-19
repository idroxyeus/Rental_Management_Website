const express = require("express")
const cors = require("cors")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs")
require("dotenv").config()
const db = require("./db")

const app = express()
const SECRET = process.env.JWT_SECRET

app.use(cors())
app.use(express.json())

function verifyToken(req,res,next){
const header=req.headers["authorization"]
if(!header) return res.status(403).json({message:"Token required"})
const token=header.split(" ")[1]
jwt.verify(token,SECRET,(err,decoded)=>{
if(err) return res.status(401).json({message:"Invalid token"})
req.user=decoded
next()
})
}

app.post("/register",async(req,res)=>{
const{name,email,password,role}=req.body
const hashed=await bcrypt.hash(password,10)
db.query("INSERT INTO users (name,email,password,role) VALUES (?,?,?,?)",[name,email,hashed,role],(err)=>{
if(err) return res.status(500).json(err)
res.json({message:"User registered"})
})
})

app.post("/login",(req,res)=>{
const{email,password}=req.body
db.query("SELECT * FROM users WHERE email=?",[email],async(err,r)=>{
if(err) return res.status(500).json(err)
if(!r.length) return res.status(401).json({message:"Invalid email"})
const match=await bcrypt.compare(password,r[0].password)
if(!match) return res.status(401).json({message:"Invalid password"})
const token=jwt.sign({id:r[0].user_id,role:r[0].role},SECRET,{expiresIn:"1h"})
res.json({token})
})
})

app.get("/profile",verifyToken,(req,res)=>{
res.json(req.user)
})

app.post("/properties",verifyToken,(req,res)=>{
const{address,property_type,rent_amount,status}=req.body
db.query("INSERT INTO properties (address,property_type,rent_amount,status) VALUES (?,?,?,?)",[address,property_type,rent_amount,status],(e,r)=>{
if(e) return res.status(500).json(e)
res.json({property_id:r.insertId})
})
})

app.get("/properties",verifyToken,(req,res)=>{
db.query("SELECT * FROM properties",(e,r)=>{
if(e) return res.status(500).json(e)
res.json(r)
})
})

app.get("/properties/:id",verifyToken,(req,res)=>{
db.query("SELECT * FROM properties WHERE property_id=?",[req.params.id],(e,r)=>{
if(e) return res.status(500).json(e)
res.json(r[0])
})
})

app.put("/properties/:id",verifyToken,(req,res)=>{
const{address,property_type,rent_amount,status}=req.body
db.query("UPDATE properties SET address=?,property_type=?,rent_amount=?,status=? WHERE property_id=?",[address,property_type,rent_amount,status,req.params.id],(e)=>{
if(e) return res.status(500).json(e)
res.json({message:"updated"})
})
})

app.delete("/properties/:id",verifyToken,(req,res)=>{
db.query("DELETE FROM properties WHERE property_id=?",[req.params.id],(e)=>{
if(e) return res.status(500).json(e)
res.json({message:"deleted"})
})
})

app.post("/tenants",verifyToken,(req,res)=>{
const{user_id,phone_number,id_proof}=req.body
db.query("INSERT INTO tenants (user_id,phone_number,id_proof) VALUES (?,?,?)",[user_id,phone_number,id_proof],(e,r)=>{
if(e) return res.status(500).json(e)
res.json({tenant_id:r.insertId})
})
})

app.get("/tenants",verifyToken,(req,res)=>{
db.query("SELECT * FROM tenants",(e,r)=>{
if(e) return res.status(500).json(e)
res.json(r)
})
})

app.get("/tenants/:id",verifyToken,(req,res)=>{
db.query("SELECT * FROM tenants WHERE tenant_id=?",[req.params.id],(e,r)=>{
if(e) return res.status(500).json(e)
res.json(r[0])
})
})

app.put("/tenants/:id",verifyToken,(req,res)=>{
const{phone_number,id_proof}=req.body
db.query("UPDATE tenants SET phone_number=?,id_proof=? WHERE tenant_id=?",[phone_number,id_proof,req.params.id],(e)=>{
if(e) return res.status(500).json(e)
res.json({message:"updated"})
})
})

app.delete("/tenants/:id",verifyToken,(req,res)=>{
db.query("DELETE FROM tenants WHERE tenant_id=?",[req.params.id],(e)=>{
if(e) return res.status(500).json(e)
res.json({message:"deleted"})
})
})

app.post("/leases",verifyToken,(req,res)=>{
const{property_id,tenant_id,start_date,end_date,rent_amount,deposit,status}=req.body
db.query("INSERT INTO leases (property_id,tenant_id,start_date,end_date,rent_amount,deposit,status) VALUES (?,?,?,?,?,?,?)",[property_id,tenant_id,start_date,end_date,rent_amount,deposit,status],(e,r)=>{
if(e) return res.status(500).json(e)
res.json({lease_id:r.insertId})
})
})

app.get("/leases",verifyToken,(req,res)=>{
db.query("SELECT * FROM leases",(e,r)=>{
if(e) return res.status(500).json(e)
res.json(r)
})
})

app.get("/leases/:id",verifyToken,(req,res)=>{
db.query("SELECT * FROM leases WHERE lease_id=?",[req.params.id],(e,r)=>{
if(e) return res.status(500).json(e)
res.json(r[0])
})
})

app.put("/leases/:id",verifyToken,(req,res)=>{
const{start_date,end_date,rent_amount,deposit,status}=req.body
db.query("UPDATE leases SET start_date=?,end_date=?,rent_amount=?,deposit=?,status=? WHERE lease_id=?",[start_date,end_date,rent_amount,deposit,status,req.params.id],(e)=>{
if(e) return res.status(500).json(e)
res.json({message:"updated"})
})
})

app.delete("/leases/:id",verifyToken,(req,res)=>{
db.query("DELETE FROM leases WHERE lease_id=?",[req.params.id],(e)=>{
if(e) return res.status(500).json(e)
res.json({message:"deleted"})
})
})

app.post("/payments",verifyToken,(req,res)=>{
const{lease_id,amount,payment_date,month,status}=req.body
db.query("INSERT INTO payments (lease_id,amount,payment_date,month,status) VALUES (?,?,?,?,?)",[lease_id,amount,payment_date,month,status],(e,r)=>{
if(e) return res.status(500).json(e)
res.json({payment_id:r.insertId})
})
})

app.get("/payments",verifyToken,(req,res)=>{
db.query("SELECT * FROM payments",(e,r)=>{
if(e) return res.status(500).json(e)
res.json(r)
})
})

app.put("/payments/:id",verifyToken,(req,res)=>{
const{amount,payment_date,month,status}=req.body
db.query("UPDATE payments SET amount=?,payment_date=?,month=?,status=? WHERE payment_id=?",[amount,payment_date,month,status,req.params.id],(e)=>{
if(e) return res.status(500).json(e)
res.json({message:"updated"})
})
})

app.delete("/payments/:id",verifyToken,(req,res)=>{
db.query("DELETE FROM payments WHERE payment_id=?",[req.params.id],(e)=>{
if(e) return res.status(500).json(e)
res.json({message:"deleted"})
})
})

app.post("/complaints",verifyToken,(req,res)=>{
const{tenant_id,property_id,description,status}=req.body
db.query("INSERT INTO complaints (tenant_id,property_id,description,status) VALUES (?,?,?,?)",[tenant_id,property_id,description,status],(e,r)=>{
if(e) return res.status(500).json(e)
res.json({complaint_id:r.insertId})
})
})

app.get("/complaints",verifyToken,(req,res)=>{
db.query("SELECT * FROM complaints",(e,r)=>{
if(e) return res.status(500).json(e)
res.json(r)
})
})

app.put("/complaints/:id",verifyToken,(req,res)=>{
const{description,status}=req.body
db.query("UPDATE complaints SET description=?,status=? WHERE complaint_id=?",[description,status,req.params.id],(e)=>{
if(e) return res.status(500).json(e)
res.json({message:"updated"})
})
})

app.delete("/complaints/:id",verifyToken,(req,res)=>{
db.query("DELETE FROM complaints WHERE complaint_id=?",[req.params.id],(e)=>{
if(e) return res.status(500).json(e)
res.json({message:"deleted"})
})
})

app.listen(process.env.PORT||5000,()=>{
console.log("Server running")
})