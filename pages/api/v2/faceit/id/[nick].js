import faceitjs from 'faceit-js';

async function ID(request, response) {
    const nick = request.query.nick;
    const token = request.query.token;
    const clientIp = request.headers['x-forwarded-for'] || request.connection.remoteAddress;

    response.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate');

    console.log({
        nick: nick,
        clientIp: clientIp
    });

    if (token == null){
        const data = {
            status: false,
            nick,
            message: "Token is invalid or null."
        };
        console.log(data);
        return response.status(403).json(data);
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
            
            response.status(200);
            response.json(data);
            resolve();
        }).catch((error) => {
            const data = {
                status: false,
                nick,
                message: error.message ? error.message : error
            };
            
            response.status(500);
            response.json(data);
            resolve();
        });
    });
}

export default ID;