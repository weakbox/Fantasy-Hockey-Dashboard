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
select2025Button.addEventListener("click", (event) =>
{
    const year = event.target.year;
    clearData();
    fetchScheduleData(year);
});

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
        displayScheduleData(data);
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

    // console.log("Schedule Array: ", scheduleArr, "Length: ", scheduleArr.length);
    // console.log("Teams Array: ", teamsArr);
    // console.log(`Found ${activeMatchupPeriods} active matchup periods.`);

    // Extract data from each matchup period one at a time.
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

    // TODO: Fix this code block when viewing data from 2025.
    // const awayPointsArr = pointsObjToArr(awayTeam['pointsByScoringPeriod']);
    // const homePointsArr = pointsObjToArr(homeTeam['pointsByScoringPeriod']);

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

function pointsObjToArr(obj)
{
    let pointsArr = [];
    const keysArr = Object.keys(obj);
    
    keysArr.forEach((key) => 
    {
        pointsArr.push(obj[key]);
    });
    
    return pointsArr;
}
