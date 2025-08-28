const express = require("express");
// const { GoogleGenerativeAI } = require("@google/generative-ai");
const Event = require("../models/Event.js");
const Payment = require("../models/Payment.js");
const Notification = require("../models/Notification.js");
const { marked } = require("marked");
const OpenAI = require("openai");

const router = express.Router();




async function ai(token,model,endpoint,prompt,question) {

  const client = new OpenAI({ baseURL: endpoint, apiKey: token });

  const response = await client.chat.completions.create({
    messages: [
        { role:"system", content: prompt },
        { role:"user", content: question }
      ],
      temperature: 1,
      top_p: 1,
      model: model
    });

//   console.log(response.choices[0].message.content);
  return `${response.choices[0].message.content}`;
}

// ✅ Initialize Gemini
// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.get("/", (req, res) => {
    res.render("ai", { title: "Ask AI" });
});

router.post("/", async (req, res) => {
    try {
        const { question } = req.body;
        const userId = req.session.user?._id;

        const token = process.env.GITHUB_TOKEN;
        const endpoint = "https://models.github.ai/inference";
        const model1 = "openai/gpt-4.1-mini";


        if (!question) {
            return res.status(400).json({ error: "Question is required" });
        }

        if (!userId) {
            return res.status(401).json({ error: "User must be logged in" });
        }

        // ✅ Fetch events and payments
        const events = await Event.find();
        const payments = await Payment.find({ userId });
        const notifications = await Notification.find({ userId });

        const getEventDetails = async (eventId) => {
            const e = await Event.findOne({ _id: eventId });
            if (!e) return "";

            return [
                `Title: ${e.title}`,
                `Description: ${e.description}`,
                `Date: ${formatDate(e.date)}`,
                `Time: ${formatTime(e.time)}`,
                `Location: ${e.location}`,
                `Category: ${e.category}`,
                `Price: $${e.price}`,
                `Seats Remaining: ${e.remainingSeats}`,
                `Status: ${e.status}`
            ].join("\n");
        };

        // ✅ Format dates/times properly
        const formatDate = (date) =>
            new Date(date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
            });
        const formatTime = (time) =>
            new Date(time).toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
            });

        // ✅ Prompt construction
        const prompt = `
You are an assistant for an Event Management website.  
You have three types of information: **Events, Payments, and Notifications**.  
Always answer the user's question based strictly on these.
You can use the information provided to construct a relevant response. For example, if the user asks about a specific event registration details, you can pull details from the "Event Information", payments and notifications sections.
You can use the full data provided about the user to answer any questions.


Do use markdown (** or ##) to emphasize on main .  
Never expose raw JSON, ObjectIds, or backend fields.  

### Event Information:
${events
                .map(
                    (e) =>
                        `- Title: ${e.title}, Description: ${e.description}, Date: ${formatDate(
                            e.date
                        )}, Time: ${formatTime(e.time)}, Location: ${e.location}, Category: ${e.category
                        }, Price: $${e.price}, Seats Remaining: ${e.remainingSeats
                        }, Status: ${e.status}`
                )
                .join("\n")}

### User's Payments:
${await Promise.all(
                    payments.map(async (p) => {
                        return `- Event: ${await getEventDetails(p.eventId)}, Amount: ${p.amount}, Status: ${p.status === "paid" ? "Paid" : p.status
                            }`;
                    })
                ).then((arr) => arr.join("\n"))}

### User's Notifications:
${await Promise.all(
                    notifications.map(async (n) => {
                        let notificationInfo = [];
                        notificationInfo.push(`Notification Start:`);

                        notificationInfo.push(`Type: ${n.type}`);
                        if (n.title) notificationInfo.push(`Title: ${n.title}`);
                        if (n.relatedEventId)
                            notificationInfo.push(`Event: ${await getEventDetails(n.relatedEventId)}`);
                        if (n.message) notificationInfo.push(`Message: ${n.message}`);
                        notificationInfo.push(`Status: ${n.read ? "Read" : "Unread"}`);
                        notificationInfo.push(`Notification End.`);
                        return notificationInfo.join("\n");
                    })
                ).then((arr) => arr.join("\n"))}

### Rules:
1. For <b>event queries</b>, only use the "Event Information" section.  
2. For <b>payment/registration queries</b>, cross-check eventId with "User's Payments".  
3. For <b>notification queries</b>, use ONLY the "User's Notifications" section, and clearly state whether notifications are <b>read</b> or <b>unread</b>.  
4. If user asks something not covered, reply: "Sorry, I don’t have that information."  
5. Always answer concisely and naturally, never exposing raw IDs or JSON.  

Now respond to the user's query:  


`;


        // ✅ Call Gemini
        // const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        // const result = await model.generateContent(prompt);
        // const response = await result.response;
        const response = await ai(token,model1,endpoint,prompt,question);
        // const text = response.text;

        // ✅ Convert markdown to HTML safely
        const parsedResponse = marked.parse(response);

        res.json({ response: parsedResponse });
    } catch (err) {
        console.error("AI Request Error:", err);
        res.status(500).json({
            error: "Failed to process AI request",
            details: err.message,
        });
    }
});



ai().catch((err) => {
  console.error("The sample encountered an error:", err);
});







module.exports = router;
