import axios from 'axios';
import { UpdateSession, LoadCredentials } from '../../utils/credentials/credentials';

let headers = {
    'authority': 'gamersclub.com.br',
    'accept': 'application/json, text/plain, */*',
    'dnt': '1',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.130 Safari/537.36 OPR/66.0.3515.75',
    'sec-fetch-site': 'same-origin',
    'sec-fetch-mode': 'cors',
    'referer': 'https://gamersclub.com.br',
    'accept-encoding': 'gzip',
    'accept-language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
    'cookie': ''
};

const levelRatingXP = [1000, 1056, 1116, 1179, 1246, 1316, 1390, 1469, 1552, 1639, 1732, 1830, 1933, 2042, 2158, 2280, 2408, 2544, 2688, 2840, 2999];
function XpRangeFromLevel (level) {
    return {
        minRating: levelRatingXP[level - 1],
		maxRating: levelRatingXP[level]
	}
}

async function Level(request, response) {
    const gc_id = request.query.id;
    const clientIp = request.headers['x-forwarded-for'] || request.connection.remoteAddress;
    
    console.log({
        id: gc_id,
        clientIp: clientIp
    });
    
    if (!global.credentials)
        await LoadCredentials();

    headers.cookie = `gclubsess=${global.credentials.gclubsess}`;
    
    const options = {
        method: 'GET',
        gzip: true,
        headers: headers
    };

    const url = `https://gamersclub.com.br/api/box/init/${gc_id}`;
    
    try {
        const result = await axios.get(url, options);
        const body = result.data;

        const level = body.playerInfo.level;
        const nick = body.playerInfo.nick;
        const id = body.playerInfo.id;
        const rating = body.playerInfo.rating;
        
        let data = {
            status: (nick.length) ? true : false,
            id,
            level,
            nick,
            rating,
            range: (level > 0) ? XpRangeFromLevel(level) : { minRating: 0, maxRating: 0 }
        };

        response.status(200);
        response.json(data);
        
        if(data.status)
            UpdateSession(result.headers['set-cookie']);

        return;
    }
    catch (error) {
        const data = {
            status: false,
            id: gc_id,
            message: error.message ? error.message : error
        };

        response.status(500);
        response.json(data);
    }
}

export default Level;