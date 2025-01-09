import { GoogleGenerativeAI } from '@google/generative-ai';
import { HarmBlockThreshold, HarmCategory } from '@google/generative-ai';
const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "OPTIONS,POST,GET,PATCH",
    "Content-Type": "application/json",
    "Access-Control-Allow-Headers": "Content-Type"
};

// const prompt_longer = ...

// const prompt_shorter = ...

// const prompt_bullet_point = ...

export const handler = async (event, context) => {
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            body: ''
        };
    }
    const { title, textContent, longer, bullet } = JSON.parse(event.body);
    const response = await generateText(title, textContent, longer, bullet);
    console.log(response);
    return {
        statusCode: 200,
        headers: headers,
        body: JSON.stringify({ response })
    };
};

const genai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
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

async function generateText(title, textContent, longer, bullet) {
    let systemInstruction = `Article Information:
- Title: ${title}
- Content extracted from HTML webpage: ${textContent}

`;
    // let USER_INSTRUCTION = ...;
    if (bullet) {
        systemInstruction += prompt_bullet_point;
        //USER_INSTRUCTION = ...;

    } else if (!longer) {
        systemInstruction += prompt_shorter;
    }
    else {
        systemInstruction += prompt_longer;
        /// USER_INSTRUCTION = ...;
    }
    const model = genai.getGenerativeModel({
        model: "gemini-1.5-pro",
        systemInstruction: systemInstruction,
        safetySettings: safetySettings
    });

    const chat = model.startChat({
        history: [],
        generationConfig: {
            maxOutputTokens: 1000,
            temperature: 0.1
        }
    });

    const result = await chat.sendMessage(USER_INSTRUCTION);
    const response = await result.response.text();
    return response;
}