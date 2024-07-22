// For use within the Stick & Puck Fantasy Hockey League
// Code written and maintained by Connor McLeod

const result = document.getElementById("result");
const select2024Button = document.getElementById("select-2024-button");
const select2025Button = document.getElementById("select-2025-button");

const scheduleCache = {};

// Onclick declarations (can be function-atized):

select2024Button.year = 2024;
select2024Button.addEventListener("click", (event) =>
{
    const year = event.target.year;
    clearData();
    fetchScheduleData(year);
});

select2025Button.year = 2025;
// select2025Button.addEventListener("click", (event) =>
// {
//     const year = event.target.year;
//     clearData();
//     fetchScheduleData(year);
// });

// Default behavior:

const defaultYear = 2024;
fetchScheduleData(defaultYear);

async function fetchScheduleData(year)
{
    const url = `https://lm-api-reads.fantasy.espn.com/apis/v3/games/fhl/seasons/${year}/segments/0/leagues/869377698?view=modular&view=mNav&view=mMatchupScore&view=mScoreboard&view=mSettings&view=mTopPerformers&view=mTeam`;

    // Use cache if data has already been fetched:
    if (scheduleCache[year])
    {
        displayScheduleData(scheduleCache[year]);
        return;
    }

    // Fetch if data was not present in the cache:
    try 
    {
        const result = await fetch(url);
        const data = await result.json();
        scheduleCache[year] = data;
        getMatchupPeriodLengths(data, year);
        displayScheduleData(data);
        console.log(scheduleCache);
    } 
    catch (error) 
    {
        alert(`Something went wrong when trying to fetch the data for year "${year}".`);
        console.log(error);
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

        result.innerHTML += `
            <div id="matchup-period-container-${i}" class="matchup-period-container">
                <p class="bubble"><strong>Matchup ${i}</strong></p>
            <div>
        `;

        matchupPeriodScheduleArr.forEach((matchup) => extractMatchupData(matchup, teamsArr));
    }
}

function extractMatchupData(matchup, teams)
{   
    const { matchupPeriodId, winner } = matchup;

    const awayTeam = matchup?.away ?? null;
    const homeTeam = matchup['home'];

    // Check if match was actually a bye-week.
    if (awayTeam == null || homeTeam == null)
    {
        return;
    }
    
    const awayTeamName = teams.find((team) => team['id'] == awayTeam['teamId'])['name'];
    const homeTeamName = teams.find((team) => team['id'] == homeTeam['teamId'])['name'];

    // TODO: Fix this repetitive code.
    const awayTeamLogo =  teams.find((team) => team['id'] == awayTeam['teamId'])['logo'];
    const homeTeamLogo =  teams.find((team) => team['id'] == homeTeam['teamId'])['logo'];

    const awayTotalPoints = awayTeam['totalPoints'];
    const homeTotalPoints = homeTeam['totalPoints'];

    let string = "";

    const matchupBadge = determineMatchupBadge(awayTotalPoints, homeTotalPoints);
    const matchupPrefix = determineMatchupPrefix(matchup.playoffTierType);

    switch (winner)
    {
        case ("AWAY"):
            string += `
            ${matchupPrefix}
            ${matchupBadge}
            <img src=${awayTeamLogo} class="inline-logo" /> 
            <strong>${awayTeamName}</strong> (${awayTotalPoints}) 
            defeated 
            <img src=${homeTeamLogo} class="inline-logo" /> 
            <strong>${homeTeamName}</strong> (${homeTotalPoints}) 
            `;
            break;

        case ("HOME"):       
            string += `
            ${matchupPrefix}
            ${matchupBadge}
            <img src=${homeTeamLogo} class="inline-logo" /> 
            <strong>${homeTeamName}</strong> (${homeTotalPoints}) 
            defeated 
            <img src=${awayTeamLogo} class="inline-logo" /> 
            <strong>${awayTeamName}</strong> (${awayTotalPoints})
            `;
            break;

        case ("TIE"):
            string += `
            ${matchupPrefix}
            ${matchupBadge}
            The matchup between 
            <img src=${awayTeamLogo} class="inline-logo" /> 
            <strong>${awayTeamName}</strong> (${awayTotalPoints}) 
            and 
            <img src=${homeTeamLogo} class="inline-logo" /> 
            <strong>${homeTeamName}</strong> (${homeTotalPoints}) 
            ended in a tie!
            `;
            break;

        case ("UNDECIDED"):
        {
            string += `
            ${matchupPrefix}
            <img src=${awayTeamLogo} class="inline-logo" /> 
            <strong>${awayTeamName}</strong> (${awayTotalPoints}) 
            versus 
            <img src=${homeTeamLogo} class="inline-logo" /> 
            <strong>${homeTeamName}</strong> (${homeTotalPoints}) 
            `;
            break;
        }

        default:
            console.log("Something went wrong in the switch statement...");
    }

    div = document.getElementById(`matchup-period-container-${matchupPeriodId}`);
    
    if (isChampionshipMatch(matchup.playoffTierType))
    {
        div.innerHTML += `<div class="matchup-container championship-match">${string}</div>`;
    }
    else
    {
        div.innerHTML += `<div class="matchup-container">${string}</div>`;
    }

    // **************** Chart test: ********************
    result.innerHTML += `
        <div>
            <canvas id="chart-${matchupPeriodId}-${awayTeamName}-${homeTeamName}" width="200" height="200"></canvas>
        </div>
    `;

    // TODO: Fix this code block when viewing data from 2025:
    const awayPointsArr = awayTeam['pointsByScoringPeriod'];
    const homePointsArr = homeTeam['pointsByScoringPeriod'];

    populateMissingKeysInMatchupObject(awayPointsArr, matchupPeriodId, 2024);
    populateMissingKeysInMatchupObject(homePointsArr, matchupPeriodId, 2024);

    // Defer the chart creation to ensure the DOM is updated TODO: Understand this!
    setTimeout(() => {
        const context = document.getElementById(`chart-${matchupPeriodId}-${awayTeamName}-${homeTeamName}`);

        new Chart(context, {
            type: 'line',
            data: {
                datasets: [{
                    label: `${homeTeamName} Points`,
                    data: homePointsArr,
                    borderWidth: 3,
                    borderColor: getTeamColorById(awayTeam.teamId),
                },
                {
                    label: `${awayTeamName} Points`,
                    data: awayPointsArr,
                    borderWidth: 3,
                    borderColor: getTeamColorById(homeTeam.teamId),
                }],
                
            },
            options: {
                scales: {
                    y: {
                        // beginAtZero: true
                    }
                }
            },
        });
    }, 0);

}

function createNumberedLabels(length)
{
    let labels = [];

    for (let i = 0; i < length; i++)
    {
        labels.push(i + 1);
    }

    return labels;
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

function clearData()
{
    result.innerHTML = "";
}

function determineMatchupBadge(awayPoints, homePoints)
{
    let badge = "";
    let badgeText = "";
    let matchupBadge = "";

    if (awayPoints === homePoints)
    {
        badge = "⁉️";
        badgeText = "Matchup ended in a tie! What are the odds!";
    }
    else if (awayPoints - homePoints > 50 || homePoints - awayPoints > 50)
    {
        badge = "💪🏼";
        badgeText = "Dominated! Match was decided by over 50 points!";
    }
    else if (Math.abs(awayPoints - homePoints) <= 3)
    {
        badge = "💦";
        badgeText = "Close call! Match was decided by less than 3 points!";
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
            prefixText = "Championship Match";
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

        const start = startArray.reduce((a, b) => Math.min(a, b));
        const end = endArray.reduce((a, b) => Math.max(a, b));
        const length = (end + 1) - start;

        let info = {};

        info['period'] = i;
        info['start'] = start;
        info['end'] = end;
        info['length'] = length;

        matchupPeriodInfo.push(info);
    }
    
    scheduleCache[year]['matchupPeriodInfo'] = matchupPeriodInfo;
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
    const { start, end } = scheduleCache[year].matchupPeriodInfo[matchupPeriodId];

    for (let i = start; i <= end; i++)
    {
        if (!pointsByScoringPeriodObject.hasOwnProperty(i))
        {
            pointsByScoringPeriodObject[i] = 0;
            console.log("Hit:", matchupPeriodId);
        }
    }

    return pointsByScoringPeriodObject;
}

function getTeamColorById(teamId)
{
    const colors = [
        "#000000",
        "#ff6600",
        "#33cc33",
        "#cc6600",
        "#666699",
        "#000099",
        "#ffcc00",
        "#ff0000",
        "#6600ff",
        "#00ccff",
        "#663300",
    ];
    return colors[teamId];
}
