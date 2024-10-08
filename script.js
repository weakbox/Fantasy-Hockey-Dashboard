// For use within the Stick & Puck Fantasy Hockey League
// Code written and maintained by Connor McLeod

/* -------------------- MAIN CODE -------------------- */

const result = document.getElementById("result");

const stickAndPuckLeagueId = "869377698";
const umhlLeagueId = "1017266493";

setupYearSelectButton("umhl-year-select-2025", 2025, umhlLeagueId);
setupYearSelectButton("year-select-2024", 2024, stickAndPuckLeagueId);
setupYearSelectButton("year-select-2025", 2025, stickAndPuckLeagueId);

let scheduleCache = {};
let leagueId = stickAndPuckLeagueId;
let globalYear = 2025;

fetchScheduleData(globalYear, leagueId);

/* -------------------- FUNCTIONS -------------------- */

// Initializes a button with the functionality required to update the results container.
function setupYearSelectButton(id, year, leagueId) {
    button = document.getElementById(id);

    if (!button) {
        console.error(`Could not find button with id "${id}".`);
        return;
    }

    button.leagueId = leagueId;
    button.year = year;

    button.addEventListener("click", (event) => {
        clearMatchups();
        setGlobalLeagueId(event.target.leagueId);
        setGlobalYear(event.target.year);
        fetchScheduleData(globalYear, leagueId);
    });
}

// Sets the global year used to fetch data.
function setGlobalYear(newYear) {
    globalYear = newYear;
}

// Sets the global league ID used to fetch data.
function setGlobalLeagueId(newLeagueId) {
    leagueId = newLeagueId;
}

// Clears the content of the results container.
function clearMatchups() {
    result.innerHTML = "";
}

// Fetches data from ESPN API for the chosen year and league, then displays this data.
async function fetchScheduleData(year, leagueId) {
    const url = `https://lm-api-reads.fantasy.espn.com/apis/v3/games/fhl/seasons/${year}/segments/0/leagues/${leagueId}?view=modular&view=mNav&view=mMatchupScore&view=mScoreboard&view=mSettings&view=mTopPerformers&view=mTeam`;

    // Use cached data if fetch has already occurred:
    if (fetchFromCache(leagueId, year)) {
        displayScheduleData(fetchFromCache(leagueId, year));
        return;
    }

    try {
        const result = await fetch(url);
        const data = await result.json();
        updateCache(leagueId, year, data);
        getMatchupPeriodLengths(data, year);
        displayScheduleData(data);
    } catch (error) {
        console.error(error);
    }
}

// Updates the cache (can this be done more elegantly using the browser cache?).
function updateCache(leagueId, year, data) {
    scheduleCache[`${leagueId}-${year}`] = data;
}

// Fetches data for a specified league and year from the cache.
function fetchFromCache(leagueId, year) {
    return scheduleCache[`${leagueId}-${year}`];
}

function displayScheduleData(data) 
{
    const scheduleArr = data['schedule'];
    const teamsArr = data['teams'];
    const activeMatchupPeriods = data['status']['currentMatchupPeriod'];

    for (let i = 1; i <= activeMatchupPeriods; i++)
    {
        matchupPeriodScheduleArr = scheduleArr.filter((matchup) => matchup['matchupPeriodId'] === i);

        const periodContainer = document.createElement('div');
        periodContainer.id = `matchup-period-container-${i}`;
        periodContainer.classList.add('matchup-period-container');
        addShowAdvancedStatsClickEvent(periodContainer);

        const periodTitle = document.createElement('p');
        periodTitle.classList.add('bubble');
        periodTitle.innerHTML = `<strong>Matchup ${i}</strong>`;

        periodContainer.appendChild(periodTitle);
        result.appendChild(periodContainer);

        matchupPeriodScheduleArr.forEach((matchup) => extractMatchupData(matchup, teamsArr));
    }
}

function addShowAdvancedStatsClickEvent(element)
{
    // Example of event delegation:
    element.addEventListener("click", (event) =>
    {
        // Traverse up the element until the associated matchup container is found:
        const targetElement = event.target.closest(".matchup-container");

        if (targetElement)
        {
            toggleAdvancedStats(targetElement);
        }
    });
}

function toggleAdvancedStats(element)
{
    const 
    {
        matchupPeriod,
        awayAbbrev,
        awayName, 
        awayId,
        awayTotalPoints,
        awayPointsByScoringPeriod,
        homeAbbrev,
        homeName,
        homeId,
        homeTotalPoints,
        homePointsByScoringPeriod,
    } = JSON.parse(element.dataset.matchup);
    
    const canvasId = `chart-${awayAbbrev.toLowerCase()}-${homeAbbrev.toLowerCase()}-${matchupPeriod}`;

    const existingCanvas = document.getElementById(canvasId);

    // Check if canvas already exists:
    if (existingCanvas)
    {
        existingCanvas.remove();
        return;
    }

    const canvas = document.createElement("canvas");
    canvas.id = canvasId;

    // Chart creation has to be deffered to ensure DOM is updated:
    setTimeout(() => 
    {
        plotCumulativeLineChart(canvasId, awayName, homeName, awayId, homeId, awayPointsByScoringPeriod, homePointsByScoringPeriod);
    }, 0);

    element.appendChild(canvas);
}

// Extracts matchup data from index in schedule array. Appends the data inside of the results div.
function extractMatchupData(matchup, teams)
{   
    const { away: awayStats = null, home: homeStats, matchupPeriodId, playoffTierType, winner } = matchup;

    // Bye weeks don't have an away team:
    if (awayStats === null) {
        return;
    }

    const { teamId: awayTeamId } = awayStats;
    const { teamId: homeTeamId } = homeStats;

    // During game days, live points for that day are kept in a new property called totalPointsLive.
    const awayTotalPoints = awayStats.totalPointsLive ? awayStats.totalPointsLive : awayStats.totalPoints;
    const homeTotalPoints = homeStats.totalPointsLive ? homeStats.totalPointsLive : homeStats.totalPoints;

    let { pointsByScoringPeriod: awayPointsByScoringPeriod } = awayStats;
    let { pointsByScoringPeriod: homePointsByScoringPeriod } = homeStats;

    awayPointsByScoringPeriod = pointsObjectToArray(populateMissingKeysInMatchupObject(awayPointsByScoringPeriod, matchupPeriodId, globalYear));
    homePointsByScoringPeriod = pointsObjectToArray(populateMissingKeysInMatchupObject(homePointsByScoringPeriod, matchupPeriodId, globalYear));

    const awayTeam = teams.find((team) => team['id'] === awayTeamId);
    const homeTeam = teams.find((team) => team['id'] === homeTeamId);
    
    const { abbrev: awayAbbrev, logo: awayLogo, name: awayName,  } = awayTeam;
    const { abbrev: homeAbbrev, logo: homeLogo, name: homeName,  } = homeTeam;

    const matchupData = 
    {
        matchupPeriod: matchupPeriodId,

        awayAbbrev: awayAbbrev,
        awayName: awayName,
        awayId: awayTeamId,
        awayTotalPoints: awayTotalPoints,
        awayPointsByScoringPeriod: awayPointsByScoringPeriod,

        homeAbbrev: homeAbbrev,
        homeName: homeName,
        homeId: homeTeamId,
        homeTotalPoints: homeTotalPoints,
        homePointsByScoringPeriod: homePointsByScoringPeriod,
    };

    // Data extraction complete:

    // THIS COULD MOST LIKELY BE MOVED TO A FUNCTION!!!

    const matchupBadge = determineMatchupBadge(awayTotalPoints, homeTotalPoints);
    const matchupPrefix = determineMatchupPrefix(playoffTierType);

    let string = "";

    switch (winner)
    {
        case ("AWAY"):
            string += `
            ${matchupPrefix}
            ${matchupBadge}
            <img src=${awayLogo} class="inline-logo" /> 
            <strong>${awayName}</strong> (${awayTotalPoints}) 
            defeated 
            <img src=${homeLogo} class="inline-logo" /> 
            <strong>${homeName}</strong> (${homeTotalPoints}) 
            `;
            break;

        case ("HOME"):       
            string += `
            ${matchupPrefix}
            ${matchupBadge}
            <img src=${homeLogo} class="inline-logo" /> 
            <strong>${homeName}</strong> (${homeTotalPoints}) 
            defeated 
            <img src=${awayLogo} class="inline-logo" /> 
            <strong>${awayName}</strong> (${awayTotalPoints})
            `;
            break;

        case ("TIE"):
            string += `
            ${matchupPrefix}
            ${matchupBadge}
            The matchup between 
            <img src=${awayLogo} class="inline-logo" /> 
            <strong>${awayName}</strong> (${awayTotalPoints}) 
            and 
            <img src=${homeLogo} class="inline-logo" /> 
            <strong>${homeName}</strong> (${homeTotalPoints}) 
            ended in a tie!
            `;
            break;

        case ("UNDECIDED"):
        {
            string += `
            ${matchupPrefix}
            <img src=${awayLogo} class="inline-logo" /> 
            <strong>${awayName}</strong> (${awayTotalPoints}) 
            versus 
            <img src=${homeLogo} class="inline-logo" /> 
            <strong>${homeName}</strong> (${homeTotalPoints}) 
            `;
            break;
        }

        default:
            console.log("Something went wrong in the switch statement...");
    }

    // Append new div to the container:
    div = document.getElementById(`matchup-period-container-${matchupPeriodId}`);

    const matchupContainerId = `matchup-${awayAbbrev.toLowerCase()}-${homeAbbrev.toLowerCase()}-${matchupPeriodId}`;

    const matchupContainer = document.createElement("div");
    matchupContainer.id = matchupContainerId;
    matchupContainer.classList.add("matchup-container");
    matchupContainer.innerHTML = `<div class="prevent-highlight-cursor">${string}</div>`;

    // Add matchup data as a data attribute:
    matchupContainer.dataset.matchup = JSON.stringify(matchupData);

    div.append(matchupContainer);
}

function plotCumulativeLineChart(canvasId, awayName, homeName, awayId, homeId, awayPoints, homePoints)
{
    const context = document.getElementById(`${canvasId}`).getContext('2d');

    // Dynamically create chart labels:
    let labels = [];
    labels = awayPoints.map((_, index) => labels[index] = `Day ${index + 1}`);

    new Chart(context, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: `${awayName} Cumulative Points`,
                data: cumSum(awayPoints),
                backgroundColor: getTeamColorById(awayId).primary,
                borderColor: getTeamColorById(awayId).primary,
                pointBackgroundColor: getTeamColorById(awayId).primary,
                pointBorderColor: getTeamColorById(awayId).primary,
                borderWidth: 3,
            },
            {
                label: `${awayName} Daily Points`,
                data: awayPoints,
                backgroundColor: getTeamColorById(awayId).secondary,
                borderColor: getTeamColorById(awayId).secondary,
                pointBackgroundColor: getTeamColorById(awayId).secondary,
                pointBorderColor: getTeamColorById(awayId).secondary,
                borderWidth: 3,
                borderDash: [5, 5],
            },
            {
                label: `${homeName} Cumulative Points`,
                data: cumSum(homePoints),
                backgroundColor: getTeamColorById(homeId).primary,
                borderColor: getTeamColorById(homeId).primary,
                pointBackgroundColor: getTeamColorById(homeId).primary,
                pointBorderColor: getTeamColorById(homeId).primary,
                borderWidth: 3,
            },
            {
                label: `${homeName} Daily Points`,
                data: homePoints,
                backgroundColor: getTeamColorById(homeId).secondary,
                borderColor: getTeamColorById(homeId).secondary,
                pointBackgroundColor: getTeamColorById(homeId).secondary,
                pointBorderColor: getTeamColorById(homeId).secondary,
                borderWidth: 3,
                borderDash: [5, 5],
            },
        ],
        },
        options: {
            responsive: true,
            // Set plot to a square canvas:
            aspectRatio: 1,
            plugins: {
                title: {
                    display: true,
                    text: `${awayName} At ${homeName} Results`,
                }
            }
        },
    });
}

function determineMatchupBadge(awayPoints, homePoints)
{
    let badge = "";
    let badgeText = "";
    let matchupBadge = "";

    if (awayPoints === homePoints)
    {
        badge = "⁉️";
        badgeText = "Tied";
    }
    else if (awayPoints - homePoints > 50 || homePoints - awayPoints > 50)
    {
        badge = "💪🏼";
        badgeText = "Dominated";
    }
    else if (Math.abs(awayPoints - homePoints) <= 3)
    {
        badge = "💦";
        badgeText = "Close call";
    }

    if (badge)
    {
        matchupBadge = `<p class="badge" title="${badgeText}">${badge}</p>`;
    }

    return matchupBadge;
}

function determineMatchupPrefix(type)
{
    let prefix = "";
    let prefixText = "";

    switch (type)
    {
        case ("WINNERS_BRACKET"):
            prefix = "🏆";
            prefixText = "Playoff Match";
            break;

        default:
    }

    if (prefix)
    {
        prefix = `<p class="badge" title="${prefixText}">${prefix}</p>`;
    }

    return prefix;
}

function isChampionshipMatch(matchType)
{
    return matchType == "WINNERS_BRACKET";
}

function getMatchupPeriodLengths(data, year)
{
    // Dummy entry to avoid an off-by-one error:
    let matchupPeriodInfo = [
        {
            period: 0,
            length: 0,
            start: undefined,
            end: undefined,
        }
    ];

    const latestMatchupPeriod = data.status.currentMatchupPeriod;
    const matchups = data.schedule;

    for (let i = 1; i <= latestMatchupPeriod; i++)
    {
        const matchupsInMatchupPeriod = matchups.filter((match) => match.matchupPeriodId === i);

        let startArray = [];
        let endArray = [];

        matchupsInMatchupPeriod.forEach((match) => 
        {
            // Example of optional chaining:
            const awayKeys = match.away?.pointsByScoringPeriod;
            const homeKeys = match.home?.pointsByScoringPeriod;

            if (!homeKeys)
            {
                return;
            }

            startArray.push(getMinKey(homeKeys));
            endArray.push(getMaxKey(homeKeys));

            if (!awayKeys)
            {
                return;
            }

            startArray.push(getMinKey(awayKeys));
            endArray.push(getMaxKey(awayKeys));
        });

        const start = startArray.length > 0 ? startArray.reduce((a, b) => Math.min(a, b)) : 0;
        const end = endArray.length > 0 ? endArray.reduce((a, b) => Math.max(a, b)) : 0;

        const length = (end + 1) - start;

        let info = {};

        info['period'] = i;
        info['start'] = start;
        info['end'] = end;
        info['length'] = length;

        matchupPeriodInfo.push(info);
    }
    
    fetchFromCache(leagueId, year)['matchupPeriodInfo'] = matchupPeriodInfo;
}

function getMinKey(keyArray)
{
    return Number(Object.keys(keyArray)[0]);
}

function getMaxKey(keyArray)
{
    const keys = Object.keys(keyArray);

    return Number(keys[keys.length - 1]);
}

function populateMissingKeysInMatchupObject(pointsByScoringPeriodObject, matchupPeriodId, year)
{
    const { start, end } = fetchFromCache(leagueId, year).matchupPeriodInfo[matchupPeriodId];

    for (let i = start; i <= end; i++)
    {
        if (pointsByScoringPeriodObject && !pointsByScoringPeriodObject.hasOwnProperty(i))
        {
            pointsByScoringPeriodObject[i] = 0;
            // console.log("Hit:", matchupPeriodId);
        }
    }

    return pointsByScoringPeriodObject;
}

function getTeamColorById(teamId)
{
    const colors = 
    [
        { team: "NULL", primary: "#000000", secondary: "#000000" },   /* Default case: */
        { team: "Lance", primary: "rgb(206, 161, 16)", secondary: "rgb(161, 127, 14)" },
        { team: "Connor", primary: "rgb(15, 155, 85)", secondary: "rgb(13, 122, 68)" },
        { team: "Stephen", primary: "rgb(116, 236, 80)", secondary: "rgb(105, 199, 77)" },
        { team: "Gillian", primary: "rgb(174, 85, 226)", secondary: "rgb(139, 69, 180)" },
        { team: "Jacob", primary: "rgb(0, 64, 255)", secondary: "rgb(107, 144, 255)" },
        { team: "Daniel", primary: "rgb(92, 92, 92)", secondary: "rgb(61, 61, 61)" },
        { team: "Patrick", primary: "rgb(255, 208, 0)", secondary: "rgb(253, 224, 92)" },
        { team: "Zander", primary: "rgb(255, 71, 194)", secondary: "rgb(197, 56, 150)" },
        { team: "John", primary: "rgb(0, 186, 242)", secondary: "rgb(3, 152, 197)" },
        { team: "Jonathan", primary: "rgb(255, 94, 0)", secondary: "rgb(209, 77, 0)" },
        { team: "NULL", primary: "#000000", secondary: "#000000" },
        { team: "Evan", primary: "rgb(224, 13, 13)", secondary: "#b10101" },
    ];

    // Handle case where a team has not been provided a color:
    if (teamId > colors.length - 1)
    {
        return colors[0];
    }

    return colors[teamId];
}

function pointsObjectToArray(pointsObject)
{
    let array = [];

    if (!pointsObject)
    {
        return array;
    }

    Object.keys(pointsObject).map((key) => array.push(pointsObject[key]));

    return array;
}

function cumSum(array)
{
    let cumSumArray = [array[0]];

    for (let i = 1; i < array.length; i++)
    {
        cumSumArray.push(array[i] + cumSumArray[i - 1]);
    }

    return cumSumArray;
}
