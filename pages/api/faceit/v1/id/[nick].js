import fs from 'fs';
import faceitjs from 'faceit-js';

let tokens = {};
try { tokens = JSON.parse(fs.readFileSync('./tokens.json', 'UTF-8')); } catch {}
const faceit_api = new faceitjs(tokens.faceit);

async function ID(request, response) {
    const nick = request.query.nick;
    const clientIp = request.headers['x-forwarded-for'] || request.connection.remoteAddress;
  
    console.log({
        nick: nick,
        clientIp: clientIp
    });

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