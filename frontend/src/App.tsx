import { useState, useEffect } from 'react'
import './App.css'

import BoxScore from './components/BoxScore.tsx';

interface Player {
  id: number;
  name: string;
  headshotURL: string;
  proTeam: string,
  proTeamAbbrev: string;
  proTeamLogoURL: string;
  position: string;
  points: number;
  pointsBreakdown: number[];
}

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

const MatchupDetails = () => {
  const URL = "http://127.0.0.1:8000/869377698/2025/boxscores/1";


  // (NOOB COMMENT) Declares state for boxScores, which can be an array of BoxScore objects or null.
  // Initially set to null since no data is available before the fetch happens when the component mounts.
  const [boxScores, setBoxScores] = useState<BoxScore[] | null>(null);

  // Fetch data on component mount:
  useEffect(() => {
    
    const fetchBoxscores = async () => {
      try {
        const response = await fetch(URL);
        const result = await response.json();
        setBoxScores(result.boxScores);
      } catch (error) {
        console.error("Error fetching boxscores:", error);
      }
    };

    // TODO: Make API fetch happen at a set interval for live updates!

    fetchBoxscores();
  }, []);

  const parseMatchups = (boxScores: BoxScore[] | null) => {
    if (!boxScores) {
      return <p>No matchups available.</p>
    }
    
    return (
      <>
        {boxScores.map((boxScore: BoxScore, index) => (
          <BoxScore
            key={index} // Index isn't the greatest solution. Learn why and update accordingly.
            title={boxScore.title}
            homeTeam={boxScore.homeTeam}
            homeScore={boxScore.homeScore}
            awayTeam={boxScore.awayTeam}
            awayScore={boxScore.awayScore}
            winner={boxScore.winner}
          />
        ))}
      </>
    );
  };

  return (
    <>
      {boxScores ? (<div>{parseMatchups(boxScores)}</div>) : (<p>Loading...</p>)}
    </>
  );
};

function App() {
  
  return (
    <MatchupDetails />
  )
}

export default App
