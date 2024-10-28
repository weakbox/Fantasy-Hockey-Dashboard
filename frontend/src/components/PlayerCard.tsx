import styles from "./PlayerCard.module.css";

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
    primary: "hsl(5, 95%, 50%)",
    secondary: "hsl(0, 0%, 99%)",
    tertiary: "hsl(35, 49%, 56%)",
  },
  "Boston Bruins": {
    primary: "hsl(43, 100%, 50%)",
    secondary: "hsl(0, 0%, 0%)",
    tertiary: "hsl(0, 0%, 100%)",
  },
  "Buffalo Sabres": {
    primary: "hsl(221, 100%, 27%)",
    secondary: "hsl(44, 98%, 50%)",
    tertiary: "hsl(0, 0%, 100%)",
  },
  "Calgary Flames": {
    primary: "hsl(356, 100%, 41%)",
    secondary: "hsl(36, 95%, 53%)",
    tertiary: "hsl(0, 0%, 100%)",
  },
  "Carolina Hurricanes": {
    primary: "hsl(204, 30%, 21%)",
    secondary: "hsl(350, 94%, 47%)",
    tertiary: "hsl(191, 10%, 70%)",
  },
  "Chicago Blackhawks": {
    primary: "hsl(352, 80%, 50%)",
    secondary: "hsl(0, 0%, 100%)",
    tertiary: "hsl(0, 0%, 0%)",
  },
  "Colorado Avalanche": {
    primary: "hsl(347, 55%, 34%)",
    secondary: "hsl(202, 100%, 29%)",
    tertiary: "hsl(210, 9%, 70%)",
  },
  "Columbus Blue Jackets": {
    primary: "hsl(218, 100%, 13%)",
    secondary: "hsl(350, 95%, 47%)",
    tertiary: "hsl(192, 8%, 65%)",
  },
  "Dallas Stars": {
    primary: "hsl(156, 100%, 21%)",
    secondary: "hsl(0, 0%, 100%)",
    tertiary: "hsl(0, 0%, 0%)",
  },
  "Detroit Red Wings": {
    primary: "hsl(357, 79%, 48%)",
    secondary: "hsl(0, 0%, 100%)",
    tertiary: "hsl(0, 0%, 100%)",
  },
  "Edmonton Oilers": {
    primary: "hsl(16, 100%, 50%)",
    secondary: "hsl(222, 98%, 14%)",
    tertiary: "hsl(0, 0%, 100%)",
  },
  "Florida Panthers": {
    primary: "hsl(355, 100%, 39%)",
    secondary: "hsl(219, 82%, 14%)",
    tertiary: "hsl(39, 29%, 55%)",
  },
  "Los Angeles Kings": {
    primary: "hsl(0, 0%, 7%)",
    secondary: "hsl(192, 9%, 66%)",
    tertiary: "hsl(0, 0%, 100%)",
  },
  "Minnesota Wild": {
    primary: "hsl(160, 100%, 13%)",
    secondary: "hsl(35, 56%, 77%)",
    tertiary: "hsl(352, 83%, 43%)",
  },
  "Montréal Canadiens": {
    primary: "hsl(350, 83%, 42%)",
    secondary: "hsl(215, 88%, 27%)",
    tertiary: "hsl(0, 0%, 100%)",
  },
  "Nashville Predators": {
    primary: "hsl(40, 98%, 59%)",
    secondary: "hsl(212, 98%, 19%)",
    tertiary: "hsl(0, 0%, 100%)",
  },
  "New Jersey Devils": {
    primary: "hsl(0, 100%, 47%)",
    secondary: "hsl(0, 0%, 0%)",
    tertiary: "hsl(0, 0%, 100%)",
  },
  "New York Islanders": {
    primary: "hsl(211, 100%, 28%)",
    secondary: "hsl(21, 100%, 54%)",
    tertiary: "hsl(0, 0%, 100%)",
  },
  "New York Rangers": {
    primary: "hsl(211, 100%, 30%)",
    secondary: "hsl(354, 79%, 50%)",
    tertiary: "hsl(0, 0%, 100%)",
  },
  "Ottawa Senators": {
    primary: "hsl(0, 0%, 0%)",
    secondary: "hsl(355, 100%, 39%)",
    tertiary: "hsl(36, 49%, 55%)",
  },
  "Philadelphia Flyers": {
    primary: "hsl(16, 100%, 47%)",
    secondary: "hsl(0, 0%, 100%)",
    tertiary: "hsl(0, 0%, 0%)",
  },
  "Pittsburgh Penguins": {
    primary: "hsl(0, 0%, 0%)",
    secondary: "hsl(46, 99%, 53%)",
    tertiary: "hsl(0, 0%, 100%)",
  },
  "St. Louis Blues": {
    primary: "hsl(220, 100%, 27%)",
    secondary: "hsl(45, 100%, 58%)",
    tertiary: "hsl(0, 0%, 100%)",
  },
  "San Jose Sharks": {
    primary: "hsl(188, 100%, 27%)",
    secondary: "hsl(0, 0%, 100%)",
    tertiary: "hsl(32, 88%, 53%)",
  },
  "Seattle Kraken": {
    primary: "hsl(210, 94%, 8%)",
    secondary: "hsl(180, 58%, 64%)",
    tertiary: "hsl(350, 94%, 47%)",
  },
  "Tampa Bay Lightning": {
    primary: "hsl(0, 0%, 100%)",
    secondary: "hsl(223, 100%, 18%)",
    tertiary: "hsl(0, 0%, 0%)",
  },
  "Toronto Maple Leafs": {
    primary: "hsl(223, 100%, 18%)",
    secondary: "hsl(0, 0%, 100%)",
    tertiary: "hsl(0, 0%, 100%)",
  },
  "Utah Hockey Club": {
    primary: "hsl(0, 0%, 1%)",
    secondary: "hsl(200, 66%, 65%)",
    tertiary: "hsl(0, 0%, 100%)",
  },
  "Vancouver Canucks": {
    primary: "hsl(223, 100%, 18%)",
    secondary: "hsl(146, 100%, 26%)",
    tertiary: "hsl(0, 0%, 100%)",
  },
  "Vegas Golden Knights": {
    primary: "hsl(35, 49%, 56%)",
    secondary: "hsl(200, 27%, 17%)",
    tertiary: "hsl(355, 100%, 39%)",
  },
  "Washington Capitals": {
    primary: "hsl(351, 95%, 47%)",
    secondary: "hsl(219, 97%, 13%)",
    tertiary: "hsl(0, 0%, 100%)",
  },
  "Winnipeg Jets": {
    primary: "hsl(218, 100%, 13%)",
    secondary: "hsl(192, 8%, 65%)",
    tertiary: "hsl(209, 71%, 47%)",
  },
};

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

export function PlayerCard({name, headshotURL, proTeam, proTeamLogoURL, position, points, pointsBreakdown}: Player) {
  
  const teamColors = proTeamColorMap[proTeam] || { 
    primary: "black", 
    secondary: "white", 
    tertiary: "white" 
  };

  // Get the top N stats from the pointsBreakdown:
  const getTopStats = (n: number) => Object.entries(pointsBreakdown).sort((a, b) => b[1] - a[1]).slice(0, n);

  const renderTopStats = () => getTopStats(2).map(stat => <span>{stat[0]}: {stat[1].toFixed(1)}</span>); // Fix unique key problem.

  // Bug here for names with a space (Joel Eriksson Ek).
  const splitNames = (fullName: string) => {
    return fullName.split(' ');
  };

  return (
    <div className={styles.container} style={{backgroundColor: teamColors.primary}}>
      <div className={styles.titleContainer} style={{color: teamColors.secondary}}>
        <span className="player-firstname font-rubik-600">{splitNames(name)[0].toUpperCase()}</span>
        <span className="player-lastname font-rubik-900">{splitNames(name)[1].toUpperCase()}</span>
      </div>
      <span className="player-subtitle font-rubik-600" style={{color: teamColors.tertiary}}>{positionMap[position] || "N/A"} — {proTeam}</span>
      <div className={styles.pictureContainer}>
        <img className={styles.teamLogo} src={proTeamLogoURL}/>
        <img className={styles.headshot} src={headshotURL}/>
      </div>
      <div className={styles.divider} style={{backgroundColor: teamColors.tertiary}}></div>
      <div className={styles.statsContainer} style={{color: teamColors.secondary}}>
        <span className="player-stats-top1 font-rubik-900">POINTS: {points}</span>
        <span className="player-stats-top2 font-rubik-600">{renderTopStats()}</span>
      </div>
    </div>
  );
}

export function PlayerCardList({name, headshotURL, proTeam, proTeamLogoURL, position, points, pointsBreakdown}: Player) {
  return (
    <div className={styles.listContainer}>{name}</div>
  );
}
