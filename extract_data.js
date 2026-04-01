const fs = require('fs');

// Read the JS file
const content = fs.readFileSync('frontend/src/app/data/questions.js', 'utf8');

// The file uses 'export const'. We need to make it a module to require it, 
// or just strip the export keywords and eval it (carefully).
// Since I'm in a controlled environment, I'll just strip 'export' and eval.

// Strip trailing functions and evaluate to capture variables
let dataStr = content.split('export function')[0];
dataStr = dataStr.replace(/export const /g, '');
let QUESTIONS, CATEGORIES;
eval(dataStr);

const data = {
    categories: CATEGORIES,
    questions: QUESTIONS
};

fs.writeFileSync('backend/database/data/questions.json', JSON.stringify(data, null, 4));
console.log('Successfully extracted questions and categories to backend/database/data/questions.json');
