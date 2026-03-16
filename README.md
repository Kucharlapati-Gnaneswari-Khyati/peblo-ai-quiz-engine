Peblo AI – Content Ingestion & Adaptive Quiz Engine

A backend system that ingests educational PDFs, extracts structured knowledge, and generates adaptive quizzes using a Large Language Model (LLM).

This project simulates a core capability of the Peblo learning platform: transforming raw educational material into interactive learning experiences.

Project Overview

Modern learning systems require transforming static content into dynamic assessments.
This project demonstrates a mini AI-powered pipeline that:

Ingests educational PDFs

Extracts and structures learning content

Generates quiz questions using an LLM

Serves quizzes via API

Adapts difficulty based on student performance

The system focuses on backend architecture, data modeling, and AI integration, which are the key evaluation criteria of the Peblo challenge.

System Architecture

The system follows a modular pipeline architecture designed for scalability and traceability.

PDF Input
   │
   ▼
Content Ingestion
(PDF Parser)
   │
   ▼
Text Chunking
(Content Segmentation)
   │
   ▼
Structured Storage
(SQLite Database)
   │
   ▼
LLM Quiz Generation
(Groq – Llama 3.1)
   │
   ▼
Quiz API
(Express Backend)
   │
   ▼
Student Interaction
(Answer Submission)
   │
   ▼
Adaptive Difficulty Engine

Each stage is modular and independently extensible.

Key Features
1. Content Ingestion

The system ingests educational PDFs representing learning materials across different grades and subjects.

Implemented capabilities:

PDF text extraction

Cleaning and decoding text

Content chunking for LLM processing

Metadata tagging (grade, subject, topic)

Example internal representation:

{
 "source_id": "peblo_pdf_grade1_math_numbers.pdf",
 "chunk_id": "peblo_pdf_grade1_math_numbers_CH_0",
 "grade": 1,
 "subject": "Math",
 "topic": "Numbers and Shapes",
 "text": "A triangle has three sides..."
}

This structured representation allows traceable question generation.

2. Structured Data Storage

The system stores processed content in a relational database.

Database: SQLite

Tables include:

Chunks

Stores segmented educational content.

Column	Description
id	unique chunk id
source_id	original PDF
chunk_id	unique chunk identifier
grade	grade level
subject	subject
topic	topic
text	chunked learning content
Questions

Stores generated quiz questions.

Column	Description
id	question id
chunk_id	originating chunk
source_chunk_id	traceability reference
question	generated question
type	MCQ / TrueFalse / FillBlank
options	answer choices
answer	correct answer
difficulty	easy / medium / hard

Traceability ensures each question maps back to its learning source.

Student Answers

Tracks learner responses.

Column	Description
student_id	student identifier
question_id	question answered
selected_answer	student response
correct	correctness flag
3. LLM-Based Quiz Generation

Quiz questions are generated using Groq's Llama-3.1 model.

The system sends educational chunks to the LLM with structured prompts.

Supported question types:

• Multiple Choice Questions (MCQ)
• True / False
• Fill in the Blank

Example generated question:

{
 "question": "How many sides does a triangle have?",
 "type": "MCQ",
 "options": ["2","3","4","5"],
 "answer": "3",
 "difficulty": "medium",
 "source_chunk_id": "peblo_pdf_grade1_math_numbers_CH_0"
}

To ensure system reliability, the backend includes fallback questions if the LLM response fails or returns invalid JSON.

4. Quiz Retrieval API

The system exposes REST endpoints to retrieve quiz questions.

Example request:

GET /quiz?source=peblo_pdf_grade1_math_numbers.pdf&difficulty=medium

The backend retrieves a question filtered by difficulty and source.

Randomization ensures diverse quiz experiences.

5. Student Answer Submission

Students submit answers via the API.

Example request:

POST /submit-answer

Example body:

{
 "student_id": "S001",
 "question_id": 12,
 "selected_answer": "3"
}

The backend:

Validates the answer

Stores the response

Returns correctness

6. Adaptive Difficulty Engine

The system adjusts quiz difficulty based on student performance.

Logic implemented:

Correct answer  → difficulty increases
Incorrect answer → difficulty decreases

Example progression:

easy → medium → hard
hard → medium → easy

This adaptive mechanism simulates personalized learning.

Technology Stack

Backend

• Node.js
• Express.js

Database

• SQLite

AI Integration

• Groq Llama-3.1 LLM

Frontend (demo interface)

• HTML
• Vanilla JavaScript

API Endpoints
Ingest PDF
GET /ingest?file=<pdf_file>

Extracts and stores content chunks.

Generate Quiz
GET /generate-quiz?source=<pdf_file>

Generates quiz questions from stored chunks.

Retrieve Question
GET /quiz?source=<pdf_file>&difficulty=<level>

Returns quiz question.

Submit Answer
POST /submit-answer

Evaluates student response and updates difficulty.

Setup Instructions
1. Clone the Repository
git clone https://github.com/<username>/peblo-ai-quiz-engine.git
cd peblo-ai-quiz-engine
2. Install Dependencies
npm install
3. Configure Environment Variables

Create .env file:

GROQ_API_KEY=your_groq_api_key
PORT=3000
4. Run the Server
node src/server.js

Server runs at:

http://localhost:3000
Demo Workflow

Select a subject (Math / Science / English)

Ingest PDF content

Generate quiz questions using LLM

Load a quiz question

Submit an answer

Observe adaptive difficulty adjustment

Design Considerations

Key design goals:

Traceability
Every generated question references its originating content chunk.

Robustness
Fallback question generation ensures system stability even if LLM responses fail.

Modularity
Services are separated into parser, chunking, LLM, and API layers.

Extensibility
The system can be extended with:

• embeddings for semantic retrieval
• duplicate question detection
• caching
• evaluation pipelines

Potential Improvements

Future enhancements could include:

• vector search for semantic chunk retrieval
• duplicate question detection using embeddings
• question quality evaluation
• adaptive learning models based on performance history
• support for additional educational formats
## System Architecture Diagram

        ┌────────────────────────┐
        │   Educational PDFs     │
        │ (Math, Science, English)│
        └───────────┬────────────┘
                    │
                    ▼
           ┌─────────────────┐
           │  PDF Parser     │
           │  (pdf2json)     │
           └────────┬────────┘
                    │
                    ▼
           ┌─────────────────┐
           │  Text Chunking  │
           │  (chunker.js)   │
           └────────┬────────┘
                    │
                    ▼
            ┌────────────────┐
            │  SQLite DB     │
            │  (chunks)      │
            └────────┬───────┘
                     │
                     ▼
             ┌──────────────────┐
             │ LLM Quiz Engine  │
             │ (Groq Llama 3.1) │
             └────────┬─────────┘
                      │
                      ▼
             ┌──────────────────┐
             │ Questions Table  │
             │  (traceability)  │
             └────────┬─────────┘
                      │
                      ▼
               ┌──────────────┐
               │   Quiz API   │
               │ (Express.js) │
               └──────┬───────┘
                      │
                      ▼
             ┌──────────────────┐
             │ Student Answers  │
             │ + Adaptive Logic │
             └──────────────────┘

This diagram shows the **entire AI pipeline clearly**.

---

# 2️⃣ Add Database Schema Diagram

Add this section near the bottom of README.

```markdown
## Database Schema

         ┌───────────────┐
         │     chunks     │
         ├───────────────┤
         │ id             │
         │ source_id      │
         │ chunk_id       │
         │ grade          │
         │ subject        │
         │ topic          │
         │ text           │
         └───────┬────────┘
                 │
                 │ source_chunk_id
                 ▼
         ┌───────────────┐
         │   questions    │
         ├───────────────┤
         │ id             │
         │ chunk_id       │
         │ source_chunk_id│
         │ question       │
         │ type           │
         │ options        │
         │ answer         │
         │ difficulty     │
         └───────┬────────┘
                 │
                 │ question_id
                 ▼
        ┌────────────────────┐
        │   student_answers   │
        ├────────────────────┤
        │ id                  │
        │ student_id          │
        │ question_id         │
        │ selected_answer     │
        │ correct             │
        └────────────────────┘

This shows:

- traceability
- data relationships
- clean schema design

Conclusion

This project demonstrates a modular backend system that transforms static educational content into dynamic assessments using AI.

It showcases:

• content ingestion pipelines
• structured data modeling
• LLM integration
• adaptive learning logic
• backend API design

The system reflects the architectural thinking required to build scalable AI-powered learning platforms like Peblo.
