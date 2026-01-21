/*
  Project: Dynamic Quiz App
  Author: Anubhav Maandey
  College: Ajay Kumar Garg Engineering College
  Roll No: 2200270120028
  Features: Category/Difficulty filter, 30s timer per question, result analytics + charts
*/

const QUESTIONS = [
  // Java - Easy
  { id: 1, category: "Java", difficulty: "Easy", question: "Which of these is NOT a Java primitive type?", options: [ "int","float", "String", "char"], answerIndex: 2 },
  { id: 2, category: "Java", difficulty: "Easy", question: "Which keyword is used to create an object?", options: ["class", "new", " create", "object"], answerIndex: 1 },
  { id: 3, category: "Java", difficulty: "Easy", question: "What is the size of int in Java?", options: [ "32-bit","16-bit", "64-bit", "Depend on OS"], answerIndex: 0 },

  // Java - Medium
  { id: 4, category: "Java", difficulty: "Medium", question: "What is the default value of an instance variable of type boolean?", options: ["True", "False", "Null", "0"], answerIndex: 1 },
  { id: 5, category: "Java", difficulty: "Medium", question: "Which interface is used for sorting in Java Collections?", options: ["Cloneable", "Comparable", "Runnable", "Serializable"], answerIndex: 1 },

  // Python - Easy
  { id: 6, category: "Python", difficulty: "Easy", question: "Which keyword is used to define a function in Python?", options: ["func", "def", "function" , "define"], answerIndex: 1 },
  { id: 7, category: "Python", difficulty: "Easy", question: "What is the output of print(type(10))?", options: [ "<class 'float'>", "<class 'str'>", "<class 'int'>", "<class 'bool'>"], answerIndex: 2 },
  { id: 8, category: "Python", difficulty: "Easy", question: "Which of these is a mutable data type?", options: ["tuple", "string", "list", "int"], answerIndex: 2 },

  // Python - Medium
  { id: 9, category: "Python", difficulty: "Medium", question: "What does len([1, 2, 3, 4]) return?", options: ["3", "4", "5", "Error"], answerIndex: 1 },
  { id: 10, category: "Python", difficulty: "Medium", question: "Which block is used to handle exceptions in Python?", options: ["try/except", "if/else", "for/while", "break/continue"], answerIndex: 0 },

  // Aptitude - Easy
  { id: 11, category: "Aptitude", difficulty: "Easy", question: "If 12 pencils cost 60, what is the cost of 1 pencil?", options: ["3", "4", "5", "6"], answerIndex: 2 },
  { id: 12, category: "Aptitude", difficulty: "Easy", question: "What is 25% of 200?", options: ["25", "40", "50", "60"], answerIndex: 2 },
  { id: 13, category: "Aptitude", difficulty: "Easy", question: "Find the next number in the series: 5, 10, 15, 20, ?", options:["22", "24", "25", "30"], answerIndex: 2},

  // Aptitude - Medium
  { id: 14, category: "Aptitude", difficulty: "Medium", question: "A train travels 180 km in 3 hours. What is its speed in km/h?", options: ["50", "55", "60", "65"], answerIndex: 2 },
  { id: 15, category: "Aptitude", difficulty: "Medium", question: "If a shirt marked 800 is sold at 20% discount, what is the selling price?", options: ["620", "640", "660", "680"], answerIndex: 1 },

  // Web - Easy
  { id: 16, category: "Web", difficulty: "Easy", question:"Which HTML tag is used to create a hyperlink?", options: ["<link>", "<a>", "<href>", "<url>"], answerIndex: 1 },
  { id: 17, category: "Web", difficulty: "Easy", question: "Which HTTP method is typically used to fetch data from a server?", options: ["GET", "POST", "PUT", "DELETE"], answerIndex: 0 },
  { id: 18, category: "Web", difficulty: "Easy", question: "Which CSS property changes text color?", options: ["font-style", "background", "color", "text-decoration"], answerIndex: 2 },

  // Web - Medium
  { id: 19, category: "Web", difficulty: "Medium", question: "Which HTTP status code means 'Not Found'?", options: ["200", "301", "404", "500"], answerIndex: 2 },
  { id: 20, category: "Web", difficulty: "Medium", question: "What does CSS stand for?", options: ["Creative Style Sheets", "Cascading Style Sheets", "Computer Style Sheets", "Colorful Style Sheets"], answerIndex: 1 },

  // Hard - Java
  { id: 21, category: "Java", difficulty: "Hard", question: "Which statement about Java garbage collection is most accurate?", options:  [
            "It guarantees immediate memory release when an object becomes unreachable",
            "It automatically frees memory for unreachable objects, but timing is not guaranteed",
            "It runs only when System.gc() is called",
            "It can collect objects that are still strongly referenced"
        ], answerIndex: 1 },
  // Hard - Python      
  { id: 22, category: "Python", difficulty: "Hard", question: "What is the main difference between a deep copy and a shallow copy in Python?", options:  [
            "Deep copy copies only references; shallow copy copies full objects",
            "Shallow copy copies nested objects; deep copy does not",
            "Deep copy copies the object and all nested objects; shallow copy copies only the top-level object references",
            "They are the same in Python"
        ], answerIndex: 2 },
  // Hard - Aptitude      
  { id: 23, category: "Aptitude", difficulty: "Hard", question: "A can do a piece of work in 12 days and B can do the same work in 18 days. In how many days will they finish the work together?", options: [
            "7.2 days",
            "8.0 days",
            "9.0 days",
            "10.0 days"
        ], answerIndex: 0 },
  // Hard - Web       
  {id: 24, category: "Web", difficulty: "Hard", question: "Which HTTP response header is primarily used to control how long a browser can cache a resource?", options: [
            "Content-Type",
            "Cache-Control",
            "User-Agent",
            "Referer"
        ], answerIndex: 1 }
];