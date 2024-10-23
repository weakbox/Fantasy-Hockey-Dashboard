import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

interface Player {
  id: number;
  name: string;
  headshotURL: string;
  proTeam: string;
  position: string;
  points: number;
}

const Player = ({name, headshotURL, proTeam, position, points}: Player) => {
  return (
    <div>
      <img src={headshotURL} alt={`${name}'s headshot`} width="42" height="30"/> {name} ({proTeam}, {position}) {points}
    </div>
  );
};

interface BoxScore {
  title: string;
  homeTeam: Team;
  homeScore: number;
  awayTeam: Team;
  awayScore: number;
  winner: string;
}

interface Team {
  name: string;
  abbrev: string;
  logoURL: string;
  lineup: Player[]; // Lineup is just an array of players.
}

const BoxScore = ({title, homeTeam, homeScore, awayTeam, awayScore, winner}: BoxScore) => {
  
  const renderPlayers = (lineup: Player[]) => {
    return lineup
      .sort((a: Player, b: Player) => b.points - a.points) // Sort players by points in descending order
      .map((player: Player) => (
        <Player
          key={player.id}
          id={player.id}
          name={player.name}
          headshotURL={player.headshotURL}
          proTeam={player.proTeam}
          position={player.position}
          points={player.points}
        />
      ));
  };
  
  return (
    <>
      <h2>{title}</h2>
      <p><img src={awayTeam.logoURL} alt={`${awayTeam.name} logo`} width="42" height="42"/> {awayScore} - <img src={homeTeam.logoURL} alt={`${homeTeam.name} logo`} width="42" height="42"/> {homeScore}</p>
      <p>{winner == "HOME" ? homeTeam.name : awayTeam.name} wins!</p>
      <h3>{awayTeam.abbrev} Starting Lineup:</h3>
      <div>{renderPlayers(awayTeam.lineup)}</div>
      <h3>{homeTeam.abbrev} Starting Lineup:</h3>
      <div>{renderPlayers(homeTeam.lineup)}</div>
    </>
  );
};

const Test = () => {
  const URL = "http://127.0.0.1:8000/869377698/2025/boxscores/3";

  const [boxscores, setBoxscores] = useState<BoxScore[] | null>(null);

  // Fetch data on component mount
  useEffect(() => {
    const fetchBoxscores = async () => {
      try {
        const response = await fetch(URL);
        const result = await response.json();
        setBoxscores(result.boxscores);  // Update the state with the fetched data
      } catch (error) {
        console.error("Error fetching boxscores:", error);
      }
    };

    fetchBoxscores();  // Call the function to fetch the data
  }, []);  // The empty array ensures this effect only runs once when the component mounts

  interface Props {
    boxscores: BoxScore[] | null;  // boxscores can be an array or null
  }

  const parseMatchups = ({ boxscores }: Props) => {
    return (
      <>
        {boxscores?.map((boxscore) => (
          <BoxScore
            title={boxscore.title}
            homeTeam={boxscore.homeTeam}
            homeScore={boxscore.homeScore}
            awayTeam={boxscore.awayTeam}
            awayScore={boxscore.awayScore}
            winner={boxscore.winner}
          />
        )) || <p>No matchups available</p>}  {/* Fallback message if boxscores is null */}
      </>
    );
  };

  return (
    <>
      {boxscores ? (
        <div>{parseMatchups({ boxscores })}</div>  // Wrap in a div to handle multiple elements
      ) : (
        <p>Loading...</p>
      )}
    </>
  );
};

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
      <Test />
    </>
  )
}

export default App
