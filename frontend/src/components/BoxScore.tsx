import { PlayerCard, PlayerCardList } from "./PlayerCard.tsx";

import styles from "./BoxScore.module.css";

interface Player {
  id: number;
  name: string;
  headshotURL: string;
  proTeam: string,
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

// Fallback player if a team hasn't played a game yet.
const defaultPlayer: Player = {
  id: 0,
  name: "Hockey Player",
  headshotURL: "./default_headshot.png",
  proTeam: "Free Agent",
  proTeamLogoURL: "https://a.espncdn.com/combiner/i?img=/i/teamlogos/leagues/500/nhl.png",
  position: "N/A",
  points: 0,
  pointsBreakdown: {
    "G": 0,
    "A": 0,
  }
};

export default function BoxScore({title, homeTeam, homeScore, awayTeam, awayScore, winner}: BoxScore) {

  const renderLineup = (lineup: Player[]) => {
    const sortedLineup = lineup.sort((a, b) => b.points - a.points);
    const topPlayers = sortedLineup.slice(0, 3);
  
    // If less than 3 players have played yet, add default players:
    while (topPlayers.length < 3) {
      topPlayers.push(defaultPlayer);
    }

    return (
      <>
        {topPlayers.map((player) => (
          <PlayerCard
            // add key back
            id={player.id}
            name={player.name}
            headshotURL={player.headshotURL}
            proTeam={player.proTeam}
            proTeamLogoURL={player.proTeamLogoURL}
            position={player.position}
            points={player.points}
            pointsBreakdown={player.pointsBreakdown}
          />
        ))}
        {sortedLineup.map((player) => (
          <PlayerCardList
            key={player.id}
            id={player.id}
            name={player.name}
            headshotURL={player.headshotURL}
            proTeam={player.proTeam}
            proTeamLogoURL={player.proTeamLogoURL}
            position={player.position}
            points={player.points}
            pointsBreakdown={player.pointsBreakdown}
          />
        ))}
      </>
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.matchInfo}>
        <h2>{title}</h2>
        <p><img src={awayTeam.logoURL} alt={`${awayTeam.name} logo`} width="42" height="42"/> {awayScore} - <img src={homeTeam.logoURL} alt={`${homeTeam.name} logo`} width="42" height="42"/> {homeScore}</p>
        <p>{winner == "HOME" ? homeTeam.name : awayTeam.name} wins!</p>
      </div>
      <h3 className={styles.lineupHeader}>{awayTeam.abbrev} Stars of the Week:</h3>
      <div className={styles.playerContainer}>{renderLineup(awayTeam.lineup)}</div>
      <h3 className={styles.lineupHeader}>{homeTeam.abbrev} Stars of the Week:</h3>
      <div className={styles.playerContainer}>{renderLineup(homeTeam.lineup)}</div>
    </div>
  );
};
