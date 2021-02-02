const bodyParser= require("body-parser")
let express = require("express")
let app =express()
app.use(bodyParser.urlencoded({extended: false}))

const sqlite3=require("sqlite3").verbose()
const db= new sqlite3.Database("./service-station.db",(err)=>{
    if(err)
    console.log("error in opening db")
    else
    {
        console.log("db connected")
        db.run(`CREATE TABLE IF NOT EXISTS USERS(ROLE VARCHAR(20) NOT NULL,
                                                  NAME VARCHAR(30) NOT NULL,
                                                  PHONE VARCHAR(15) UNIQUE NOT NULL,
                                                  GENDER VARCHAR(2) NOT NULL,
                                                  EMAIL_ID VARCHAR(30) NOT NULL,
                                                  ADDRESS VARCHAR(50) NOT NULL,
                                                  PASSWORD VARCHAR(10) NOT NULL)`,
                (err)=> {
                                if(err)
                                     console.log("could not create table",err)
                                else{
                                     console.log(" USER table  created successfully")
                                     }
                         })
        db.run(`CREATE TABLE IF NOT EXISTS SERVICE (MECHANIC_NAME VARCHAR(50) NOT NULL,
                                                   VEHICLE_NUMBER VARCHAR(25) UNIQUE NOT NULL, 
                                                   SERVICE_DETAIL VARCHAR(100) NOT NULL,
                                                   DATE VARCHAR(10) NOT NULL,
                                                   AMOUNT INTEGER NOT NULL )`,
                                            (err)=>{
                                                if(err)
                                                console.log("could not create table",err)
                                                else{
                                                    console.log(" service table created successfully")
                                                }
                                            })
    }
    db.run(`CREATE TABLE IF NOT EXISTS BILLING (SERVICE VARCHAR(100),
                                                DATE VARCHAR(10),
                                                FOREIGN KEY (SERVICE) REFERENCES SERVICE(SERVICE_DETAIL)
                                                FOREIGN KEY (DATE) REFERENCES SERVICE(DATE))`,
                                                (err)=>
                                                {
                                                    if(err)
                                                    console.log("could not create billing table",err)
                                                    else{
                                                        console.log("billing table created")
                                                    }
                                                })
})
app.set("views","./views")
app.set("view engine","ejs");
let port=5000
 
app.get("/",(req, res)=>{
    res.render("login")
})

app.get("/adminside",(req,res)=>{
    res.render("adminside")
})
app.get("/mechanicside",(req,res)=>{
    res.render("mechanicside")
})

app.get("/home",(req, res)=>{
    res.render("home")
})

app.get("/addusers",(req, res)=>{
    res.render("addusers",{status:0})
})
app.get("/service",(req,res)=>{
    res.render("service",{status:1})
})


app.post("/addusers", (req, res)=>{
    console.log("INSIDE")
    /* let user_id = req.body.user_id */
    let role=req.body.role
    let name  = req.body.name
    let phone = req.body.phone
    console.log(phone);
    let gender = req.body.gender
    let email_id = req.body.email_id
    console.log(email_id)
    let address = req.body.address
    let password = req.body.password
        db.run("INSERT INTO USERS(ROLE,NAME,PHONE,GENDER,EMAIL_ID,ADDRESS,PASSWORD) VALUES(?,?,?,?,?,?,?)",
        [role, name, phone, gender, email_id, address, password],(err)=>{
                        if(err){
                            console.log(err)
                            res.status(500).render("addusers",{status : err})
                        }
                        else{
                            res.status(200).render("addusers",{status: "success"})
                        }
                    })
})
app.post("/service",(req,res)=>{
    console.log("inside service")
    let Mechanic_Name =req.body.Mechanic_Name
    let Vehicle_Number=req.body.Vehicle_Number
    let Service_Detail=req.body.Service_Detail
    let Date=req.body.Date
    let Amount=req.body.Amount
        db.run("INSERT INTO SERVICE(MECHANIC_NAME,VEHICLE_NUMBER,SERVICE_DETAIL,DATE,AMOUNT) VALUES(?,?,?,?,?)",
        [Mechanic_Name,Vehicle_Number,Service_Detail,Date,Amount], (err)=>{  
            if(err){
            console.log(err)
            res.status(500).render("service",{status : err})
            }
        
        else{
            res.status(200).render("service",{status:"success"})
        }
    })
})

app.post("/login",function(req,res){
    let email_id=req.body.email_id;
    let password=req.body.password;

    if(req.body.email_id && req.body.password)
    {
        console.log("checking email "  +email_id+"password" +password)
        let sql="select * from users where email_id=? AND password=?";
        db.all(sql,[email_id,password],(err,rows)=>{
            if(err)
            {
                console.log("error",err)
            }else if(rows.length==0){
                console.log("invalid credential")
            }else if(rows[0].ROLE=="admin"){
                console.log("admin logged in");
                res.render("adminside")
            }else{
                console.log(rows);
                console.log("Mechanic Login")
                res.render("mechanicside")
            }
        })
    }
})

app.get("/users", (req, res)=>{      /* display users page */
        db.all("select *from users",(err, rows)=>{
            console.log(rows)
            if(err)
                res.render("users",{status: err})

            res.render("users",{showusers :rows})
        })
})  
app.get("/allService",(req,res)=>{
    db.all("select *from service",(err,rows)=>
    {
        console.log(rows)
        if(err)
            res.render("allService",{status:err})
            res.render("allService",{showServiceDetails:rows})
    })
})

app.get("/bill",(req,res)=>{
    db.all("SELECT SERVICE.VEHICLE_NUMBER, SERVICE.SERVICE_DETAIL FROM SERVICE",(err,rows)=>
    {
        console.log(rows)
        if(err){
            console.log(err)
            res.render("bill",{allBill:[],status:err})

        }
     res.render("bill",{allBill:rows})
    })
})

app.listen(port, ()=>{
    console.log(`server started at port ${port}`)
})