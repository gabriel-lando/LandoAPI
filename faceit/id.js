const faceitjs = require('faceit-js');

module.exports.FaceitID = async (event, context, callback) => {
    if (event.source === 'serverless-plugin-warmup') {
        return callback(null, 'Lambda is warm!')
    }

    const nick = event.pathParameters?.nick;
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

    if (nick == null){
        const data = {
            status: false,
            nick: nick,
            message: "Nick is invalid or null."
        };
        console.log(data);
        return callback(null, { statusCode: 403, body: JSON.stringify(data) });
    }

    const faceit_api = new faceitjs(token);
    
    return new Promise((resolve, reject) => {
        faceit_api.nickname(nick)
        .then(async (resp) => {
            const data = {
                status: true,
                nick,
                id: resp.player_id
            };
            
            callback(null, { statusCode: 200, body: JSON.stringify(data) });
            resolve();
        }).catch((error) => {
            const data = {
                status: false,
                nick,
                message: error.message ? error.message : error
            };
            
            callback(null, { statusCode: 500, body: JSON.stringify(data) });
            resolve();
        });
    });
}
