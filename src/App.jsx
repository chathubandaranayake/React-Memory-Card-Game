import React, { useState, useEffect } from 'react';
import Card from './components/Card';
import './App.css';

const cardImages = [
  { src: "https://deckofcardsapi.com/static/img/AS.png", matched: false },
  { src: "https://deckofcardsapi.com/static/img/KH.png", matched: false },
  { src: "https://deckofcardsapi.com/static/img/QC.png", matched: false },
  { src: "https://deckofcardsapi.com/static/img/0D.png", matched: false },
  { src: "https://deckofcardsapi.com/static/img/5H.png", matched: false },
  { src: "https://deckofcardsapi.com/static/img/8C.png", matched: false },
  { src: "https://deckofcardsapi.com/static/img/JS.png", matched: false },
  { src: "https://deckofcardsapi.com/static/img/2C.png", matched: false }
];

function App() {
  const [cards, setCards] = useState([]);
  const [turns, setTurns] = useState(0);
  const [choiceOne, setChoiceOne] = useState(null);
  const [choiceTwo, setChoiceTwo] = useState(null);
  const [disabled, setDisabled] = useState(false);
  const [time, setTime] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [bestScore, setBestScore] = useState(
    () => JSON.parse(localStorage.getItem("bestScore")) || null
  );

  // Shuffle and start a new game
  const shuffleCards = () => {
    const shuffledCards = [...cardImages, ...cardImages]
      .sort(() => Math.random() - 0.5)
      .map(card => ({ ...card, id: Math.random() }));

    setChoiceOne(null);
    setChoiceTwo(null);
    setCards(shuffledCards);
    setTurns(0);
    setTime(0);
    setGameOver(false);
    setGameStarted(false);  // Reset timer start flag
  };

  // Handle card choice
  const handleChoice = (card) => {
    if (!gameStarted) setGameStarted(true); // Start timer on first card click
    choiceOne ? setChoiceTwo(card) : setChoiceOne(card);
  };

  // Compare two selected cards
  useEffect(() => {
    if (choiceOne && choiceTwo) {
      setDisabled(true);

      if (choiceOne.src === choiceTwo.src) {
        setCards(prevCards =>
          prevCards.map(card =>
            card.src === choiceOne.src ? { ...card, matched: true } : card
          )
        );
        resetTurn();
      } else {
        setTimeout(() => resetTurn(), 1000);
      }
    }
  }, [choiceOne, choiceTwo]);

  // Reset choices & increment turn count
  const resetTurn = () => {
    setChoiceOne(null);
    setChoiceTwo(null);
    setTurns(prev => prev + 1);
    setDisabled(false);
  };

  // Initialize game on mount
  useEffect(() => {
    shuffleCards();
  }, []);

  // Timer logic — runs only when gameStarted is true and game not over
  useEffect(() => {
    let timerInterval;
    if (gameStarted && !gameOver) {
      timerInterval = setInterval(() => {
        setTime(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerInterval);
    }
    return () => clearInterval(timerInterval);
  }, [gameStarted, gameOver]);

  // Check for win condition
  useEffect(() => {
    if (cards.length > 0 && cards.every(card => card.matched)) {
      setGameOver(true);

      // Update best score if better
      if (
        !bestScore ||
        time < bestScore.time ||
        (time === bestScore.time && turns < bestScore.turns)
      ) {
        const newScore = { time, turns };
        setBestScore(newScore);
        localStorage.setItem("bestScore", JSON.stringify(newScore));
      }
    }
  }, [cards, time, turns, bestScore]);

  return (
    <div className="App">
      <h1>Memory Card Game 🃏</h1>
      <button onClick={shuffleCards}>New Game</button>
      <p>⏱️ Time: {time}s | 🔁 Turns: {turns}</p>
      {bestScore && (
        <p>
          🏆 Best Score — Time: {bestScore.time}s, Turns: {bestScore.turns}
        </p>
      )}
      {gameOver && <h2>🎉 You Won in {turns} turns and {time} seconds!</h2>}
      <div className="card-grid">
        {cards.map(card => (
          <Card
            key={card.id}
            card={card}
            handleChoice={handleChoice}
            flipped={card === choiceOne || card === choiceTwo || card.matched}
            disabled={disabled}
          />
        ))}
      </div>
    </div>
  );
}

export default App;
