const faceitjs = require('faceit-js');

module.exports.FaceitLastMatch = async (event, context, callback) => {
    if (event.source === 'serverless-plugin-warmup') {
        return callback(null, 'Lambda is warm!')
    }

    const id = event.pathParameters?.id;
    const token = event.queryStringParameters?.token;

    if (token == null){
        const data = {
            status: false,
            nick,
            message: "Token is invalid or null."
        };
        console.log(data);
        return callback(null, { statusCode: 403, body: JSON.stringify(data) });
    }

    if (id == null){
        const data = {
            status: false,
            id: id,
            message: "Id is invalid or null."
        };
        console.log(data);
        return callback(null, { statusCode: 403, body: JSON.stringify(data) });
    }

    const faceit_api = new faceitjs(token);

    return new Promise((resolve, reject) => {
        faceit_api.players(id, "history")
        .then(resp => {
            const match_id = resp.items[0].match_id;
            const time = resp.items[0].finished_at * 1000;

            faceit_api.matches(match_id, true)
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

                callback(null, { statusCode: 200, body: JSON.stringify(data) });
                resolve();
            }).catch((error) => {
                const data = {
                    status: false,
                    id,
                    message: error.message ? error.message : error
                };
                
                callback(null, { statusCode: 500, body: JSON.stringify(data) });
                resolve();
            });
        }).catch((error) => {
            const data = {
                status: false,
                id,
                message: error.message ? error.message : error
            };
            
            callback(null, { statusCode: 500, body: JSON.stringify(data) });
            resolve();
        });
    });
}
