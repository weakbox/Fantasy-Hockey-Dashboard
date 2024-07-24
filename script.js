// For use within the Stick & Puck Fantasy Hockey League
// Code written and maintained by Connor McLeod

const result = document.getElementById("result");

const scheduleCache = {};
const stickAndPuckLeagueId = "869377698";

setupYearSelectButton("year-select-2024", 2024, stickAndPuckLeagueId);
setupYearSelectButton("doaktown-year-select-2024", 2024, 0);
setupYearSelectButton("year-select-2025", 2025, stickAndPuckLeagueId);

let globalYear = 2025;
let leagueId = stickAndPuckLeagueId;

fetchScheduleData(globalYear, leagueId);

/* FUNCTION DECLARATIONS BELOW: */

function setupYearSelectButton(id, year, leagueId)
{
    button = document.getElementById(id);

    if (!button)
    {
        console.error(`Could not find button with id "${id}".`);
        return;
    }

    button.year = year;
    button.leagueId = leagueId;

    button.addEventListener("click", (event) =>
    {
        clearMatchups();

        globalYear = event.target.year;
        leagueId = event.target.leagueId;

        fetchScheduleData(globalYear, leagueId);
    });
}

function clearMatchups()
{
    result.innerHTML = "";
}

async function fetchScheduleData(year, leagueId)
{
    const url = `https://lm-api-reads.fantasy.espn.com/apis/v3/games/fhl/seasons/${year}/segments/0/leagues/${leagueId}?view=modular&view=mNav&view=mMatchupScore&view=mScoreboard&view=mSettings&view=mTopPerformers&view=mTeam`;

    // Use cache if data has already been fetched:
    if (scheduleCache[`${leagueId}-${year}`])
    {
        displayScheduleData(scheduleCache[`${leagueId}-${year}`]);
        return;
    }

    try 
    {
        console.log(`Fetching from "${url}"`);

        const result = await fetch(url);
        const data = await result.json();

        scheduleCache[`${leagueId}-${year}`] = data;

        console.log("Current cache:", scheduleCache);

        getMatchupPeriodLengths(data, year);
        displayScheduleData(data);
    } 
    catch (error) 
    {
        console.log(error);
        alert(`Something went wrong when trying to fetch the data.`);

        // Reload the page to reset from errors:
        location.reload();
    }
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

function extractMatchupData(matchup, teams)
{   
    const { away: awayStats = null, home: homeStats, matchupPeriodId, playoffTierType, winner } = matchup;

    // Return if matchup was a bye-week:
    if (!awayStats)
    {
        return;
    }

    const { teamId: awayTeamId, totalPoints: awayTotalPoints } = awayStats;
    const { teamId: homeTeamId, totalPoints: homeTotalPoints } = homeStats;

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
    
    scheduleCache[`${leagueId}-${year}`]['matchupPeriodInfo'] = matchupPeriodInfo;
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
    const { start, end } = scheduleCache[`${leagueId}-${year}`].matchupPeriodInfo[matchupPeriodId];

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
        { primary: "#000000", secondary: "#000000" },   /* Default case: */
        { primary: "#ff7b00", secondary: "#ffbc7d" },
        { primary: "#27b500", secondary: "#82d96a" },
        { primary: "#c4aa00", secondary: "#ebda6e" },
        { primary: "#748d99", secondary: "#bce5f7" },
        { primary: "#0040ff", secondary: "#6b90ff" },
        { primary: "#ffdd00", secondary: "#fff08f" },
        { primary: "#ff0000", secondary: "#ff8080" },
        { primary: "#8e47ff", secondary: "#c29cff" },
        { primary: "#00eaf2", secondary: "#99fcff" },
        { primary: "#5c3900", secondary: "#856c45" },
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
