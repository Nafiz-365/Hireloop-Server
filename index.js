import express from "express";

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(express.json());


app.get("/", (req, res) => {
    res.send("Hireloop Server is running");
});

app.listen(port, () => {
    console.log(`Hireloop Server is running on port ${port}`);
});
