const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Connect to MongoDB
const mongoUri = "mongodb://localhost:27017/custom";
if (!mongoUri) {
    throw new Error("MONGODB_URI environment variable is not defined");
}

mongoose.connect(mongoUri)
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((err) => {
        console.error('Error connecting to MongoDB:', err);
        process.exit(1); // Exit the process with a failure
    });


const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('MongoDB connection is open');
});

// Middleware
app.use(express.json());

// Define a schema and model for Person
const personSchema = new mongoose.Schema({
    Name: String,
    Age: Number
});

const Person = mongoose.model('customers', personSchema);

// POST route to add a new person
app.post('/persons', async (req, res) => {
    try {
        const newPerson = new Person({
            Name: req.body.Name,
            Age: req.body.Age
        });

        const savedPerson = await newPerson.save();
        res.status(201).send(savedPerson);
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

// GET route to retrieve all persons
app.get('/persons', async (req, res) => {
    try {
        const persons = await Person.find();
        res.status(200).send(persons);
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

// PUT route to update a person by ID
app.put('/persons/:id', async (req, res) => {
    try {
        const updatedPerson = await Person.findByIdAndUpdate(
            req.params.id,
            {
                Name: req.body.Name,
                Age: req.body.Age
            },
            { new: true } // Return the updated document
        );
        if (!updatedPerson) {
            res.status(404).send({ error: 'Person not found' });
        } else {
            res.status(200).send(updatedPerson);
        }
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

// DELETE route to delete a person by ID
app.delete('/persons/:id', async (req, res) => {
    try {
        const deletedPerson = await Person.findByIdAndDelete(req.params.id);
        if (!deletedPerson) {
            res.status(404).send({ error: 'Person not found' });
        } else {
            res.status(200).send(deletedPerson);
        }
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
