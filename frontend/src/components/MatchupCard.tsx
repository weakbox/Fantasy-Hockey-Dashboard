import styles from "./MatchupCard.module.css";

export default function MatchupCard({awayTeamName, awayTeamAbbrev,  awayTeamLogo, awayScore, homeTeamName, homeTeamAbbrev, homeTeamLogo, homeScore}) {
  return (
    <div className={styles.container}>
      <div className={styles.teamContainer}>
        <span>{awayTeamName}</span>
        <span className={styles.fontBold} style={{color: awayScore < homeScore ? "brown" : ""}}>{awayScore}</span>
      </div>
      <div className={styles.teamContainer}>
        <span>{homeTeamName}</span>
        <span className={styles.fontBold} style={{color: homeScore < awayScore ? "brown" : ""}}>{homeScore}</span>
      </div>
    </div>
  );
}
