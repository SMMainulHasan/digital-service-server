const express = require('express')
const app = express()
require("dotenv").config();
const cors = require('cors')
const ObjectID = require('mongodb').ObjectID;
const MongoClient = require('mongodb').MongoClient;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.cxq2v.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const port = 8080;

//Middleware
app.use(cors());
app.use(express.json());


client.connect(err => {
    const serviceCollection = client.db("digitalService").collection("service");
    const reviewCollection = client.db("digitalService").collection("review");
    const orderCollection = client.db("digitalService").collection("order");
    const adminCollection = client.db("digitalService").collection("admin");

    //========================Services related api======================//
    //Add Service only admin can add
    app.post('/addService', (req, res) => {
        const service = req.body;
        serviceCollection.insertOne(service)
            .then(result => res.send(result.insertedCount > 0))
    })


    //Get all services detail
    app.get('/getServices', (req, res) => {
        serviceCollection.find({})
            .toArray((err, documents) => {
                res.send(documents)
            })
    })


    //Get only one service detail
    app.get('/getServices/:id', (req, res) => {
        const id = req.params.id;
        serviceCollection.find({ _id: ObjectID(id) })
            .toArray((err, documents) => {
                res.send(documents[0])
            })
    })


    //Delete service
    app.delete('/deleteService/:id', (req, res) => {
        const id = req.params.id;
        serviceCollection.deleteOne({ _id: ObjectID(id) })
            .then(result => {
                res.send(result.deletedCount > 0);
            })
    })

    //=======================Orders related api======================//
    //Add user order
    app.post('/addOrder', (req, res) => {
        const orderedService = req.body;
        orderCollection.insertOne(orderedService)
            .then(result => res.send(result.insertedCount > 0))
    })


    //Get all order for admin through email query(/getAllOrders?email=<email>)
    app.get('/getAllOrders', (req, res) => {
        orderCollection.find({})
            .toArray((err, documents) => {
                res.send(documents)
            })
    })


    //Update order status
    app.patch('/updateStatus/:id', (req, res) => {
        const id = req.params.id;
        const status = req.body.status;
        orderCollection.updateOne({ _id: ObjectID(id) }, { $set:{status: status}})
        .then(result => { 
            res.send(result.modifiedCount > 0);
        })
            
    })


    //Get order list only for user through email query(/getMyOrders?email=<email>)
    app.get('/getMyOrders', (req, res) => {
        const email = req.query.email;
        orderCollection.find({ email: email })
            .toArray((err, documents) => {
                res.send(documents)
            })
    })


    //=======================Review related api=====================//
    //Add user reviews
    app.post('/addReview', (req, res) => {
        const review = req.body;
        reviewCollection.insertOne(review)
            .then(result => res.send(result.insertedCount > 0))
    })

    //Get all reviews info
    app.get('/getAllReviews', (req, res) => {
        reviewCollection.find({})
            .toArray((err, documents) => {
                res.send(documents)
            })
    })


    //=======================Add admin api=====================//
    //Add admin email
    app.post('/addAdmin', (req, res) => {
        const email = req.body;
        adminCollection.insertOne(email)
            .then(result => res.send(result.insertedCount > 0))
    })


    //Get user role through email query(/getMyOrders?email=<email>)
    app.get('/getAdminRole', (req, res) => {
        const email = req.query.email;
        adminCollection.find({ email: email })
            .toArray((err, documents) => {
                let admin;
                documents[0]?.email ? admin = true : admin = false
                res.send({ admin })
            })
    })


    // client.close();
});


app.listen(process.env.PORT || port)