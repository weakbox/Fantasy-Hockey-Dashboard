import styles from "./MatchupCard.module.css";

export default function MatchupCard({awayTeamName, awayTeamLogo, awayScore, homeTeamName, homeTeamLogo, homeScore}) {
  return (
    <div className={styles.container}>
      <img className={styles.logo} src={awayTeamLogo} />
      <div className={styles.titleContainer}>
        <div>
          <span className={styles.teamName}>{awayTeamName.toUpperCase()}</span>
          <span> VS </span>
          <span className={styles.teamName}>{homeTeamName.toUpperCase()}</span>
        </div>
        <div className={styles.score}>{awayScore} — {homeScore}</div>
      </div>
      <img className={styles.logo} src={homeTeamLogo} />
    </div>
  );
}