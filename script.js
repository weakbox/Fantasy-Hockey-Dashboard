const result = document.getElementById("result");
const select2024Button = document.getElementById("select-2024-button");
const select2025Button = document.getElementById("select-2025-button");

const defaultYear = 2025;

// const draftUrl = "https://lm-api-reads.fantasy.espn.com/apis/v3/games/fhl/seasons/2024/segments/0/leagues/869377698?view=mDraftDetail&view=mSettings&view=mTeam&view=modular&view=mNav";
// const playersUrl = "https://lm-api-reads.fantasy.espn.com/apis/v3/games/fhl/seasons/2024/players?scoringPeriodId=0&view=players_wl";
const scoreboardUrl = `https://lm-api-reads.fantasy.espn.com/apis/v3/games/fhl/seasons/${defaultYear}/segments/0/leagues/869377698?view=modular&view=mNav&view=mMatchupScore&view=mScoreboard&view=mSettings&view=mTopPerformers&view=mTeam`;

// Fetch schedule information:
fetch(scoreboardUrl)
    .then((res) => res.json())
    .then((data) => {
        // console.log("Raw data: ", data);
        displayScheduleData(data);
    })
    .catch((err) => { 
        console.log("Error logged: ", err); 
    });

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

    switch (winner)
    {
        case ("AWAY"):
            string += `
            <img src=${awayTeamLogo} class="inline-logo" /> 
            <strong>${awayTeamName}</strong> (${awayTotalPoints}) 
            defeated 
            <img src=${homeTeamLogo} class="inline-logo" /> 
            <strong>${homeTeamName}</strong> (${homeTotalPoints}) 
            `;
            break;

        case ("HOME"):       
            string += `
            <img src=${homeTeamLogo} class="inline-logo" /> 
            <strong>${homeTeamName}</strong> (${homeTotalPoints}) 
            defeated 
            <img src=${awayTeamLogo} class="inline-logo" /> 
            <strong>${awayTeamName}</strong> (${awayTotalPoints})
            `;
            break;

        case ("TIE"):
            string += `
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
    div.innerHTML += `<div class="matchup-container">${string}</div>`;
}

select2024Button.addEventListener("click", showData);
select2024Button.year = 2024;

select2025Button.addEventListener("click", showData);
select2025Button.year = 2025;

function showData(event)
{
    const year = event.target.year;
    const url = `https://lm-api-reads.fantasy.espn.com/apis/v3/games/fhl/seasons/${year}/segments/0/leagues/869377698?view=modular&view=mNav&view=mMatchupScore&view=mScoreboard&view=mSettings&view=mTopPerformers&view=mTeam`;

    clearData();

    // Fetch schedule information:
    fetch(url)
        .then((res) => res.json())
        .then((data) => 
        {
            displayScheduleData(data);
        })
        .catch((err) => { 
            console.log("Error logged: ", err); 
        });
}

function clearData()
{
    result.innerHTML = "";
}

// Unused code:

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
