const express =require('express')
const cors = require('cors')
const app = express();
require('dotenv').config()
const jwt = require('jsonwebtoken')
const port = process.env.PORT || 5000;


//middleware
app.use(cors())
app.use(express.json())


const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.7tamy9s.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function VerifyJWT(req, res, next){
    const authHeader = req.headers.authorization;
    if(!authHeader){
        res.status(401).send({message: 'Unauthorized Access'})
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function(err, decoded){
        if(err){
            res.status(403).send({message: 'Unauthorized Access'})
        }
        req.decoded =decoded
        next()
    })
}

async function run(){
    try{
        const servicesCollection = client.db('hematoCare').collection('services') 


        app.post('/jwt', (req, res)=>{
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
                expiresIn: '1d'
            })
            res.send({token})
        })

        app.get('/home', async(req, res)=>{
            const query = {};
            const cursor = servicesCollection.find(query)
            const services = await cursor.limit(3).toArray();
            res.send(services)
        })

        app.get('/services', async(req, res)=>{
            const query = {};
            const cursor = servicesCollection.find(query);
            const services = await cursor.toArray();
            res.send(services)
        })
    }finally{

    }
}

run().catch(err => console.log(err))



app.get('/', (req, res)=>{
    res.send('HematoCare server is running')
})

app.listen(port, ()=>{
    console.log('HematoCare server is running on port', port)
})
