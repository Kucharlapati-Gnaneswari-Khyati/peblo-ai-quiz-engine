require("dotenv").config();

const express = require("express");
const path = require("path");

const db = require("./database");
const { extractText } = require("./services/pdfParser");
const { generateQuiz } = require("./services/llmService");
const { chunkText } = require("./services/chunker");

const app = express();

/* -----------------------------
   Middleware
--------------------------------*/
app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));

/* -----------------------------
   Root route (Fixes "Cannot GET /")
--------------------------------*/
app.get("/", (req, res) => {
  res.send("Peblo AI Quiz Engine Running");
});

/* -----------------------------
   Health Check
--------------------------------*/
app.get("/health", (req, res) => {
  res.json({ status: "Peblo AI Quiz Engine Running" });
});

/* -----------------------------
   1. CONTENT INGESTION
--------------------------------*/
app.get("/ingest", async (req, res) => {

  try {

    const file = req.query.file;

    if (!file) {
      return res.status(400).json({ error: "file parameter required" });
    }

    /* ---------- METADATA FROM FILENAME ---------- */

    let grade = 1;
    let subject = "Math";
    let topic = "General";

    if (file.includes("science")) {
      grade = 3;
      subject = "Science";
      topic = "Plants and Animals";
    }

    if (file.includes("english")) {
      grade = 4;
      subject = "English";
      topic = "Grammar and Vocabulary";
    }

    if (file.includes("math")) {
      grade = 1;
      subject = "Math";
      topic = "Numbers and Shapes";
    }

    /* ---------- EXTRACT TEXT ---------- */

    const text = await extractText(`./pdfs/${file}`);

    /* ---------- CHUNK TEXT ---------- */

    const chunks = chunkText(text);

    /* ---------- STORE CHUNKS ---------- */

    chunks.forEach((chunk, index) => {

      db.run(
        `INSERT INTO chunks
        (source_id,chunk_id,grade,subject,topic,text)
        VALUES (?,?,?,?,?,?)`,
        [
          file,
          `${file}_CH_${index}`,
          grade,
          subject,
          topic,
          chunk
        ]
      );

    });

    res.json({
      message: "PDF ingested successfully",
      file,
      grade,
      subject,
      topic,
      chunks_created: chunks.length
    });

  } catch (error) {

    res.status(500).json({ error: error.message });

  }

});


/* -----------------------------
   2. QUIZ GENERATION (LLM)
--------------------------------*/
app.get("/generate-quiz", async (req, res) => {

  const source = req.query.source;

  if(!source){
    return res.status(400).json({
      error:"Provide source parameter"
    });
  }

  db.all(
    `SELECT * FROM chunks WHERE source_id=? LIMIT 1`,
    [source],
    async (err, rows) => {

      if (err) return res.status(500).json(err);

      if (!rows || rows.length === 0) {
        return res.status(400).json({
          error: "No chunks found for this source. Run /ingest first."
        });
      }

      const chunk = rows[0];

      const questions = await generateQuiz(chunk.text);

      questions.forEach(q => {

db.run(
`INSERT INTO questions
(chunk_id, question, type, options, answer, difficulty, source_chunk_id)
VALUES (?, ?, ?, ?, ?, ?, ?)`,
[
chunk.chunk_id,
q.question,
q.type,
JSON.stringify(q.options),
q.answer,
q.difficulty,
chunk.chunk_id
]
);

});

      res.json({
        message: "Quiz generated",
        source,
        questions
      });

    }
  );

});


/* -----------------------------
   3. QUIZ RETRIEVAL
--------------------------------*/
app.get("/quiz", (req, res) => {

const source = req.query.source;
const difficulty = req.query.difficulty || "medium";

db.get(
`SELECT * FROM questions 
WHERE source_chunk_id LIKE ? AND difficulty=? 
ORDER BY RANDOM() LIMIT 1`,
[`%${source}%`, difficulty],
(err, row) => {

if (err) return res.status(500).json(err);

if (!row) {

  // fallback query
  db.get(
  `SELECT * FROM questions 
   WHERE source_chunk_id LIKE ? 
   ORDER BY RANDOM() LIMIT 1`,
  [`%${source}%`],
  (err2,row2)=>{

    if(err2) return res.status(500).json(err2);

    if(!row2){
      return res.json({message:"No question found"});
    }

    row2.options = JSON.parse(row2.options);
    res.json(row2);

  });

return;
}

row.options = JSON.parse(row.options);
res.json(row);

});
});

/* -----------------------------
   4. STUDENT ANSWER SUBMISSION
--------------------------------*/
app.post("/submit-answer",(req,res)=>{

const {student_id, question_id, selected_answer} = req.body;

db.get(
`SELECT answer, difficulty FROM questions WHERE id=?`,
[question_id],
(err,row)=>{

if(err) return res.status(500).json(err);

if(!row){
return res.status(404).json({error:"Question not found"});
}

const correct =
row.answer.toLowerCase().trim() === selected_answer.toLowerCase().trim();

db.run(
`INSERT INTO student_answers
(student_id, question_id, selected_answer, correct)
VALUES (?,?,?,?)`,
[student_id, question_id, selected_answer, correct?1:0]
);

let nextDifficulty = row.difficulty;

if(correct){
if(row.difficulty==="easy") nextDifficulty="medium";
else if(row.difficulty==="medium") nextDifficulty="hard";
}
else{
if(row.difficulty==="hard") nextDifficulty="medium";
else if(row.difficulty==="medium") nextDifficulty="easy";
}

res.json({
correct,
next_difficulty: nextDifficulty
});

});

});


/* -----------------------------
   SERVER START
--------------------------------*/
app.listen(3000, () => {
  console.log("Server running on port 3000");
});