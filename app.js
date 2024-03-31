const express = require("express");
const app = express();
const webpush = require('web-push');
const mongo = require('mongoose');
const cors = require("cors")

const port = 3000;

mongo.connect('mongodb+srv://anandjethava538:Anand123@cluster0.ujbaulb.mongodb.net/Notification')
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));


const subscriptionSchema = new mongo.Schema({
    endpoint: String,
    keys: {
        auth: String,
        p256dh: String
    }
});
    
const Subscription = mongo.model('Subscription', subscriptionSchema);
    

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


app.post("/save-subscription", async (req, res) => {
    try {
        const subscription = new Subscription(req.body);
        await subscription.save();
        res.json({ status: "Success", message: "Subscription saved!" });
    } catch (err) {
        res.status(500).json({ status: "Error", message: err.message });
    }
});

app.get("/send-notification", async (req, res) => {
    try {
        const subscriptions = await Subscription.find();
        const validSubscriptions = [];

        // Filter out invalid subscriptions
        for (const sub of subscriptions) {
            try {
                // Attempt to send a test notification to check subscription status
                await webpush.sendNotification(sub, "Checking subscription status");
                validSubscriptions.push(sub);
            } catch (err) {
                // If sending notification fails, assume subscription is invalid
                console.log(`Subscription ${sub._id} is no longer valid: ${err.message}`);
                // Optionally, you can remove the invalid subscription from the database
                // await Subscription.findByIdAndDelete(sub._id);
            }
        }

        // Send notifications only to valid subscriptions
        for (const sub of validSubscriptions) {
            try {
                await webpush.sendNotification(sub, "Hello world");
            } catch (err) {
                console.error(`Failed to send notification to ${sub._id}: ${err.message}`);
                // Handle error (e.g., retry, log, etc.)
            }
        }

        res.json({ status: "Success", message: "Notifications sent successfully" });
    } catch (err) {
        console.error(`Error sending notifications: ${err.message}`);
        res.status(500).json({ status: "Error", message: err.message });
    };
});


app.listen(port, () => {
    console.log("Server running on port 3000!");
})