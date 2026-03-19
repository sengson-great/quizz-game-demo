export const CATEGORIES = [
    { id: 'science', name: 'Science', icon: '🔬', color: 'from-blue-500 to-cyan-400', description: 'Physics, chemistry, biology and more' },
    { id: 'history', name: 'History', icon: '📜', color: 'from-amber-500 to-orange-400', description: 'World events, civilizations & leaders' },
    { id: 'technology', name: 'Technology', icon: '💻', color: 'from-violet-500 to-purple-400', description: 'Programming, internet & innovation' },
    { id: 'geography', name: 'Geography', icon: '🌍', color: 'from-green-500 to-emerald-400', description: 'Countries, capitals & natural wonders' },
    { id: 'sports', name: 'Sports', icon: '⚽', color: 'from-red-500 to-rose-400', description: 'Teams, athletes & competitions' },
    { id: 'arts', name: 'Arts & Culture', icon: '🎨', color: 'from-pink-500 to-fuchsia-400', description: 'Music, painting, literature & film' },
];
export const QUESTIONS = [
    // ─── EASY ──────────────────────────────────────────────────────────────────
    // Science Easy
    {
        id: 'sci-e-1', categoryId: 'science', difficulty: 'Easy',
        text: 'What planet is closest to the Sun?',
        explanation: 'Mercury is the innermost planet in our Solar System.',
        answers: [
            { id: 'a', text: 'Venus', isCorrect: false },
            { id: 'b', text: 'Mercury', isCorrect: true },
            { id: 'c', text: 'Mars', isCorrect: false },
            { id: 'd', text: 'Earth', isCorrect: false },
        ],
    },
    {
        id: 'sci-e-2', categoryId: 'science', difficulty: 'Easy',
        text: 'What gas do humans need to breathe to survive?',
        explanation: 'Humans need oxygen (O₂) to cellular respiration.',
        answers: [
            { id: 'a', text: 'Carbon Dioxide', isCorrect: false },
            { id: 'b', text: 'Nitrogen', isCorrect: false },
            { id: 'c', text: 'Oxygen', isCorrect: true },
            { id: 'd', text: 'Hydrogen', isCorrect: false },
        ],
    },
    {
        id: 'sci-e-3', categoryId: 'science', difficulty: 'Easy',
        text: 'What is the chemical formula for water?',
        explanation: 'Water consists of two hydrogen atoms bonded to one oxygen atom.',
        answers: [
            { id: 'a', text: 'CO₂', isCorrect: false },
            { id: 'b', text: 'NaCl', isCorrect: false },
            { id: 'c', text: 'H₂O₂', isCorrect: false },
            { id: 'd', text: 'H₂O', isCorrect: true },
        ],
    },
    {
        id: 'sci-e-4', categoryId: 'science', difficulty: 'Easy',
        text: 'How many bones are in the adult human body?',
        explanation: 'Adults have 206 bones; babies are born with around 270–300.',
        answers: [
            { id: 'a', text: '206', isCorrect: true },
            { id: 'b', text: '180', isCorrect: false },
            { id: 'c', text: '250', isCorrect: false },
            { id: 'd', text: '320', isCorrect: false },
        ],
    },
    {
        id: 'sci-e-5', categoryId: 'science', difficulty: 'Easy',
        text: 'What is the closest star to Earth?',
        explanation: 'The Sun is our nearest star, about 150 million km away.',
        answers: [
            { id: 'a', text: 'Sirius', isCorrect: false },
            { id: 'b', text: 'Proxima Centauri', isCorrect: false },
            { id: 'c', text: 'The Sun', isCorrect: true },
            { id: 'd', text: 'Betelgeuse', isCorrect: false },
        ],
    },
    // History Easy
    {
        id: 'his-e-1', categoryId: 'history', difficulty: 'Easy',
        text: 'In which year did World War II end?',
        explanation: 'WWII ended in 1945 — V-E Day (May 8) and V-J Day (September 2).',
        answers: [
            { id: 'a', text: '1943', isCorrect: false },
            { id: 'b', text: '1945', isCorrect: true },
            { id: 'c', text: '1947', isCorrect: false },
            { id: 'd', text: '1941', isCorrect: false },
        ],
    },
    {
        id: 'his-e-2', categoryId: 'history', difficulty: 'Easy',
        text: 'Who was the first President of the United States?',
        explanation: 'George Washington served as the 1st US President from 1789 to 1797.',
        answers: [
            { id: 'a', text: 'Abraham Lincoln', isCorrect: false },
            { id: 'b', text: 'Thomas Jefferson', isCorrect: false },
            { id: 'c', text: 'Benjamin Franklin', isCorrect: false },
            { id: 'd', text: 'George Washington', isCorrect: true },
        ],
    },
    {
        id: 'his-e-3', categoryId: 'history', difficulty: 'Easy',
        text: 'In which year did the Berlin Wall fall?',
        explanation: 'The Berlin Wall fell on November 9, 1989, symbolising the end of the Cold War.',
        answers: [
            { id: 'a', text: '1987', isCorrect: false },
            { id: 'b', text: '1991', isCorrect: false },
            { id: 'c', text: '1989', isCorrect: true },
            { id: 'd', text: '1985', isCorrect: false },
        ],
    },
    {
        id: 'his-e-4', categoryId: 'history', difficulty: 'Easy',
        text: 'Which ancient wonder was located in Alexandria, Egypt?',
        explanation: 'The Lighthouse of Alexandria was one of the Seven Wonders of the Ancient World.',
        answers: [
            { id: 'a', text: 'The Colossus', isCorrect: false },
            { id: 'b', text: 'The Sphinx', isCorrect: false },
            { id: 'c', text: 'The Lighthouse of Alexandria', isCorrect: true },
            { id: 'd', text: 'The Hanging Gardens', isCorrect: false },
        ],
    },
    {
        id: 'his-e-5', categoryId: 'history', difficulty: 'Easy',
        text: 'Who was known as the "Maid of Orléans"?',
        explanation: 'Joan of Arc led the French army to victory during the Hundred Years\' War.',
        answers: [
            { id: 'a', text: 'Marie Antoinette', isCorrect: false },
            { id: 'b', text: 'Joan of Arc', isCorrect: true },
            { id: 'c', text: 'Catherine the Great', isCorrect: false },
            { id: 'd', text: 'Eleanor of Aquitaine', isCorrect: false },
        ],
    },
    // Technology Easy
    {
        id: 'tec-e-1', categoryId: 'technology', difficulty: 'Easy',
        text: 'What does "HTML" stand for?',
        explanation: 'HTML stands for HyperText Markup Language, the backbone of every webpage.',
        answers: [
            { id: 'a', text: 'High-Tech Markup Language', isCorrect: false },
            { id: 'b', text: 'HyperText Markup Language', isCorrect: true },
            { id: 'c', text: 'HyperTransfer Markup Listing', isCorrect: false },
            { id: 'd', text: 'Hyper Terminal Meta Language', isCorrect: false },
        ],
    },
    {
        id: 'tec-e-2', categoryId: 'technology', difficulty: 'Easy',
        text: 'Which company created the iPhone?',
        explanation: 'Apple Inc. unveiled the first iPhone on January 9, 2007.',
        answers: [
            { id: 'a', text: 'Samsung', isCorrect: false },
            { id: 'b', text: 'Nokia', isCorrect: false },
            { id: 'c', text: 'Google', isCorrect: false },
            { id: 'd', text: 'Apple', isCorrect: true },
        ],
    },
    {
        id: 'tec-e-3', categoryId: 'technology', difficulty: 'Easy',
        text: 'What does "CPU" stand for?',
        explanation: 'CPU stands for Central Processing Unit — the brain of a computer.',
        answers: [
            { id: 'a', text: 'Core Processing Utility', isCorrect: false },
            { id: 'b', text: 'Central Processing Unit', isCorrect: true },
            { id: 'c', text: 'Computer Power Unit', isCorrect: false },
            { id: 'd', text: 'Central Programming Unit', isCorrect: false },
        ],
    },
    {
        id: 'tec-e-4', categoryId: 'technology', difficulty: 'Easy',
        text: 'What does "URL" stand for?',
        explanation: 'URL stands for Uniform Resource Locator — the address of a web page.',
        answers: [
            { id: 'a', text: 'Universal Request Link', isCorrect: false },
            { id: 'b', text: 'Unified Resource Listing', isCorrect: false },
            { id: 'c', text: 'Uniform Resource Locator', isCorrect: true },
            { id: 'd', text: 'Universal Remote Loader', isCorrect: false },
        ],
    },
    {
        id: 'tec-e-5', categoryId: 'technology', difficulty: 'Easy',
        text: 'Which programming language is primarily used for styling web pages?',
        explanation: 'CSS (Cascading Style Sheets) controls the visual presentation of HTML documents.',
        answers: [
            { id: 'a', text: 'JavaScript', isCorrect: false },
            { id: 'b', text: 'Python', isCorrect: false },
            { id: 'c', text: 'CSS', isCorrect: true },
            { id: 'd', text: 'SQL', isCorrect: false },
        ],
    },
    // Geography Easy
    {
        id: 'geo-e-1', categoryId: 'geography', difficulty: 'Easy',
        text: 'What is the capital city of France?',
        explanation: 'Paris has been the capital of France since the 10th century.',
        answers: [
            { id: 'a', text: 'Lyon', isCorrect: false },
            { id: 'b', text: 'Marseille', isCorrect: false },
            { id: 'c', text: 'Paris', isCorrect: true },
            { id: 'd', text: 'Nice', isCorrect: false },
        ],
    },
    {
        id: 'geo-e-2', categoryId: 'geography', difficulty: 'Easy',
        text: 'What is the largest continent by area?',
        explanation: 'Asia covers approximately 44.6 million km² — about 30% of Earth\'s land area.',
        answers: [
            { id: 'a', text: 'Africa', isCorrect: false },
            { id: 'b', text: 'North America', isCorrect: false },
            { id: 'c', text: 'Asia', isCorrect: true },
            { id: 'd', text: 'Europe', isCorrect: false },
        ],
    },
    {
        id: 'geo-e-3', categoryId: 'geography', difficulty: 'Easy',
        text: 'How many continents are on Earth?',
        explanation: 'The seven continents are Africa, Antarctica, Asia, Australia, Europe, North America, and South America.',
        answers: [
            { id: 'a', text: '5', isCorrect: false },
            { id: 'b', text: '6', isCorrect: false },
            { id: 'c', text: '7', isCorrect: true },
            { id: 'd', text: '8', isCorrect: false },
        ],
    },
    {
        id: 'geo-e-4', categoryId: 'geography', difficulty: 'Easy',
        text: 'Which ocean is the largest on Earth?',
        explanation: 'The Pacific Ocean covers more than 165 million km², about 46% of Earth\'s water surface.',
        answers: [
            { id: 'a', text: 'Atlantic Ocean', isCorrect: false },
            { id: 'b', text: 'Indian Ocean', isCorrect: false },
            { id: 'c', text: 'Pacific Ocean', isCorrect: true },
            { id: 'd', text: 'Arctic Ocean', isCorrect: false },
        ],
    },
    {
        id: 'geo-e-5', categoryId: 'geography', difficulty: 'Easy',
        text: 'Which country has the most population in the world?',
        explanation: 'India surpassed China in 2023 to become the world\'s most populous country.',
        answers: [
            { id: 'a', text: 'China', isCorrect: false },
            { id: 'b', text: 'USA', isCorrect: false },
            { id: 'c', text: 'India', isCorrect: true },
            { id: 'd', text: 'Russia', isCorrect: false },
        ],
    },
    // Sports Easy
    {
        id: 'spo-e-1', categoryId: 'sports', difficulty: 'Easy',
        text: 'How many players are on a soccer/football team on the field?',
        explanation: 'Each soccer team fields 11 players including the goalkeeper.',
        answers: [
            { id: 'a', text: '9', isCorrect: false },
            { id: 'b', text: '11', isCorrect: true },
            { id: 'c', text: '12', isCorrect: false },
            { id: 'd', text: '10', isCorrect: false },
        ],
    },
    {
        id: 'spo-e-2', categoryId: 'sports', difficulty: 'Easy',
        text: 'How many rings are on the Olympic flag?',
        explanation: 'The 5 interlocked rings represent the five continents of the world.',
        answers: [
            { id: 'a', text: '4', isCorrect: false },
            { id: 'b', text: '6', isCorrect: false },
            { id: 'c', text: '5', isCorrect: true },
            { id: 'd', text: '3', isCorrect: false },
        ],
    },
    {
        id: 'spo-e-3', categoryId: 'sports', difficulty: 'Easy',
        text: 'In which sport do players try to hit a ball into a hole?',
        explanation: 'Golf is played on a course with the objective of hitting a ball into a series of holes.',
        answers: [
            { id: 'a', text: 'Cricket', isCorrect: false },
            { id: 'b', text: 'Tennis', isCorrect: false },
            { id: 'c', text: 'Golf', isCorrect: true },
            { id: 'd', text: 'Baseball', isCorrect: false },
        ],
    },
    {
        id: 'spo-e-4', categoryId: 'sports', difficulty: 'Easy',
        text: 'How many points does a touchdown score in American football?',
        explanation: 'A touchdown scores 6 points, plus an opportunity for an extra point.',
        answers: [
            { id: 'a', text: '3', isCorrect: false },
            { id: 'b', text: '7', isCorrect: false },
            { id: 'c', text: '6', isCorrect: true },
            { id: 'd', text: '4', isCorrect: false },
        ],
    },
    {
        id: 'spo-e-5', categoryId: 'sports', difficulty: 'Easy',
        text: 'Which country invented the sport of basketball?',
        explanation: 'Basketball was invented by Canadian-American Dr. James Naismith in 1891 in the USA.',
        answers: [
            { id: 'a', text: 'Canada', isCorrect: false },
            { id: 'b', text: 'United States', isCorrect: true },
            { id: 'c', text: 'United Kingdom', isCorrect: false },
            { id: 'd', text: 'Brazil', isCorrect: false },
        ],
    },
    // Arts Easy
    {
        id: 'art-e-1', categoryId: 'arts', difficulty: 'Easy',
        text: 'Who painted the Mona Lisa?',
        explanation: 'Leonardo da Vinci painted the Mona Lisa between c.1503 and c.1519.',
        answers: [
            { id: 'a', text: 'Michelangelo', isCorrect: false },
            { id: 'b', text: 'Pablo Picasso', isCorrect: false },
            { id: 'c', text: 'Rembrandt', isCorrect: false },
            { id: 'd', text: 'Leonardo da Vinci', isCorrect: true },
        ],
    },
    {
        id: 'art-e-2', categoryId: 'arts', difficulty: 'Easy',
        text: 'Which instrument has 88 keys?',
        explanation: 'A standard piano has 52 white keys and 36 black keys totalling 88.',
        answers: [
            { id: 'a', text: 'Organ', isCorrect: false },
            { id: 'b', text: 'Piano', isCorrect: true },
            { id: 'c', text: 'Harpsichord', isCorrect: false },
            { id: 'd', text: 'Accordion', isCorrect: false },
        ],
    },
    {
        id: 'art-e-3', categoryId: 'arts', difficulty: 'Easy',
        text: 'Who wrote the play "Romeo and Juliet"?',
        explanation: 'William Shakespeare wrote Romeo and Juliet around 1594–1596.',
        answers: [
            { id: 'a', text: 'Charles Dickens', isCorrect: false },
            { id: 'b', text: 'Homer', isCorrect: false },
            { id: 'c', text: 'William Shakespeare', isCorrect: true },
            { id: 'd', text: 'Jane Austen', isCorrect: false },
        ],
    },
    {
        id: 'art-e-4', categoryId: 'arts', difficulty: 'Easy',
        text: 'How many colors are in a rainbow?',
        explanation: 'The traditional rainbow has 7 colors: red, orange, yellow, green, blue, indigo, violet.',
        answers: [
            { id: 'a', text: '6', isCorrect: false },
            { id: 'b', text: '5', isCorrect: false },
            { id: 'c', text: '8', isCorrect: false },
            { id: 'd', text: '7', isCorrect: true },
        ],
    },
    {
        id: 'art-e-5', categoryId: 'arts', difficulty: 'Easy',
        text: 'What genre of music is associated with the artist Elvis Presley?',
        explanation: 'Elvis Presley, the "King of Rock and Roll", popularized rock and roll music in the 1950s.',
        answers: [
            { id: 'a', text: 'Jazz', isCorrect: false },
            { id: 'b', text: 'Country', isCorrect: false },
            { id: 'c', text: 'Rock and Roll', isCorrect: true },
            { id: 'd', text: 'Blues', isCorrect: false },
        ],
    },
    // ─── MEDIUM ────────────────────────────────────────────────────────────────
    // Science Medium
    {
        id: 'sci-m-1', categoryId: 'science', difficulty: 'Medium',
        text: 'What is the chemical symbol for Gold?',
        explanation: 'Gold\'s symbol Au comes from the Latin word "Aurum".',
        answers: [
            { id: 'a', text: 'Go', isCorrect: false },
            { id: 'b', text: 'Gd', isCorrect: false },
            { id: 'c', text: 'Au', isCorrect: true },
            { id: 'd', text: 'Ag', isCorrect: false },
        ],
    },
    {
        id: 'sci-m-2', categoryId: 'science', difficulty: 'Medium',
        text: 'What is the atomic number of Carbon?',
        explanation: 'Carbon has 6 protons in its nucleus, giving it atomic number 6.',
        answers: [
            { id: 'a', text: '8', isCorrect: false },
            { id: 'b', text: '6', isCorrect: true },
            { id: 'c', text: '4', isCorrect: false },
            { id: 'd', text: '12', isCorrect: false },
        ],
    },
    {
        id: 'sci-m-3', categoryId: 'science', difficulty: 'Medium',
        text: 'Approximately how fast does light travel in a vacuum (km/s)?',
        explanation: 'Light travels at approximately 299,792 km/s in a vacuum.',
        answers: [
            { id: 'a', text: '150,000 km/s', isCorrect: false },
            { id: 'b', text: '300,000 km/s', isCorrect: true },
            { id: 'c', text: '500,000 km/s', isCorrect: false },
            { id: 'd', text: '1,000,000 km/s', isCorrect: false },
        ],
    },
    {
        id: 'sci-m-4', categoryId: 'science', difficulty: 'Medium',
        text: 'What planet has the most confirmed moons in our Solar System?',
        explanation: 'Saturn has 146 confirmed moons as of 2023, surpassing Jupiter.',
        answers: [
            { id: 'a', text: 'Jupiter', isCorrect: false },
            { id: 'b', text: 'Uranus', isCorrect: false },
            { id: 'c', text: 'Neptune', isCorrect: false },
            { id: 'd', text: 'Saturn', isCorrect: true },
        ],
    },
    {
        id: 'sci-m-5', categoryId: 'science', difficulty: 'Medium',
        text: 'What force keeps planets in orbit around the Sun?',
        explanation: 'Gravity is the attractive force that governs the motion of celestial bodies.',
        answers: [
            { id: 'a', text: 'Magnetism', isCorrect: false },
            { id: 'b', text: 'Electromagnetism', isCorrect: false },
            { id: 'c', text: 'Gravity', isCorrect: true },
            { id: 'd', text: 'Nuclear Force', isCorrect: false },
        ],
    },
    // History Medium
    {
        id: 'his-m-1', categoryId: 'history', difficulty: 'Medium',
        text: 'In which year did the French Revolution begin?',
        explanation: 'The French Revolution began in 1789 with the storming of the Bastille on July 14.',
        answers: [
            { id: 'a', text: '1776', isCorrect: false },
            { id: 'b', text: '1789', isCorrect: true },
            { id: 'c', text: '1804', isCorrect: false },
            { id: 'd', text: '1799', isCorrect: false },
        ],
    },
    {
        id: 'his-m-2', categoryId: 'history', difficulty: 'Medium',
        text: 'Who wrote the political treatise "The Prince" (Il Principe)?',
        explanation: 'Niccolò Machiavelli wrote "The Prince" around 1513, offering advice to rulers.',
        answers: [
            { id: 'a', text: 'Voltaire', isCorrect: false },
            { id: 'b', text: 'Thomas Hobbes', isCorrect: false },
            { id: 'c', text: 'Niccolò Machiavelli', isCorrect: true },
            { id: 'd', text: 'John Locke', isCorrect: false },
        ],
    },
    {
        id: 'his-m-3', categoryId: 'history', difficulty: 'Medium',
        text: 'Which empire was ruled by Genghis Khan?',
        explanation: 'Genghis Khan founded and ruled the Mongol Empire, the largest contiguous empire in history.',
        answers: [
            { id: 'a', text: 'Ottoman Empire', isCorrect: false },
            { id: 'b', text: 'Roman Empire', isCorrect: false },
            { id: 'c', text: 'Mongol Empire', isCorrect: true },
            { id: 'd', text: 'Persian Empire', isCorrect: false },
        ],
    },
    {
        id: 'his-m-4', categoryId: 'history', difficulty: 'Medium',
        text: 'Who was the Soviet Union leader during WWII?',
        explanation: 'Joseph Stalin led the Soviet Union from 1924 until his death in 1953.',
        answers: [
            { id: 'a', text: 'Lenin', isCorrect: false },
            { id: 'b', text: 'Khrushchev', isCorrect: false },
            { id: 'c', text: 'Trotsky', isCorrect: false },
            { id: 'd', text: 'Stalin', isCorrect: true },
        ],
    },
    {
        id: 'his-m-5', categoryId: 'history', difficulty: 'Medium',
        text: 'Which country was the first to grant women the right to vote nationally?',
        explanation: 'New Zealand granted women the right to vote in 1893.',
        answers: [
            { id: 'a', text: 'Australia', isCorrect: false },
            { id: 'b', text: 'New Zealand', isCorrect: true },
            { id: 'c', text: 'United States', isCorrect: false },
            { id: 'd', text: 'Finland', isCorrect: false },
        ],
    },
    // Technology Medium
    {
        id: 'tec-m-1', categoryId: 'technology', difficulty: 'Medium',
        text: 'Who is credited with inventing the World Wide Web?',
        explanation: 'Tim Berners-Lee invented the WWW in 1989 while working at CERN.',
        answers: [
            { id: 'a', text: 'Bill Gates', isCorrect: false },
            { id: 'b', text: 'Linus Torvalds', isCorrect: false },
            { id: 'c', text: 'Tim Berners-Lee', isCorrect: true },
            { id: 'd', text: 'Steve Jobs', isCorrect: false },
        ],
    },
    {
        id: 'tec-m-2', categoryId: 'technology', difficulty: 'Medium',
        text: 'What does "HTTP" stand for?',
        explanation: 'HTTP stands for HyperText Transfer Protocol, the foundation of data communication on the web.',
        answers: [
            { id: 'a', text: 'High-Tech Transfer Protocol', isCorrect: false },
            { id: 'b', text: 'HyperText Transfer Protocol', isCorrect: true },
            { id: 'c', text: 'HyperText Transmission Program', isCorrect: false },
            { id: 'd', text: 'Host Transfer Tracking Protocol', isCorrect: false },
        ],
    },
    {
        id: 'tec-m-3', categoryId: 'technology', difficulty: 'Medium',
        text: 'Which programming language runs natively in web browsers?',
        explanation: 'JavaScript is the only programming language executed natively by web browsers.',
        answers: [
            { id: 'a', text: 'Python', isCorrect: false },
            { id: 'b', text: 'Ruby', isCorrect: false },
            { id: 'c', text: 'Java', isCorrect: false },
            { id: 'd', text: 'JavaScript', isCorrect: true },
        ],
    },
    {
        id: 'tec-m-4', categoryId: 'technology', difficulty: 'Medium',
        text: 'What does "RAM" stand for in computing?',
        explanation: 'RAM stands for Random Access Memory, the short-term memory of a computer.',
        answers: [
            { id: 'a', text: 'Read and Memory', isCorrect: false },
            { id: 'b', text: 'Random Access Memory', isCorrect: true },
            { id: 'c', text: 'Rapid Application Module', isCorrect: false },
            { id: 'd', text: 'Random Application Memory', isCorrect: false },
        ],
    },
    {
        id: 'tec-m-5', categoryId: 'technology', difficulty: 'Medium',
        text: 'Which company developed the Android operating system?',
        explanation: 'Android was developed by Android Inc., which was acquired by Google in 2005.',
        answers: [
            { id: 'a', text: 'Microsoft', isCorrect: false },
            { id: 'b', text: 'Samsung', isCorrect: false },
            { id: 'c', text: 'Google', isCorrect: true },
            { id: 'd', text: 'Apple', isCorrect: false },
        ],
    },
    // Geography Medium
    {
        id: 'geo-m-1', categoryId: 'geography', difficulty: 'Medium',
        text: 'What is the longest river in the world?',
        explanation: 'The Nile River in Africa stretches approximately 6,650 km.',
        answers: [
            { id: 'a', text: 'Amazon', isCorrect: false },
            { id: 'b', text: 'Mississippi', isCorrect: false },
            { id: 'c', text: 'Nile', isCorrect: true },
            { id: 'd', text: 'Yangtze', isCorrect: false },
        ],
    },
    {
        id: 'geo-m-2', categoryId: 'geography', difficulty: 'Medium',
        text: 'What country has the most natural lakes in the world?',
        explanation: 'Canada has more than 60% of the world\'s natural lakes.',
        answers: [
            { id: 'a', text: 'Russia', isCorrect: false },
            { id: 'b', text: 'United States', isCorrect: false },
            { id: 'c', text: 'Canada', isCorrect: true },
            { id: 'd', text: 'Finland', isCorrect: false },
        ],
    },
    {
        id: 'geo-m-3', categoryId: 'geography', difficulty: 'Medium',
        text: 'What is the tallest mountain in Africa?',
        explanation: 'Mount Kilimanjaro in Tanzania stands at 5,895 metres.',
        answers: [
            { id: 'a', text: 'Mount Kenya', isCorrect: false },
            { id: 'b', text: 'Mount Atlas', isCorrect: false },
            { id: 'c', text: 'Mount Kilimanjaro', isCorrect: true },
            { id: 'd', text: 'Ras Dashen', isCorrect: false },
        ],
    },
    {
        id: 'geo-m-4', categoryId: 'geography', difficulty: 'Medium',
        text: 'Which country has the most time zones?',
        explanation: 'France has 12 time zones when including its overseas territories.',
        answers: [
            { id: 'a', text: 'Russia', isCorrect: false },
            { id: 'b', text: 'USA', isCorrect: false },
            { id: 'c', text: 'France', isCorrect: true },
            { id: 'd', text: 'China', isCorrect: false },
        ],
    },
    {
        id: 'geo-m-5', categoryId: 'geography', difficulty: 'Medium',
        text: 'What is the capital city of Australia?',
        explanation: 'Canberra became Australia\'s capital in 1927, chosen as a compromise between Sydney and Melbourne.',
        answers: [
            { id: 'a', text: 'Sydney', isCorrect: false },
            { id: 'b', text: 'Melbourne', isCorrect: false },
            { id: 'c', text: 'Brisbane', isCorrect: false },
            { id: 'd', text: 'Canberra', isCorrect: true },
        ],
    },
    // Sports Medium
    {
        id: 'spo-m-1', categoryId: 'sports', difficulty: 'Medium',
        text: 'Which country won the first FIFA World Cup in 1930?',
        explanation: 'Uruguay hosted and won the inaugural FIFA World Cup in 1930.',
        answers: [
            { id: 'a', text: 'Brazil', isCorrect: false },
            { id: 'b', text: 'Argentina', isCorrect: false },
            { id: 'c', text: 'Uruguay', isCorrect: true },
            { id: 'd', text: 'Italy', isCorrect: false },
        ],
    },
    {
        id: 'spo-m-2', categoryId: 'sports', difficulty: 'Medium',
        text: 'How long is an Olympic marathon (in km)?',
        explanation: 'The marathon distance is exactly 42.195 km (26 miles 385 yards).',
        answers: [
            { id: 'a', text: '40 km', isCorrect: false },
            { id: 'b', text: '42.195 km', isCorrect: true },
            { id: 'c', text: '45 km', isCorrect: false },
            { id: 'd', text: '38.5 km', isCorrect: false },
        ],
    },
    {
        id: 'spo-m-3', categoryId: 'sports', difficulty: 'Medium',
        text: 'In basketball, how many points is a shot beyond the three-point arc worth?',
        explanation: 'A field goal made from beyond the three-point line scores 3 points.',
        answers: [
            { id: 'a', text: '2', isCorrect: false },
            { id: 'b', text: '4', isCorrect: false },
            { id: 'c', text: '3', isCorrect: true },
            { id: 'd', text: '1', isCorrect: false },
        ],
    },
    {
        id: 'spo-m-4', categoryId: 'sports', difficulty: 'Medium',
        text: 'Which country has won the most FIFA World Cup titles?',
        explanation: 'Brazil has won the FIFA World Cup five times (1958, 1962, 1970, 1994, 2002).',
        answers: [
            { id: 'a', text: 'Germany', isCorrect: false },
            { id: 'b', text: 'Italy', isCorrect: false },
            { id: 'c', text: 'Brazil', isCorrect: true },
            { id: 'd', text: 'Argentina', isCorrect: false },
        ],
    },
    {
        id: 'spo-m-5', categoryId: 'sports', difficulty: 'Medium',
        text: 'In tennis, what is the term for a score of 40-40?',
        explanation: 'When both players reach 40 points, the score is called "Deuce."',
        answers: [
            { id: 'a', text: 'Tie', isCorrect: false },
            { id: 'b', text: 'Advantage', isCorrect: false },
            { id: 'c', text: 'Deuce', isCorrect: true },
            { id: 'd', text: 'Tiebreak', isCorrect: false },
        ],
    },
    // Arts Medium
    {
        id: 'art-m-1', categoryId: 'arts', difficulty: 'Medium',
        text: 'Who composed "The Four Seasons"?',
        explanation: 'Antonio Vivaldi composed "The Four Seasons" around 1720–1721.',
        answers: [
            { id: 'a', text: 'Johann Sebastian Bach', isCorrect: false },
            { id: 'b', text: 'Wolfgang Amadeus Mozart', isCorrect: false },
            { id: 'c', text: 'Antonio Vivaldi', isCorrect: true },
            { id: 'd', text: 'Ludwig van Beethoven', isCorrect: false },
        ],
    },
    {
        id: 'art-m-2', categoryId: 'arts', difficulty: 'Medium',
        text: 'Which artist painted "The Starry Night"?',
        explanation: 'Vincent van Gogh painted "The Starry Night" in June 1889.',
        answers: [
            { id: 'a', text: 'Paul Gauguin', isCorrect: false },
            { id: 'b', text: 'Claude Monet', isCorrect: false },
            { id: 'c', text: 'Vincent van Gogh', isCorrect: true },
            { id: 'd', text: 'Édouard Manet', isCorrect: false },
        ],
    },
    {
        id: 'art-m-3', categoryId: 'arts', difficulty: 'Medium',
        text: 'In which year was the Sistine Chapel ceiling completed by Michelangelo?',
        explanation: 'Michelangelo completed the Sistine Chapel ceiling in 1512.',
        answers: [
            { id: 'a', text: '1480', isCorrect: false },
            { id: 'b', text: '1512', isCorrect: true },
            { id: 'c', text: '1550', isCorrect: false },
            { id: 'd', text: '1498', isCorrect: false },
        ],
    },
    {
        id: 'art-m-4', categoryId: 'arts', difficulty: 'Medium',
        text: 'Which literary character lives at 221B Baker Street?',
        explanation: 'Sherlock Holmes, created by Arthur Conan Doyle, resides at 221B Baker Street.',
        answers: [
            { id: 'a', text: 'Hercule Poirot', isCorrect: false },
            { id: 'b', text: 'Sherlock Holmes', isCorrect: true },
            { id: 'c', text: 'Philip Marlowe', isCorrect: false },
            { id: 'd', text: 'James Bond', isCorrect: false },
        ],
    },
    {
        id: 'art-m-5', categoryId: 'arts', difficulty: 'Medium',
        text: 'Who directed the film "Schindler\'s List" (1993)?',
        explanation: 'Steven Spielberg directed "Schindler\'s List," which won 7 Academy Awards.',
        answers: [
            { id: 'a', text: 'Martin Scorsese', isCorrect: false },
            { id: 'b', text: 'Francis Ford Coppola', isCorrect: false },
            { id: 'c', text: 'Steven Spielberg', isCorrect: true },
            { id: 'd', text: 'Stanley Kubrick', isCorrect: false },
        ],
    },
    // ─── HARD ──────────────────────────────────────────────────────────────────
    // Science Hard
    {
        id: 'sci-h-1', categoryId: 'science', difficulty: 'Hard',
        text: 'What particle was discovered at CERN\'s Large Hadron Collider in 2012?',
        explanation: 'The Higgs boson was discovered on July 4, 2012, confirming the Standard Model.',
        answers: [
            { id: 'a', text: 'Graviton', isCorrect: false },
            { id: 'b', text: 'Tachyon', isCorrect: false },
            { id: 'c', text: 'Higgs boson', isCorrect: true },
            { id: 'd', text: 'Axion', isCorrect: false },
        ],
    },
    {
        id: 'sci-h-2', categoryId: 'science', difficulty: 'Hard',
        text: 'What is the approximate half-life of Carbon-14?',
        explanation: 'Carbon-14 has a half-life of approximately 5,730 years, used in radiocarbon dating.',
        answers: [
            { id: 'a', text: '1,000 years', isCorrect: false },
            { id: 'b', text: '10,000 years', isCorrect: false },
            { id: 'c', text: '5,730 years', isCorrect: true },
            { id: 'd', text: '50,000 years', isCorrect: false },
        ],
    },
    {
        id: 'sci-h-3', categoryId: 'science', difficulty: 'Hard',
        text: 'The Chandrasekhar limit defines the maximum mass of a stable white dwarf. What is it approximately?',
        explanation: 'Subrahmanyan Chandrasekhar showed that a white dwarf cannot exceed ~1.4 solar masses without collapsing.',
        answers: [
            { id: 'a', text: '0.8 solar masses', isCorrect: false },
            { id: 'b', text: '1.4 solar masses', isCorrect: true },
            { id: 'c', text: '3.0 solar masses', isCorrect: false },
            { id: 'd', text: '2.2 solar masses', isCorrect: false },
        ],
    },
    {
        id: 'sci-h-4', categoryId: 'science', difficulty: 'Hard',
        text: 'Which element has the highest melting point of all known elements?',
        explanation: 'Tungsten (W) has the highest melting point of any metal at 3,422°C.',
        answers: [
            { id: 'a', text: 'Carbon', isCorrect: false },
            { id: 'b', text: 'Osmium', isCorrect: false },
            { id: 'c', text: 'Tungsten', isCorrect: true },
            { id: 'd', text: 'Iridium', isCorrect: false },
        ],
    },
    {
        id: 'sci-h-5', categoryId: 'science', difficulty: 'Hard',
        text: 'What is the name of the quantum mechanical effect where particles tunnel through energy barriers?',
        explanation: 'Quantum tunneling allows particles to penetrate barriers they classically shouldn\'t be able to pass.',
        answers: [
            { id: 'a', text: 'Quantum entanglement', isCorrect: false },
            { id: 'b', text: 'Quantum tunneling', isCorrect: true },
            { id: 'c', text: 'Quantum superposition', isCorrect: false },
            { id: 'd', text: 'Quantum decoherence', isCorrect: false },
        ],
    },
    // History Hard
    {
        id: 'his-h-1', categoryId: 'history', difficulty: 'Hard',
        text: 'What was the code name for the Allied invasion of Normandy on D-Day?',
        explanation: 'Operation Overlord was the code name for the Battle of Normandy, launched on June 6, 1944.',
        answers: [
            { id: 'a', text: 'Operation Neptune', isCorrect: false },
            { id: 'b', text: 'Operation Barbarossa', isCorrect: false },
            { id: 'c', text: 'Operation Overlord', isCorrect: true },
            { id: 'd', text: 'Operation Market Garden', isCorrect: false },
        ],
    },
    {
        id: 'his-h-2', categoryId: 'history', difficulty: 'Hard',
        text: 'Who was the last ruling Pharaoh of Ancient Egypt?',
        explanation: 'Cleopatra VII was the last active ruler of the Ptolemaic Kingdom of Egypt, dying in 30 BC.',
        answers: [
            { id: 'a', text: 'Nefertiti', isCorrect: false },
            { id: 'b', text: 'Hatshepsut', isCorrect: false },
            { id: 'c', text: 'Cleopatra VII', isCorrect: true },
            { id: 'd', text: 'Ramesses II', isCorrect: false },
        ],
    },
    {
        id: 'his-h-3', categoryId: 'history', difficulty: 'Hard',
        text: 'The Treaty of Westphalia in 1648 ended which major European conflict?',
        explanation: 'The Peace of Westphalia ended the Thirty Years\' War and established the modern state system.',
        answers: [
            { id: 'a', text: 'The Hundred Years\' War', isCorrect: false },
            { id: 'b', text: 'The Thirty Years\' War', isCorrect: true },
            { id: 'c', text: 'The Seven Years\' War', isCorrect: false },
            { id: 'd', text: 'The War of Spanish Succession', isCorrect: false },
        ],
    },
    {
        id: 'his-h-4', categoryId: 'history', difficulty: 'Hard',
        text: 'Which civilization built the city of Teotihuacan in present-day Mexico?',
        explanation: 'The Teotihuacan civilization, whose identity is still debated, built the city around 100 BC.',
        answers: [
            { id: 'a', text: 'Aztec', isCorrect: false },
            { id: 'b', text: 'Maya', isCorrect: false },
            { id: 'c', text: 'Olmec', isCorrect: false },
            { id: 'd', text: 'Teotihuacanos', isCorrect: true },
        ],
    },
    {
        id: 'his-h-5', categoryId: 'history', difficulty: 'Hard',
        text: 'In what year did the Byzantine Empire fall to the Ottoman Turks?',
        explanation: 'Constantinople fell to Sultan Mehmed II on May 29, 1453, ending the Byzantine Empire.',
        answers: [
            { id: 'a', text: '1389', isCorrect: false },
            { id: 'b', text: '1453', isCorrect: true },
            { id: 'c', text: '1492', isCorrect: false },
            { id: 'd', text: '1526', isCorrect: false },
        ],
    },
    // Technology Hard
    {
        id: 'tec-h-1', categoryId: 'technology', difficulty: 'Hard',
        text: 'What does "ACID" stand for in the context of database transactions?',
        explanation: 'ACID stands for Atomicity, Consistency, Isolation, and Durability — properties ensuring reliable transactions.',
        answers: [
            { id: 'a', text: 'Access, Control, Integrity, Data', isCorrect: false },
            { id: 'b', text: 'Atomicity, Concurrency, Isolation, Durability', isCorrect: false },
            { id: 'c', text: 'Atomicity, Consistency, Isolation, Durability', isCorrect: true },
            { id: 'd', text: 'Asynchronous, Consistency, Index, Data', isCorrect: false },
        ],
    },
    {
        id: 'tec-h-2', categoryId: 'technology', difficulty: 'Hard',
        text: 'What is the name of the critical security vulnerability discovered in OpenSSL in 2014?',
        explanation: 'The Heartbleed bug (CVE-2014-0160) allowed attackers to read memory of servers running OpenSSL.',
        answers: [
            { id: 'a', text: 'Shellshock', isCorrect: false },
            { id: 'b', text: 'Spectre', isCorrect: false },
            { id: 'c', text: 'Heartbleed', isCorrect: true },
            { id: 'd', text: 'POODLE', isCorrect: false },
        ],
    },
    {
        id: 'tec-h-3', categoryId: 'technology', difficulty: 'Hard',
        text: 'What is the time complexity of the Merge Sort algorithm in the worst case?',
        explanation: 'Merge Sort has O(n log n) time complexity in all cases due to its divide-and-conquer approach.',
        answers: [
            { id: 'a', text: 'O(n²)', isCorrect: false },
            { id: 'b', text: 'O(n log n)', isCorrect: true },
            { id: 'c', text: 'O(n)', isCorrect: false },
            { id: 'd', text: 'O(log n)', isCorrect: false },
        ],
    },
    {
        id: 'tec-h-4', categoryId: 'technology', difficulty: 'Hard',
        text: 'In computer networking, what does "BGP" stand for?',
        explanation: 'BGP (Border Gateway Protocol) is the routing protocol used to exchange routing information between autonomous systems on the internet.',
        answers: [
            { id: 'a', text: 'Binary Gateway Protocol', isCorrect: false },
            { id: 'b', text: 'Border Gateway Protocol', isCorrect: true },
            { id: 'c', text: 'Backbone Grid Protocol', isCorrect: false },
            { id: 'd', text: 'Broadcast Gateway Process', isCorrect: false },
        ],
    },
    {
        id: 'tec-h-5', categoryId: 'technology', difficulty: 'Hard',
        text: 'In which year was the first version of the Linux kernel released by Linus Torvalds?',
        explanation: 'Linus Torvalds released the first version of Linux (v0.01) on September 17, 1991.',
        answers: [
            { id: 'a', text: '1989', isCorrect: false },
            { id: 'b', text: '1994', isCorrect: false },
            { id: 'c', text: '1991', isCorrect: true },
            { id: 'd', text: '1993', isCorrect: false },
        ],
    },
    // Geography Hard
    {
        id: 'geo-h-1', categoryId: 'geography', difficulty: 'Hard',
        text: 'What is the deepest lake in the world?',
        explanation: 'Lake Baikal in Siberia, Russia reaches a depth of 1,642 metres.',
        answers: [
            { id: 'a', text: 'Lake Tanganyika', isCorrect: false },
            { id: 'b', text: 'Caspian Sea', isCorrect: false },
            { id: 'c', text: 'Lake Superior', isCorrect: false },
            { id: 'd', text: 'Lake Baikal', isCorrect: true },
        ],
    },
    {
        id: 'geo-h-2', categoryId: 'geography', difficulty: 'Hard',
        text: 'What is the smallest country in the world by total area?',
        explanation: 'Vatican City covers just 0.44 km², making it the world\'s smallest country.',
        answers: [
            { id: 'a', text: 'Monaco', isCorrect: false },
            { id: 'b', text: 'San Marino', isCorrect: false },
            { id: 'c', text: 'Vatican City', isCorrect: true },
            { id: 'd', text: 'Liechtenstein', isCorrect: false },
        ],
    },
    {
        id: 'geo-h-3', categoryId: 'geography', difficulty: 'Hard',
        text: 'The Mariana Trench is located in which ocean?',
        explanation: 'The Mariana Trench is in the western Pacific Ocean and is the deepest oceanic trench on Earth.',
        answers: [
            { id: 'a', text: 'Indian Ocean', isCorrect: false },
            { id: 'b', text: 'Atlantic Ocean', isCorrect: false },
            { id: 'c', text: 'Pacific Ocean', isCorrect: true },
            { id: 'd', text: 'Arctic Ocean', isCorrect: false },
        ],
    },
    {
        id: 'geo-h-4', categoryId: 'geography', difficulty: 'Hard',
        text: 'Which two countries share the world\'s longest land border?',
        explanation: 'Canada and the United States share the world\'s longest land border at approximately 8,891 km.',
        answers: [
            { id: 'a', text: 'Russia and Kazakhstan', isCorrect: false },
            { id: 'b', text: 'Brazil and Argentina', isCorrect: false },
            { id: 'c', text: 'Canada and USA', isCorrect: true },
            { id: 'd', text: 'China and Mongolia', isCorrect: false },
        ],
    },
    {
        id: 'geo-h-5', categoryId: 'geography', difficulty: 'Hard',
        text: 'What percentage of Earth\'s surface is covered by water?',
        explanation: 'Approximately 71% of Earth\'s surface is covered by water.',
        answers: [
            { id: 'a', text: '60%', isCorrect: false },
            { id: 'b', text: '80%', isCorrect: false },
            { id: 'c', text: '71%', isCorrect: true },
            { id: 'd', text: '55%', isCorrect: false },
        ],
    },
    // Sports Hard
    {
        id: 'spo-h-1', categoryId: 'sports', difficulty: 'Hard',
        text: 'What is the maximum score achievable in a single game of ten-pin bowling?',
        explanation: 'A perfect game in bowling scores 300 (12 consecutive strikes).',
        answers: [
            { id: 'a', text: '270', isCorrect: false },
            { id: 'b', text: '300', isCorrect: true },
            { id: 'c', text: '290', isCorrect: false },
            { id: 'd', text: '330', isCorrect: false },
        ],
    },
    {
        id: 'spo-h-2', categoryId: 'sports', difficulty: 'Hard',
        text: 'In which year were women first allowed to compete in the modern Olympic Games?',
        explanation: 'Women first competed in the modern Olympics at the 1900 Paris Games.',
        answers: [
            { id: 'a', text: '1896', isCorrect: false },
            { id: 'b', text: '1908', isCorrect: false },
            { id: 'c', text: '1920', isCorrect: false },
            { id: 'd', text: '1900', isCorrect: true },
        ],
    },
    {
        id: 'spo-h-3', categoryId: 'sports', difficulty: 'Hard',
        text: 'What is the term for three consecutive strikes in bowling?',
        explanation: 'Three consecutive strikes in bowling is called a "turkey."',
        answers: [
            { id: 'a', text: 'Hat-trick', isCorrect: false },
            { id: 'b', text: 'Turkey', isCorrect: true },
            { id: 'c', text: 'Triple Crown', isCorrect: false },
            { id: 'd', text: 'Grand Slam', isCorrect: false },
        ],
    },
    {
        id: 'spo-h-4', categoryId: 'sports', difficulty: 'Hard',
        text: 'How many dimples does a regulation golf ball have on average?',
        explanation: 'Most golf balls have between 300 and 500 dimples; 336 is a common number.',
        answers: [
            { id: 'a', text: '200', isCorrect: false },
            { id: 'b', text: '500', isCorrect: false },
            { id: 'c', text: '336', isCorrect: true },
            { id: 'd', text: '100', isCorrect: false },
        ],
    },
    {
        id: 'spo-h-5', categoryId: 'sports', difficulty: 'Hard',
        text: 'In the Tour de France, what color jersey does the overall leader wear?',
        explanation: 'The leader of the general classification in the Tour de France wears the yellow jersey (maillot jaune).',
        answers: [
            { id: 'a', text: 'Green', isCorrect: false },
            { id: 'b', text: 'Red', isCorrect: false },
            { id: 'c', text: 'Yellow', isCorrect: true },
            { id: 'd', text: 'White', isCorrect: false },
        ],
    },
    // Arts Hard
    {
        id: 'art-h-1', categoryId: 'arts', difficulty: 'Hard',
        text: 'Who composed "The Rite of Spring," whose 1913 premiere reportedly caused a riot?',
        explanation: 'Igor Stravinsky\'s "The Rite of Spring" premiered on May 29, 1913 in Paris.',
        answers: [
            { id: 'a', text: 'Claude Debussy', isCorrect: false },
            { id: 'b', text: 'Sergei Prokofiev', isCorrect: false },
            { id: 'c', text: 'Igor Stravinsky', isCorrect: true },
            { id: 'd', text: 'Béla Bartók', isCorrect: false },
        ],
    },
    {
        id: 'art-h-2', categoryId: 'arts', difficulty: 'Hard',
        text: 'In which year was William Shakespeare born?',
        explanation: 'William Shakespeare was baptized on April 26, 1564, in Stratford-upon-Avon.',
        answers: [
            { id: 'a', text: '1542', isCorrect: false },
            { id: 'b', text: '1590', isCorrect: false },
            { id: 'c', text: '1564', isCorrect: true },
            { id: 'd', text: '1574', isCorrect: false },
        ],
    },
    {
        id: 'art-h-3', categoryId: 'arts', difficulty: 'Hard',
        text: 'What is the Japanese art of paper folding called?',
        explanation: 'Origami is the traditional Japanese art of folding paper into decorative shapes.',
        answers: [
            { id: 'a', text: 'Ikebana', isCorrect: false },
            { id: 'b', text: 'Origami', isCorrect: true },
            { id: 'c', text: 'Bonsai', isCorrect: false },
            { id: 'd', text: 'Haiku', isCorrect: false },
        ],
    },
    {
        id: 'art-h-4', categoryId: 'arts', difficulty: 'Hard',
        text: 'Which artist created the "Campbell\'s Soup Cans" series in 1962?',
        explanation: 'Andy Warhol created 32 canvases of Campbell\'s Soup Cans, a defining work of Pop Art.',
        answers: [
            { id: 'a', text: 'Roy Lichtenstein', isCorrect: false },
            { id: 'b', text: 'Jasper Johns', isCorrect: false },
            { id: 'c', text: 'Andy Warhol', isCorrect: true },
            { id: 'd', text: 'Robert Rauschenberg', isCorrect: false },
        ],
    },
    {
        id: 'art-h-5', categoryId: 'arts', difficulty: 'Hard',
        text: 'What literary term describes a narrative technique where the story is told out of chronological order?',
        explanation: 'Anachrony (or non-linear narrative) is a technique where events are presented out of order.',
        answers: [
            { id: 'a', text: 'Analepsis', isCorrect: false },
            { id: 'b', text: 'Stream of Consciousness', isCorrect: false },
            { id: 'c', text: 'Anachrony', isCorrect: true },
            { id: 'd', text: 'Prolepsis', isCorrect: false },
        ],
    },
];
export function getQuestionsByDifficulty(difficulty, categoryIds, count) {
    const pool = QUESTIONS.filter(q => q.difficulty === difficulty && categoryIds.includes(q.categoryId));
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
}
export function buildGameQuestions(categoryIds) {
    const easy = getQuestionsByDifficulty('Easy', categoryIds, 5);
    const medium = getQuestionsByDifficulty('Medium', categoryIds, 5);
    const hard = getQuestionsByDifficulty('Hard', categoryIds, 5);
    return [...easy, ...medium, ...hard];
}
