require('dotenv').config();
import faceitjs from 'faceit-js';
import { LoadCredentials } from '../../utils/credentials/credentials';

async function LastMatch(request, response) {
    const id = request.query.id;
    const clientIp = request.headers['x-forwarded-for'] || request.connection.remoteAddress;

    //response.setHeader('Cache-Control', 's-maxage=10, stale-while-revalidate');
  
    console.log({
        id: id,
        clientIp: clientIp
    });

    if (!global.credentials)
        await LoadCredentials();

    if (!global.faceit_api)
        global.faceit_api = new faceitjs(global.credentials.faceit);

    return new Promise((resolve, reject) => {
        global.faceit_api.players(id, "history")
        .then(resp => {
            const match_id = resp.items[0].match_id;
            const time = resp.items[0].finished_at * 1000;

            global.faceit_api.matches(match_id, true)
            .then(resp_match => {
                const match = resp_match.rounds[0];
                const map = match.round_stats.Map;
                const winner = match.round_stats.Winner;
                
                let team = match.teams[0];
                let idx = match.teams[0].players.findIndex(item => item.player_id == id);
                if (idx == -1) {
                    idx = match.teams[1].players.findIndex(item => item.player_id == id);
                    team = match.teams[1];
                }
                if (idx == -1) throw `Error finding player in match!`;

                const userStats = team.players[idx];
                
                const score = match.round_stats.Score.split("/");
                const win = (team.team_id == winner) ? true : false;
                const scoreA = win ? Math.max(...score) : Math.min(...score);
                const scoreB = win ? Math.min(...score) : Math.max(...score);

                const data = {
                    status: true,
                    id: id,
                    nick: userStats.nickname,
                    matchID: match_id,
                    time: time,
                    win: win,
                    scoreA: scoreA,
                    scoreB: scoreB,
                    map: map,
                    stats: userStats.player_stats
                }

                response.status(200);
                response.json(data);
                resolve();
            }).catch((error) => {
                const data = {
                    status: false,
                    id,
                    message: error.message ? error.message : error
                };
                
                response.status(500);
                response.json(data);
                resolve();
            });
        }).catch((error) => {
            const data = {
                status: false,
                id,
                message: error.message ? error.message : error
            };
            
            response.status(500);
            response.json(data);
            resolve();
        });
    });
}

export default LastMatch;