const faceitjs = require('faceit-js');

const ratingElo = ["0-0", "1-800", "801-950", "951-1100", "1101-1250", "1251-1400", "1401-1550", "1551-1700", "1701-1850", "1851-2000", "2001+"];
function EloRange(level) {
	return ratingElo[level];
}

module.exports.FaceitLevel = async (event, context, callback) => {
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
        faceit_api.players(id)
        .then(resp => {
            const level = resp.games.csgo.skill_level;
            const elo = resp.games.csgo.faceit_elo;

            const data = {
                status: true,
                id,
                level: level,
                elo: elo,
                rating: EloRange(level)
            };

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
    });
}
