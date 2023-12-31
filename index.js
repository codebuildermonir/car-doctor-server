const express = require('express');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const cors= require('cors');
const app = express();
const port = process.env.PORT || 5003;
// middleware
app.use(cors({
  origin:['http://localhost:5173'],
  credentials:true
}));
app.use(express.json());
app.use(cookieParser())

// my create middleware

const verifyToken= async(req, res ,next)=>{
  const token = req.cookies?.token;
  
  if(!token){
    return res.status(401).send({message:'not authorized'})
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decode)=>{
    if(err){
      return res.status(401).send({message:'not authorized'})
    }
    req.user =decode;

    next()

  })

  
}




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.i3mosdj.mongodb.net/?retryWrites=true&w=majority`;


// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const serviceCollection= client.db('carDoctor').collection('carServices');
    const bookCollection= client.db('carDoctor').collection('bookings')
 // Auth related api

 app.post('/jwt', async(req, res)=>{
    const user= req.body
    console.log(user)
    const token= jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn:'10h'})
    res
    .cookie('token', token ,{
      httpOnly:true,
      secure:false
    })
    
    .send({success:true})



 })

    
 





// Services related api
    app.get('/carServices', async(req, res)=>{
      const cursor = serviceCollection.find()
      const result = await cursor.toArray()
      res.send(result)

    })

    app.get('/carServices/:id', async(req,res)=>{
      const id = req.params.id;
      const query= {_id : new ObjectId(id)};
      const options = {
        projection: {title:1, service_id: 1, price: 1,img:1 },
      }; 
      const result = await serviceCollection.findOne(query,options)
      res.send(result)
    })


    app.get('/bookings',verifyToken, async(req, res)=>{
      if(req.query.email !== req.user.email){
        return res.status(403).send({message:'forbidden access'})
      }
      
      let query = {};
       if(req.query?.email){
        query = {email:req.query.email}
      }

      const result = await bookCollection.find(query).toArray();
      res.send(result)

    })

    app.post('/bookings', async(req, res)=>{
      
      const book= req.body;
      const result= await bookCollection.insertOne(book)
      res.send(result)


    })

    app.delete('/bookings/:id',async(req, res)=>{

      const id= req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await bookCollection.deleteOne(query);
      res.send(result)

    })


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    //await client.close();
  }
}
run().catch(console.dir);


app.get('/',(req,res)=>{
      res.send('Hello car doctor')

})

app.listen(port,()=>{
      console.log(`Car doctor is running on port${port}`)
})






