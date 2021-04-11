import axios from 'axios';
import { UpdateSession } from '../utils/credentials';

let headers = {
    'authority': 'gamersclub.com.br',
    'accept': 'application/json, text/javascript, */*; q=0.01',
    'dnt': '1',
    'x-requested-with': 'XMLHttpRequest',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36 Edg/87.0.664.60',
    'sec-fetch-site': 'same-origin',
    'sec-fetch-mode': 'cors',
    'sec-fetch-dest': 'empty',
    'referer': 'https://gamersclub.com.br',
    'accept-language': 'pt-BR,pt;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6',
    'accept-encoding': 'gzip',
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
    const token = request.query.token;
    const clientIp = request.headers['x-forwarded-for'] || request.connection.remoteAddress;

    //response.setHeader('Cache-Control', 's-maxage=10, stale-while-revalidate');
    
    console.log({
        id: gc_id,
        clientIp: clientIp
    });
    
    if (token == null){
        const data = {
            status: false,
            id: gc_id,
            message: "Token is invalid or null."
        };
        console.log(data);
        return response.status(403).json(data);
    }

    headers.cookie = `gclubsess=${token}`;
    
    const options = {
        method: 'GET',
        gzip: true,
        headers: headers
    };

    const profile_url = `https://gamersclub.com.br/api/box/init/${gc_id}`;
    
    try {
        const profile_res = await axios.get(profile_url, options);
        const profile = profile_res.data;

        const level = profile.playerInfo.level;
        const nick = profile.playerInfo.nick;
        const id = profile.playerInfo.id;
        const rating = profile.playerInfo.rating;
        
        let data = {
            status: (nick.length) ? true : false,
            id,
            level,
            nick,
            rating,
            range: (level > 0) ? XpRangeFromLevel(level) : { minRating: 0, maxRating: 0 }
        };

        if(data.status)
            data = UpdateSession(profile_res.headers['set-cookie'], data, token);
        return response.status(200).json(data);
    }
    catch (error) {
        const data = {
            status: false,
            id: gc_id,
            message: error.message ? error.message : error
        };

        response.status(500).json(data);
    }
}

export default Level;