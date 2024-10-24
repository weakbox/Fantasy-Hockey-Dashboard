import { useState, useEffect } from 'react'
import './App.css'

const positionMap: Record<string, string> = {
  "Center": "C",
  "Left Wing": "LW",
  "Right Wing": "RW",
  "Defense": "D",
  "Goalie": "G",
}

type TeamColors = {
  primary: string;
  secondary: string;
  tertiary: string;
}

const proTeamColorMap: Record<string, TeamColors> = {
  "Anaheim Ducks": {
    primary: "#FC1907",
    secondary: "#000000",
    tertiary: "#89734C",
  },
  "Boston Bruins": {
    primary: "#FFB81C",
    secondary: "#000000",
    tertiary: "#FFFFFF",
  },
  "Buffalo Sabres": {
    primary: "#003087",
    secondary: "#FFB81C",
    tertiary: "#FFFFFF",
  },
  "Calgary Flames": {
    primary: "#D2001C",
    secondary: "#FAAF19",
    tertiary: "#FFFFFF",
  },
  "Carolina Hurricanes": {
    primary: "#333F48",
    secondary: "#C8102E",
    tertiary: "#010101",
  },
  "Chicago Blackhawks": {
    primary: "#CF0A2C",
    secondary: "#FFFFFF",
    tertiary: "#000000",
  },
  "Colorado Avalanche": {
    primary: "#6F263D",
    secondary: "#236192",
    tertiary: "#A2AAAD",
  },
  "Columbus Blue Jackets": {
    primary: "#002654",
    secondary: "#CE1126",
    tertiary: "#A2AAAD",
  },
  "Dallas Stars": {
    primary: "#006847",
    secondary: "#FFFFFF",
    tertiary: "#000000",
  },
  "Detroit Red Wings": {
    primary: "#CE1126",
    secondary: "#FFFFFF",
    tertiary: "#CE1126",
  },
  "Edmonton Oilers": {
    primary: "#00205B",
    secondary: "#CF4520",
    tertiary: "#FFFFFF",
  },
  "Florida Panthers": {
    primary: "#C8102E",
    secondary: "#041E42",
    tertiary: "#B9975B",
  },
  "Los Angeles Kings": {
    primary: "#111111",
    secondary: "#A2AAAD",
    tertiary: "#FFFFFF",
  },
  "Minnesota Wild": {
    primary: "#154734",
    secondary: "#DDCBA4",
    tertiary: "#A6192E",
  },
  "Montréal Canadiens": {
    primary: "#A6192E",
    secondary: "#001E62",
    tertiary: "#FFFFFF",
  },
  "Nashville Predators": {
    primary: "#FFB81C",
    secondary: "#041E42",
    tertiary: "#FFFFFF",
  },
  "New Jersey Devils": {
    primary: "#CE1126",
    secondary: "#000000",
    tertiary: "#046A38",
  },
  "New York Islanders": {
    primary: "#003087",
    secondary: "#FC4C02",
    tertiary: "#FFFFFF",
  },
  "New York Rangers": {
    primary: "#0032A0",
    secondary: "#C8102E",
    tertiary: "#FFFFFF",
  },
  "Ottawa Senators": {
    primary: "#000000",
    secondary: "#C8102E",
    tertiary: "#B9975B",
  },
  "Philadelphia Flyers": {
    primary: "#CF4520",
    secondary: "#FFFFFF",
    tertiary: "#000000",
  },
  "Pittsburgh Penguins": {
    primary: "#000000",
    secondary: "#FCB514",
    tertiary: "#FFFFFF",
  },
  "St. Louis Blues": {
    primary: "#002F87",
    secondary: "#FFB81C",
    tertiary: "#041E42",
  },
  "San Jose Sharks": {
    primary: "#006D75",
    secondary: "#FFFFFF",
    tertiary: "#EA7200",
  },
  "Seattle Kraken": {
    primary: "#001628",
    secondary: "#99D9D9",
    tertiary: "#6BA4B8",
  },
  "Tampa Bay Lightning": {
    primary: "#00205B",
    secondary: "#FFFFFF",
    tertiary: "#000000",
  },
  "Toronto Maple Leafs": {
    primary: "#00205B",
    secondary: "#FFFFFF",
    tertiary: "#00205B",
  },
  "Utah Hockey Club": {
    primary: "#010101",
    secondary: "#69B3E7",
    tertiary: "#FFFFFF",
  },
  "Vancouver Canucks": {
    primary: "#00205B",
    secondary: "#00843D",
    tertiary: "#FFFFFF",
  },
  "Vegas Golden Knights": {
    primary: "#B4975A",
    secondary: "#333F48",
    tertiary: "#C8102E",
  },
  "Washington Capitals": {
    primary: "#C8102E",
    secondary: "#041E42",
    tertiary: "#FFFFFF",
  },
  "Winnipeg Jets": {
    primary: "#041E42",
    secondary: "#A2AAAD",
    tertiary: "#004C97",
  },
};

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

const Player = ({name, headshotURL, proTeam, proTeamAbbrev, proTeamLogoURL, position, points, pointsBreakdown}: Player) => {
  
  const teamColors = proTeamColorMap[proTeam]; // Technically we could remove proTeam and replace with proTeamAbbrev.

  // Get the top N stats from the pointsBreakdown:
  const getTopStats = (n: number) => Object.entries(pointsBreakdown).sort((a, b) => b[1] - a[1]).slice(0, n);

  const renderTopStats = () => getTopStats(2).map(stat => <span>{stat[0]}: {stat[1]}</span>); // Fix unique key problem.
 
  // The renderTopStats() is rendering sort of weirdly.
  return (
    <div className="player-container" style={{
      backgroundColor: teamColors.primary, 
      color: teamColors.secondary,
      }}>
      <div className="player-text-container">
        <span className="player-name">{name}</span>
        <span>{positionMap[position]}</span>
        <span>{proTeamAbbrev}</span>
      </div>
      <div className="player-photo">
        <img className="player-pro-team-logo" src={proTeamLogoURL} alt={`${proTeam} logo`} />
        <img className="player-headshot" src={headshotURL} alt={`${name}'s headshot`} />
      </div>
      <div className="player-points-container">
        <span className="player-points">{points}</span>
        <span className="player-top-stats">{renderTopStats()}</span> 
      </div>
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
          proTeamAbbrev={player.proTeamAbbrev}
          proTeamLogoURL={player.proTeamLogoURL}
          position={player.position}
          points={player.points}
          pointsBreakdown={player.pointsBreakdown}
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

const MatchupDetails = () => {
  const URL = "http://127.0.0.1:8000/869377698/2025/boxscores/3";

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
