const result = document.getElementById("result");

// Testing an API fetch:
let draftData = [];
let scheduleData = [];

const draftUrl = "https://lm-api-reads.fantasy.espn.com/apis/v3/games/fhl/seasons/2024/segments/0/leagues/869377698?view=mDraftDetail&view=mSettings&view=mTeam&view=modular&view=mNav";
const playersUrl = "https://lm-api-reads.fantasy.espn.com/apis/v3/games/fhl/seasons/2024/players?scoringPeriodId=0&view=players_wl"
const scoreboardUrl = "https://lm-api-reads.fantasy.espn.com/apis/v3/games/fhl/seasons/2024/segments/0/leagues/869377698?view=modular&view=mNav&view=mMatchupScore&view=mScoreboard&view=mSettings&view=mTopPerformers&view=mTeam"

// Fetch team/member info:
// fetch(draftUrl)
//     .then((res) => res.json())
//     .then((data) => {
//         draftData = structuredClone(data);
//         // console.log("RAW DRAFT DATA EXPORT: ", draftData);
//         displayDraftData(draftData);
//     })
//     .catch((err) => { 
//         result.innerText = "There was a problem fetching the data!" 
//     });

// // Fetch schedule information:
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
 
function displayDraftData(data) 
{
    const members = data['members'];
    const teams = data['teams'];

    let index = 0;

    members.forEach((member) => 
    {
        const firstName = member['firstName'];
        const lastName = member['lastName'];

        const id = member['id'];
        
        // Find the team associated with the member's ID:
        const team = teams.find((team) => team['owners'].includes(id));

        const teamName = team['name'];
        const teamAbbrev = team['abbrev'];

        const teamLogoSrc = team['logo'];
        const teamPoints = team['points'];

        result.innerHTML +=  `
            <img src="${teamLogoSrc}" class="team-logo" />
            <p>${firstName} ${lastName}, the manager of (the) <strong>${teamName} (${teamAbbrev})</strong>.\n</p>
            <p>This team finished the season with <strong>${teamPoints.toFixed(1)}</strong> points.</p>
            <hr></hr>
        `;
    })
}

function displayScheduleData(data) 
{
    const scheduleArr = data['schedule'];
    const teamsArr = data['teams'];

    console.log("Schedule Array: ", scheduleArr, "Length: ", scheduleArr.length);
    console.log("Teams Array: ", teamsArr);

    scheduleArr.forEach((matchup, index) => 
    {
        const awayTeam = matchup['away'];
        const homeTeam = matchup['home'];

        const awayTeamName = teamsArr.find((team) => team['id'] == awayTeam['teamId'])['name'].toLowerCase();
        const homeTeamName = teamsArr.find((team) => team['id'] == homeTeam['teamId'])['name'].toLowerCase();

        // TODO: Fix this repetitive code.
        const awayTeamLogo =  teamsArr.find((team) => team['id'] == awayTeam['teamId'])['logo'];
        const homeTeamLogo =  teamsArr.find((team) => team['id'] == homeTeam['teamId'])['logo'];

        const awayPoints = awayTeam['totalPoints'];
        const homePoints = homeTeam['totalPoints'];
        
        let string = "";

        if (awayPoints === homePoints)
        {
            string = `
            The matchup between 
            <img src=${awayTeamLogo} class="inline-logo" /> 
            <strong>${awayTeamName}</strong> 
            and 
            <img src=${homeTeamLogo} class="inline-logo" /> 
            <strong>${homeTeamName}</strong> ended in a tie!
            `;
        } 
        else if (awayPoints > homePoints)
        {
            string = `
            <img src=${awayTeamLogo} class="inline-logo" /> 
            <strong>${awayTeamName}</strong> 
            defeated 
            <img src=${homeTeamLogo} class="inline-logo" /> 
            <strong>${homeTeamName}</strong> 
            ${awayPoints} - ${homePoints}
            `;
        }
        else // Home team won:
        {
            string = `
            <img src=${homeTeamLogo} class="inline-logo" /> 
            <strong>${homeTeamName}</strong> 
            defeated 
            <img src=${awayTeamLogo} class="inline-logo" /> 
            <strong>${awayTeamName}</strong> 
            ${homePoints} - ${awayPoints}
            `;
        }

        // Add a divider to seperate weeks:
        if ((index + 1) % (teamsArr.length / 2) === 0 && index) 
        {
            string += `<hr></hr>`;
        }

        result.innerHTML += `<p>${string}</p>`;
    });
}
