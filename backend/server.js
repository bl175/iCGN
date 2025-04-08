const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');
require('dotenv').config();

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Simple test route
app.get('/', (req, res) => {
  res.send('API is running');
});

// Check if OpenAI API key is configured
app.get('/api/check-config', (req, res) => {
  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ error: 'OpenAI API key is not configured' });
  }
  res.json({ status: 'API key is configured' });
});

// Endpoint for AI analysis
app.post('/api/analyze', async (req, res) => {
  console.log('Received analysis request');
  try {
    const { familyMembers } = req.body;
    
    if (!familyMembers || !Array.isArray(familyMembers)) {
      return res.status(400).json({ error: 'Invalid request body. Expected familyMembers array.' });
    }
    
    // Convert family members to a simpler format for processing
    const simplifiedData = familyMembers.map(member => ({
      name: member.name || 'Unnamed',
      sex: member.sex || 'Unknown',
      ageAtDiagnosis: member.ageAtDiagnosis || 'Unknown',
      cancers: member.cancers || 'None',
      genetics: member.genetics || 'Unknown',
      isDead: member.isDead ? 'Yes' : 'No',
      relationship: member.relationship || 'Unknown'
    }));
    
    const prompt = `
      You are an expert oncologist analyzing a family pedigree for cancer risk assessment.
      Please analyze the following family members and provide insights on potential hereditary cancer risks and recommended genetic testing.
      
      ${JSON.stringify(simplifiedData, null, 2)}
      
      Provide a detailed analysis that includes:
      1. Potential hereditary cancer syndromes suggested by the family history
      2. Recommendations for genetic testing
      3. Surveillance recommendations based on the family history
    `;
    
    console.log('Calling OpenAI API for analysis');
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{"role": "user", "content": prompt}],
      temperature: 0.7,
    });
    
    console.log('Received OpenAI response for analysis');
    res.json({ response: completion.choices[0].message.content });
  } catch (error) {
    console.error('Error in /api/analyze:', error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint for generating medical note
app.post('/api/generate-medical-note', async (req, res) => {
    console.log('Received medical note generation request');
    try {
      const { familyMembers } = req.body;
      
      if (!familyMembers || !Array.isArray(familyMembers)) {
        return res.status(400).json({ error: 'Invalid request body. Expected familyMembers array.' });
      }
      
      // Find the proband
      const proband = familyMembers.find(m => m.relationship === 'proband');
      
      // Create a text representation of family members with appropriate relationships
      const familyMembersText = familyMembers.map(member => {
        // Define relationship more precisely based on member data
        let relationshipDescription = member.relationship;
        
        if (member.relationship === 'child') {
          // Find the parent(s) of this child
          const parent = familyMembers.find(m => m.id === member.parentId);
          const parentName = parent ? parent.name : 'unknown parent';
          relationshipDescription = `Child of ${parentName}`;
        } else if (member.relationship === 'parent') {
          // Find the child of this parent
          const child = familyMembers.find(m => m.parentId === member.id);
          const childName = child ? child.name : 'unknown child';
          relationshipDescription = `Parent of ${childName}`;
        } else if (member.relationship === 'unrelated_spouse' || member.relationship === 'related_spouse') {
          // Find the spouse
          const spouse = familyMembers.find(m => m.id === member.spouseId);
          const spouseName = spouse ? spouse.name : 'unknown spouse';
          relationshipDescription = `Spouse of ${spouseName}`;
        }
        
        // Format the text for each family member
        return `${relationshipDescription}: ${member.name || 'Unknown'}, ${member.sex || 'Unknown'} sex, ` +
          `${member.ageAtDiagnosis ? 'diagnosed at age ' + member.ageAtDiagnosis : 'age at diagnosis unknown'}, ` +
          `cancer diagnosis: ${member.cancers || 'None'}, ` +
          `genetics: ${member.genetics || 'Unknown'}, ` +
          `${member.isDead ? 'deceased' : 'living'}`;
      }).join('\n');
      
      // Generate the medical note using OpenAI
      const prompt = `
        You are an expert oncologist writing a medical note for a cancer genetic counseling session.
        Below is a text representation of a family pedigree for cancer risk assessment.
        
        IMPORTANT: The ages provided are AGES AT DIAGNOSIS, NOT current ages.
        
        # MEDICAL ONCOLOGY NOTE
        
        ## PATIENT INFORMATION
        Patient Name: ${proband?.name || 'Unknown'}
        Sex: ${proband?.sex || 'Unknown'}
        Age at diagnosis: ${proband?.ageAtDiagnosis || 'Unknown'}
        Cancer diagnosis: ${proband?.cancers || 'None'}
        
        ## FAMILY HISTORY
        ${familyMembersText}
        
        Format the family history as a paragraph that clearly states each family member's relationship to the proband, 
        their sex, cancer diagnosis with age at diagnosis (not current age), genetic status if known, and living status.
        
        For example: "The patient's father, John, was diagnosed with colon cancer at age 45, no known genetic mutations, deceased."
        
        Only include information about family members that is available in the text provided.
        Do not add any analysis, recommendations, or comments - just format the family history information.
      `;
      
      console.log('Calling OpenAI API for medical note');
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{"role": "user", "content": prompt}],
        temperature: 0.5, // Reduced temperature for more consistent formatting
      });
      
      console.log('Received OpenAI response for medical note');
      res.json({ medicalNote: completion.choices[0].message.content });
    } catch (error) {
      console.error('Error in /api/generate-medical-note:', error);
      res.status(500).json({ error: error.message });
    }
  });

// Set port and start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`OpenAI API key ${process.env.OPENAI_API_KEY ? 'is' : 'is NOT'} configured`);
});