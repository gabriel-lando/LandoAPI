import faceitjs from 'faceit-js';
import { LoadCredentials } from '../../utils/credentials/credentials';

async function ID(request, response) {
    const nick = request.query.nick;
    const clientIp = request.headers['x-forwarded-for'] || request.connection.remoteAddress;

    response.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate');

    console.log({
        nick: nick,
        clientIp: clientIp
    });

    if (!global.credentials)
        await LoadCredentials();

    if (!global.faceit_api)
        global.faceit_api = new faceitjs(global.credentials.faceit);
    
    return new Promise((resolve, reject) => {
        global.faceit_api.nickname(nick)
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