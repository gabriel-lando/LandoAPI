import fs from 'fs';
import faceitjs from 'faceit-js';

let tokens = {};
try { tokens = JSON.parse(fs.readFileSync('./tokens.json', 'UTF-8')); } catch {}
const faceit_api = new faceitjs(tokens.faceit);

const ratingElo = ["0-0", "1-800", "801-950", "951-1100", "1101-1250", "1251-1400", "1401-1550", "1551-1700", "1701-1850", "1851-2000", "2001+"];
function EloRange(level) {
	return ratingElo[level];
}

async function Level(request, response) {
    const id = request.query.id;
    const clientIp = request.headers['x-forwarded-for'] || request.connection.remoteAddress;
  
    console.log({
        id: id,
        clientIp: clientIp
    });

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
    });
}

export default Level;