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
        console.log("RAW SCHEDULE DATA EXPORT: ", scheduleData);
        displayScheduleData(scheduleData);
    })
    .catch((err) => { 
        console.log(err); 
    });

function displayScheduleData(data) 
{
    const scheduleArr = data['schedule'];
    const teamsArr = data['teams'];

    console.log("Schedule Array: ", scheduleArr, "Length: ", scheduleArr.length);
    console.log("Teams Array: ", teamsArr);

    scheduleArr.forEach((matchup, index) => 
    {
        const awayTeam = matchup?.away ?? null;
        const homeTeam = matchup['home'];

        if (awayTeam == null || homeTeam == null)
        {
            console.log("Encountered null at index: ", index);
            return;
        }
        
        const awayTeamName = teamsArr.find((team) => team['id'] == awayTeam['teamId'])['name'].toLowerCase();
        const homeTeamName = teamsArr.find((team) => team['id'] == homeTeam['teamId'])['name'].toLowerCase();

        // TODO: Fix this repetitive code.
        const awayTeamLogo =  teamsArr.find((team) => team['id'] == awayTeam['teamId'])['logo'];
        const homeTeamLogo =  teamsArr.find((team) => team['id'] == homeTeam['teamId'])['logo'];

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

        result.innerHTML += `<div class="matchup-container">${string}</div>`;
    });
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
