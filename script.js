const result = document.getElementById("result");

let draftData = [];
let scheduleData = [];

// Insert relevent API parameters into local database:
let localDatabase = {};

const draftUrl = "https://lm-api-reads.fantasy.espn.com/apis/v3/games/fhl/seasons/2024/segments/0/leagues/869377698?view=mDraftDetail&view=mSettings&view=mTeam&view=modular&view=mNav";
const playersUrl = "https://lm-api-reads.fantasy.espn.com/apis/v3/games/fhl/seasons/2024/players?scoringPeriodId=0&view=players_wl"
const scoreboardUrl = "https://lm-api-reads.fantasy.espn.com/apis/v3/games/fhl/seasons/2024/segments/0/leagues/869377698?view=modular&view=mNav&view=mMatchupScore&view=mScoreboard&view=mSettings&view=mTopPerformers&view=mTeam"

// Fetch schedule information:
fetch(scoreboardUrl)
    .then((res) => res.json())
    .then((data) => {
        scheduleData = structuredClone(data);
        // console.log("RAW SCHEDULE DATA EXPORT: ", scheduleData);
        displayScheduleData(scheduleData);
    })
    .catch((err) => { 
        console.log(err); 
    });

function displayScheduleData(data) 
{
    const scheduleArr = data['schedule'];
    const teamsArr = data['teams'];
    const activeMatchupPeriods = data['status']['currentMatchupPeriod'];

    console.log("Schedule Array: ", scheduleArr, "Length: ", scheduleArr.length);
    console.log("Teams Array: ", teamsArr);
    console.log(`Found ${activeMatchupPeriods} active matchup periods.`);

    // Extract data from each matchup period one at a time.
    for (let i = 1; i <= activeMatchupPeriods; i++)
    {
        console.log(`Filtering matchup period ${i}: `);

        matchupPeriodScheduleArr = scheduleArr.filter((matchup) => matchup['matchupPeriodId'] === i);

        console.log(matchupPeriodScheduleArr);

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
    const { matchupPeriodId } = matchup;

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
    
    const awayPointsArr = pointsObjToArr(awayTeam['pointsByScoringPeriod']);
    const homePointsArr = pointsObjToArr(homeTeam['pointsByScoringPeriod']);

    let string = "";

    if (awayTotalPoints === homeTotalPoints)
    {
        string += `
        The matchup between 
        <img src=${awayTeamLogo} class="inline-logo" /> 
        <strong>${awayTeamName}</strong> (${awayTotalPoints}) 
        and 
        <img src=${homeTeamLogo} class="inline-logo" /> 
        <strong>${homeTeamName}</strong> (${homeTotalPoints}) 
        ended in a tie!
        `;
    } 
    else if (awayTotalPoints > homeTotalPoints)
    {
        string += `
        <img src=${awayTeamLogo} class="inline-logo" /> 
        <strong>${awayTeamName}</strong> (${awayTotalPoints}) 
        defeated 
        <img src=${homeTeamLogo} class="inline-logo" /> 
        <strong>${homeTeamName}</strong> (${homeTotalPoints}) 
        `;
    }
    else // Home team won:
    {
        string += `
        <img src=${homeTeamLogo} class="inline-logo" /> 
        <strong>${homeTeamName}</strong> (${homeTotalPoints}) 
        defeated 
        <img src=${awayTeamLogo} class="inline-logo" /> 
        <strong>${awayTeamName}</strong> (${awayTotalPoints})
        `;
    }

    div = document.getElementById(`matchup-period-container-${matchupPeriodId}`);
    div.innerHTML += `<div class="matchup-container">${string}</div>`;
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

function createPlot(chartId)
{
    const canvas = document.createElement("canvas");
    canvas.id = chartId;
    result.appendChild(canvas);

    const context = canvas.getContext('2d');
    
    new Chart(context, 
    {
        type: 'bar',
        data: {
            labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
            datasets: [{
                label: '# of Votes',
                data: [12, 19, 3, 5, 2, 3],
                borderWidth: 1
            }]
            },
            options: {
            scales: {
                y: {
                beginAtZero: true
                }
            }
        }
    });
    console.log("made the chart?");
}
