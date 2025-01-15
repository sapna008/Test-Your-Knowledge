import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { div } from 'framer-motion/client';

// Helper function- categories fetch karne ke liye
const fetchCategories = async () => {
  const response = await axios.get('https://opentdb.com/api_category.php');
  return response.data.trivia_categories;
};


const SetupQuiz = () => {
  const [categories, setCategories] = useState([]);
  const [quizSetup, setQuizSetup] = useState({
    name: '',
    category: '',
    difficulty: '',
    amount: 10,
  });

  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories().then((data) => setCategories(data));
  }, []);

  const handleChange = (e) => {
    setQuizSetup({ ...quizSetup, [e.target.name]: e.target.value });
  };

  const handleStartQuiz = () => {
    localStorage.setItem('quizSetup', JSON.stringify(quizSetup));
    navigate('/quiz');
  };

  return (
    <div 
    style={{
      textAlign:"center",
      backgroundColor:"#f0f0f0"
      }}
    >
    <h1 style={{textAlign:"center", marginBottom:"20px"}}>Welcom to Quiz</h1>
    <div style={{width:"100%",
    height:"100%" , 
    margin:"20px", 
    padding:"0px", 
    alignItems:"center", 
    justifyContent:"center",
    display:"flex",
    backgroundColor:"#f0f0f0"
    }}>
      
      <input
        type="text"
        name="name"
        placeholder="Enter your name"
        value={quizSetup.name}
        onChange={handleChange}
        style={{
          width:"50%",
          padding:"10px",
          marginBottom:"20px",
          border:"1px solid #ccc",
          borderRadius:"5px"
        }}
      />
      <br /><br />
      <select name="category" 
      onChange={handleChange} 
      value={quizSetup.category}
      style={{
        width:"50%",
        padding:"10px",
        marginBottom:"20px",
        border:"1px solid #ccc",
        borderRadius:"5px"
      }}
      >
        <option value="">Select Category</option>
        {categories.map((cat) => (
          <option key={cat.id} value={cat.id}>
            {cat.name}
          </option>
        ))}
      </select>
      <br /><br />
      <select name="difficulty" 
      onChange={handleChange} 
      value={quizSetup.difficulty}
      style={{
        width:"50%",
        padding:"10px",
        marginBottom:"20px",
        border:"1px solid #ccc",
        borderRadius:"5px"
      }}
      >
        <option value="">Select Difficulty</option>
        <option value="easy">Easy</option>
        <option value="medium">Medium</option>
        <option value="hard">Hard</option>
      </select>
      <br /><br />
      <input
        type="number"
        name="amount"
        placeholder="Number of questions"
        value={quizSetup.amount}
        onChange={handleChange}
        min="1"
        max="50"
        style={{
          width:"50%",
          padding:"10px",
          marginBottom:"20px",
          border:"1px solid #ccc",
          borderRadius:"5px"
        }}
      />
      <br /><br />
    </div>
    <button onClick={handleStartQuiz}
            style={{
              width:"50%",
              padding:"10px",
              backgroundColor:"rgb(96 19 125)",
              color:"#fff",
              border:"none",
              borderRadius:"5px",
              cursor:"pointer"
            }}
            >Start Quiz</button>
    </div>
  );
};

// Quiz Route
const Quiz = () => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [showResults, setShowResults] = useState(false);

  const quizSetup = JSON.parse(localStorage.getItem('quizSetup'));

  useEffect(() => {
    const fetchQuestions = async () => {
      const response = await axios.get(
        `https://opentdb.com/api.php?amount=${quizSetup.amount}&category=${quizSetup.category}&difficulty=${quizSetup.difficulty}&type=multiple`
      );
      setQuestions(response.data.results);
    };
    fetchQuestions();
  }, [quizSetup]);

  const handleAnswer = (isCorrect) => {
    setAnswers([...answers, isCorrect]);
    if (isCorrect) setScore(score + 1);
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    } else {
      setShowResults(true);
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) setCurrentQuestion((prev) => prev - 1);
  };

  if (questions.length === 0) return <div>Loading...</div>;

  if (showResults) {
    return (
      <div 
      style={{
        width:"100%",
        height:"100vh",
        margin:"0px",
        padding:"opx",
        display:"flex",
        justifyContent:"center",
        alignItems:"center",
        borderColor:"#f0f0f0"      
      }}>
      <div
      style={{
        width:"50%",
        padding:"20px",
        backgroundColor:"#fff",
        borderRadius:"10px",
        boxShadow:"0px 0px 10px rgba(0,0,0,0.1)"
      }}
      >
        <h1
    style={{
      textAlign:"center",
      marginBottom:"20px",
      fontSize:"3em"
    }}
        >Quiz Results</h1>
        <p
      style={{
        fontSize:"18px",
        marginBottom:"20px"
      }}        
        >Name: {quizSetup.name}</p>
        <p
      style={{
        fontSize:"18px",
        marginBottom:"20px"
      }}
        >Score: {score} / {questions.length}</p>
        <p>Percentage: {(score / questions  .length) * 100}%</p>
        <button
          onClick={() => {
            localStorage.setItem(
              'leaderboard',
              JSON.stringify([
                ...JSON.parse(localStorage.getItem('leaderboard') || '[]'),
                { name: quizSetup.name, score },
              ])
            );
          }}
          style={{
            width:"100%",
            padding:"10px",
            marginBottom:"10px",
            border:"none",
            borderRadius:"5px",
            backgroundColor:"rgb(96 19 125)",
            color:"#fff",
            cursor:"pointer"
          }}
        >
          Save to Leaderboard
        </button>
        <button onClick={() => window.location.href = '/leaderboard'}
          style={{
            width:"100%",
            padding:"10px",
            border:"none",
            borderRadius:"5px",
            backgroundColor:"rgb(96 19 125)",
            color:"#fff",
            cursor:"pointer"
          }}>View Leaderboard</button>
      </div>
      </div>
    );
  }

  const { question, correct_answer, incorrect_answers } = questions[currentQuestion];
  const options = [...incorrect_answers, correct_answer].sort(() => Math.random() - 0.5);

  return (
    <div style={{
      width:"100%",
      height:"100vh",
      margin:"0px",
      padding:"opx",
      display:"flex",
      justifyContent:"center",
      alignItems:"center",
      borderColor:"#f0f0f0"
    }}>
      <div
      style={{
        width:"50%",
        padding:"20px",
        borderColor:"#fff",
        borderRadius:"10px",
        boxShadow:"0px 0px 10px rgba(0,0,0,0.1)"
      }}
      >
      <h1 
      style={{
        textAlign:"center",
        marginBottom:"20px",
        fontSize:"3em"
      }}>Quiz</h1>
      <p
      style={{
        fontSize:"18px",
        marginBottom:"20px"
      }}
      >
        Question {currentQuestion + 1} of {questions.length}
      </p>
      <h3 
      style={{
        fontSize:"22px",
        marginBottom:"20px"
      }}
      >{question}</h3>
      {options.map((option, idx) => (
        <button
          key={idx}
          onClick={() => handleAnswer(option === correct_answer)}
          style={{
            width:"100%",
            padding:"10px",
            marginBottom:"10px",
            border:"none",
            borderRadius:"5px",
            backgroundColor:"#fff",
            cursor:"pointer"
          }}
        >
          {option}
        </button>
      ))}
      <div 
      style={
        {
          display:"flex",
          justifyContent:"space-between"
        }
      }>
        <button onClick={prevQuestion}
        style={{
          width:"45%",
          padding:"10px",
          border:"none",
          borderRadius:"5px",
          backgroundColor:"rgb(96 19 125)",
          color:"#fff",
          cursor:"pointer"
        }}
        >Previous</button>
        <button onClick={nextQuestion}
        style={{
          width:"45%",
          padding:"10px",
          border:"none",
          borderRadius:"5px",
          backgroundColor:"rgb(96 19 125)",
          color:"#fff",
          cursor:"pointer"
        }}       
        >Next</button>
      </div>
    </div>
    </div>
  );
};

// Leaderboard Route
const Leaderboard = () => {
  const leaderboard = JSON.parse(localStorage.getItem('leaderboard') || '[]');

  return (
    <div className='container'>
      <h1>Leaderboard</h1>
      <ol>
        {leaderboard
          .sort((a, b) => b.score - a.score)
          .map((user, idx) => (
            <li key={idx}>
              {user.name}: {user.score}
            </li>
          ))}
      </ol>
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SetupQuiz />} />
        <Route path="/quiz" element={<Quiz />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
      </Routes>
    </Router>
  );
};

export default App;
