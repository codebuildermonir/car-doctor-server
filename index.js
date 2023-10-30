const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const cors= require('cors');
const app = express();
const port = process.env.PORT || 5003;
// middleware
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.i3mosdj.mongodb.net/?retryWrites=true&w=majority`;
//const uri = "mongodb+srv://<username>:<password>@cluster0.i3mosdj.mongodb.net/?retryWrites=true&w=majority";

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


    app.get('/bookings', async(req, res)=>{

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






