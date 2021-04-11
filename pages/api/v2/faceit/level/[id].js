require('dotenv').config();
import faceitjs from 'faceit-js';

const ratingElo = ["0-0", "1-800", "801-950", "951-1100", "1101-1250", "1251-1400", "1401-1550", "1551-1700", "1701-1850", "1851-2000", "2001+"];
function EloRange(level) {
	return ratingElo[level];
}

async function Level(request, response) {
    const id = request.query.id;
    const token = request.query.token;
    const clientIp = request.headers['x-forwarded-for'] || request.connection.remoteAddress;

    //response.setHeader('Cache-Control', 's-maxage=10, stale-while-revalidate');

    console.log({
        id: id,
        clientIp: clientIp
    });
    
    if (token == null){
        const data = {
            status: false,
            id: id,
            message: "Token is invalid or null."
        };
        console.log(data);
        return response.status(403).json(data);
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

            response.status(200).json(data);
            resolve();
        }).catch((error) => {
            const data = {
                status: false,
                id,
                message: error.message ? error.message : error
            };
            
            response.status(500).json(data);
            resolve();
        });
    });
}

export default Level;