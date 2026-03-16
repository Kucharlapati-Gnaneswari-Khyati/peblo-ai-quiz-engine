const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

async function generateQuiz(text){

try{

const completion = await groq.chat.completions.create({
model:"llama-3.1-8b-instant",
messages:[
{
role:"user",
content:`
Generate 3 quiz questions from the following educational content.

The questions must include:
1 MCQ
1 True/False
1 Fill in the blank.

Return ONLY JSON.

Example format:

[
{
"question":"How many sides does a triangle have?",
"type":"MCQ",
"options":["2","3","4","5"],
"answer":"3",
"difficulty":"medium"
},
{
"question":"Plants produce oxygen. True or False?",
"type":"True/False",
"options":["True","False"],
"answer":"True",
"difficulty":"medium"
},
{
"question":"Plants use sunlight to make _____",
"type":"FillBlank",
"options":[],
"answer":"food",
"difficulty":"medium"
}
]

Content:
${text}
`
}
]
});

const raw = completion.choices[0].message.content;

const jsonMatch = raw.match(/\[[\s\S]*\]/);

if(!jsonMatch){
throw new Error("Invalid JSON from LLM");
}

let cleaned = jsonMatch[0].replace(/\/\/.*$/gm,"");

return JSON.parse(cleaned);

}catch(error){

console.log("LLM failed — using fallback questions");

/* fallback questions */

return [
{
question:"What does a plant need to grow?",
type:"MCQ",
options:["Water","Stone","Metal","Plastic"],
answer:"Water",
difficulty:"medium"
},
{
question:"Which animal lives in water?",
type:"MCQ",
options:["Fish","Dog","Cow","Cat"],
answer:"Fish",
difficulty:"medium"
},
{
question:"Plants produce food using sunlight. True or False?",
type:"True/False",
options:["True","False"],
answer:"True",
difficulty:"medium"
}
];

}

}

module.exports = { generateQuiz };