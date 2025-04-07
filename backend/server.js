const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const OpenAI = require('openai');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// AI Analysis endpoint
app.post('/api/analyze', async (req, res) => {
  try {
    const { familyMembers } = req.body;

    // Create a table of all individuals
    const familyTable = familyMembers.map(member => `
      ID: ${member.id}
      Name: ${member.name}
      Sex: ${member.sex}
      Age at Diagnosis of 1st cancer: ${member.ageAtDiagnosis}
      Cancers: ${member.cancers}
      Genetics: ${member.genetics}
      Is Deceased: ${member.isDead ? 'Yes' : 'No'}
      Relationship: ${member.relationship}
    `).join('\n');

    const prompt = `
      You are an expert oncologist specializing in cancer genomics.
      You are presented with the following family pedigree.
      Look at the family pedigree and consider all cancers and genetics.
      Try to find any patterns or relationships between cancers and genetics.
      Think step by step.
      Please provide your suggestion to the proband and close relatives.
      Use plain text, do not include any markdown or html formatting or markdown code blocks.
      Do not include special characters (e.g. *).
      
      Structure your response as follows:
      
      Provide possible explanations for the pattern of cancers and genetics.  
      If you consider a specific cancer predisposition syndrome or mutation, provide the name of the syndrome or mutation and the specific genetic mutations associated with it.
      If the family has other cancers that are unlikely to be related to the proband's cancers, mention them and provide possible explanations for them.
      
      Proband:
      1. Genetic Testing: Specify the type of test (e.g., BRCA1, BRCA2) and the expected results.
      2. Genetic Counseling: Specify the type of counseling and the expected outcomes.
      3. If applicable, mention any specific genetic diseases and potential treatment options.

      Close Relatives:
      1. Genetic Testing: Recommend specific tests for close relatives.
      2. Genetic Counseling: Suggest counseling topics relevant to the family history.
      3. Discuss potential implications for other family members.

      Be concise and to the point. Tailor your recommendations based on the specific cancers and genetic information provided in the family pedigree.

      Family Pedigree:
      ${familyTable}
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o", // Using the latest GPT-4o model
      messages: [{"role": "user", "content": prompt}],
      temperature: 0.7,
    });

    res.json({ response: completion.choices[0].message.content });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Set port and start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});