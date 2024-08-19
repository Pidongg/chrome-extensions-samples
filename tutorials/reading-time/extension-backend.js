const express = require('express');
const MessageMedia = require('whatsapp-web.js').MessageMedia;
const bodyParser = require('body-parser');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { Client, LocalAuth } = require('whatsapp-web.js');
const fs = require("fs");
const fetch = require("node-fetch");
const { start } = require('repl');
require('dotenv').config();
const { HarmBlockThreshold, HarmCategory } = require("@google/generative-ai");


const app = express();
const port = 3000;
app.use(bodyParser.json());
app.use(cors());

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});

app.post('/generate-text', async (req, res) => {
    response = await generateText(req.article);
    res.send({ msg: response });
});


const genai = new GoogleGenerativeAI("AIzaSyCI6fra7W4NS2nWiGQuyRiF65OnWajv5Bs");
const safetySettings = [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_NONE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
      },
  ];

async function generateText(article) {
    const model = genai.getGenerativeModel({ model: "gemini-1.5-pro",
        systemInstruction: `Article Information:
- Title: ${article.title}
- Content extracted from HTML webpage: ${article.textContent}

You are an experienced journalist, crafting a concisely informative, impartial logline for the article above. Provide sufficient context about the key theme/style of the article to help viewers quickly evaluate if it aligns with their interests, being helpful, easy to read while not enraging creators. This logline will be displayed under the article’s title in the browser. 

Model loglines for other articles: 
- Britain's beloved resident cat, Larry, who has outlasted four Prime Ministers, prepares to greet the country's new leader. Meanwhile, they continue their duties of greeting guests, inspecting security, and napping on historic furniture. 
- Uncover the unexpected origins of the ubiquitous word ""okay."" This exploration traces its journey from a 19th-century misspelling fad to a global communication staple, revealing the cultural and linguistic forces behind its rise. 
- Psychiatrist Robert Waldinger shares findings from a 75-year study on happiness, exploring common misconceptions about wealth and fame. Through examining extensive data and personal stories, they uncover insights into the true factors that contribute to a fulfilling life. 
- A group of internet personalities blind taste a selection of American macro lagers, evaluating each for aroma, flavor, and aftertaste. They discuss the brewing process and offer insights into the unique characteristics of these beers. 

Hard Limits: 
- Highlight the KEY topic/theme in the article not directly stated in the title. Provide enough details for viewers to gauge interest.
- AVOID generic terms, personalize the logline. NO subjective interpretation.
- Avoid mentioning the title.
- Use short sentences to enhance readability. 25-60 words.`,
    safetySettings: safetySettings});

    const USER_INSTRUCTION = 'Please give your production-ready logline:';
    const chat = model.startChat({
        history: [],
        generationConfig: {
            maxOutputTokens:100,
            temperature: 0.1
        }
    });

    const result = await chat.sendMessage(USER_INSTRUCTION);
    const response = await result.response.text();
    return response;
}