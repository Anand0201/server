const express = require("express");
const app = express();
const webpush = require('web-push');
const cors = require("cors")

const port = 3000;

const apiKeys = {
    publicKey: "BDyotF8mi37TNaFBxRwLGApQPs2rXNSfFFMFN3E-eC3yfXfUs3huJDN1NOH4iX5Or9JjvRT9wQYO4uOYaDj2lT8",
    privateKey: "7JJ5INkqP_9YztXLLc5DvHEbR34jkh31bvz-IC96lFk"
}

webpush.setVapidDetails(
    'mailto: example@example.com',
    apiKeys.publicKey,
    apiKeys.privateKey
)

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Hello world");
})

const subDatabse = [];


app.post("/save-subscription", (req, res) => {
    subDatabse.push(req.body);
    res.json({ status: "Success", message: "Subscription saved!" })
})

app.get("/send-notification", (req, res) => {
    webpush.sendNotification(subDatabse[0], "Hello world");
    res.json({ "statue": "Success", "message": "Message sent to push service" });
})

app.listen(port, () => {
    console.log("Server running on port 3000!");
})