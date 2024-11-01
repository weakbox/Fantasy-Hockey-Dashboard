import styles from "./HeadToHead.module.css";

const statMap = {
  "G": "Goals",
  "A": "Assists",
  "PPP": "Power-Play Points",
  "SHP": "Short-Handed Points",
  "SOG": "Shots on Goal",
  "HIT": "Hits",
  "BLK": "Blocked Shots",
  "W": "Wins",
  "GA": "Goals Against",
  "SV": "Saves",
  "SO": "Shutouts",
  "OTL": "Overtime Losses",
};

// Advanced stats ideas:
// Goalies removed
// Periphrials
// Power play removed
// Peripohrials removed

export default function HeadToHead({ awayAbbrev="Away", awayLineup=[], homeAbbrev="Home", homeLineup=[] }) {
  const calculateStatAmounts = (lineup) => {
    const statTotals = new Map();

    lineup.forEach(({ pointsBreakdown }) => {
      for (const [key, value] of Object.entries(pointsBreakdown)) {
        statTotals.set(key, (statTotals.get(key) || 0) + value);
      }
    });

    return statTotals;
  };

  const compareStats = (awayLineup, homeLineup) => {
    const awayTotals = calculateStatAmounts(awayLineup);
    const homeTotals = calculateStatAmounts(homeLineup);

    const comparision = {};

    for (const [key, value] of Object.entries(statMap)) {
      const away = awayTotals.get(key) || 0;
      const home = homeTotals.get(key) || 0;

      comparision[value] = { away, home };
    }

    return comparision;
  };

  const renderComparision = (awayLineup, homeLineup) => {
    const results = compareStats(awayLineup, homeLineup);
    
    // To fixed usage may be too imprecise for certain leagues.
    return (
      <>
        {Object.entries(results).map(([statName, { away, home }]) => (
          <div key={statName} className={styles.statContainer}>
            <span style={{color: away < home ? "brown" : ""}}>{away.toFixed(1)}</span>
            <span>{statName}</span>
            <span style={{color: home < away ? "brown" : ""}}>{home.toFixed(1)}</span>
          </div>
        ))}
      </>
    );
  };

  return (
    <div className={styles.container}>
      <div className={`${styles.statContainer} ${styles.bold}`}>
        <span>{awayAbbrev}</span>
        <span>Points Earned from Stat</span>
        <span>{homeAbbrev}</span>
      </div>
      {renderComparision(awayLineup, homeLineup)}
    </div>
  );
}
