
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();


const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;

const app = express();

app.use(cors());
app.use(bodyParser.json());




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.gfyph.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
const port = 8050;

app.listen(process.env.PORT || port);


app.get('/', (req, res) => {
    res.send("Hello World!")
})


client.connect(err => {

    const bookings = client.db(`${process.env.DB_NAME}`).collection("bookings");


    const business = client.db(`${process.env.DB_NAME}`).collection("business");

    const economy = client.db(`${process.env.DB_NAME}`).collection("economy");

    const user = client.db(`${process.env.DB_NAME}`).collection("user");

    const seats = client.db(`${process.env.DB_NAME}`).collection("seats");



    app.patch('/updateStatus/:id', (req, res) => {

        const id = ObjectID(req.params.id);
      
        seats.updateOne({ _id: id },
            {
                $set: req.body
            })
            .then((result) => {
                if (result.modifiedCount > 0) {
                    res.send(result);
                }
            })

        console.log(id, req.body);
    })

    app.get("/economy", (req, res) => {
        economy.find()
            .toArray((err, items) => {
                res.send(items);
            })
    })
    app.get("/business", (req, res) => {
        business.find()
            .toArray((err, items) => {
                res.send(items);
            })
    })


    app.post('/addPack', (req, res) => {
        const newPackages = req.body;

        const ticket = req.body.ticket;

        if (ticket === "Business") {
            business.insertOne(newPackages)
                .then(result => {
                    res.send(result.insertedCount > 0);
                })
        }
        if (ticket === "Economy") {
            economy.insertOne(newPackages)
                .then(result => {
                    res.send(result.insertedCount > 0);
                })
        }
    })


    app.get('/seats', (req, res) => {
        seats.find()
            .toArray((err, items) => {
                res.send(items);
            })
    })

    app.get('/book/:id', (req, res) => {

        const id = ObjectID(req.params.id);

        economy.find({ _id: id })
            .toArray((err, item) => {
                // res.send(item);
                if (item.length > 0) {
                    res.send(item);
                }
                else {
                    business.find({ _id: id })
                        .toArray((err, item) => {
                            if (item.length > 0) {
                                res.send(item);
                            }
                        })
                }
            })

    })

    app.post('/addUser', (req, res) => {
        const newUser = req.body;

        user.insertOne(newUser)
            .then(result => {
                res.send(result.insertedCount > 0);
            })

        console.log(newUser);
    })


});
