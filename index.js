import express from "express";
import { MongoClient, ObjectId } from "mongodb";
import "dotenv/config";
import cors from "cors";

const app = express();
const port = process.env.PORT || 5000;
const client = new MongoClient(process.env.MONGODB_URI);

export async function connectToMongoDB() {
    try {
        await client.connect();
        console.log("You successfully connected to MongoDB!");
        return client;
    } catch (err) {
        console.dir(err);
    }
}

const connectedClient = await connectToMongoDB();

const db = connectedClient.db("hireloop_db");
const usersCollection = db.collection("user");
const jobsCollection = db.collection("job");

// Middleware
app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
    res.send("Hireloop Server is running");
});

app.get("/users", async (req, res) => {
    const users = await usersCollection.find({}).toArray();
    res.json(users);
});

// Jobs Related APIs
app.get("/jobs", async (req, res) => {
    const query = {};
    console.log("Query:", req.query);
    if (req.query) {
        if (req.query.jobType) {
            query.jobType = req.query.jobType;
        }
        if (req.query.isRemote) {
            query.isRemote = req.query.isRemote === "true";
        }
        if (req.query.jobCategory) {
            query.jobCategory = req.query.jobCategory;
        }
        if (req.query.search) {
            query.$or = [
                { jobTitle: { $regex: req.query.search, $options: "i" } },
                {
                    responsibilities: {
                        $regex: req.query.search,
                        $options: "i",
                    },
                },
            ];
        }
    }
    const jobs = await jobsCollection.find(query).toArray();
    res.json(jobs);
});

app.post("/jobs", async (req, res) => {
    const job = req.body;
    const result = await jobsCollection.insertOne(job);
    res.json(result);
});

app.delete("/jobs/:id", async (req, res) => {
    const id = req.params.id;
    const result = await jobsCollection.deleteOne({ _id: new ObjectId(id) });
    res.json(result);
});

app.listen(port, () => {
    console.log(`Hireloop Server is running on port ${port}`);
});
