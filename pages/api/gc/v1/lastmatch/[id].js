require('dotenv').config();
import axios from 'axios';
import moment from 'moment-timezone';

function UpdateSession(cookies) {
    if (!cookies)
        return;
    
    let cookiesParsed = {};
	cookies.forEach(function (cookie) {
		const data = cookie.split("; ")[0].split("=");
		if(data[0] && data[1]){
			cookiesParsed[data[0]] = data[1];
		}
    });
    
    if(Object.keys(cookiesParsed).length > 0) {
        if (cookiesParsed.gclubsess) {
            process.env.GCLUBSESS = cookiesParsed.gclubsess;
        }
	}
}

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
    'cookie': `gclubsess=${process.env.GCLUBSESS}`
};

async function LastMatch(request, response) {
    const gc_id = request.query.id;
    const clientIp = request.headers['x-forwarded-for'] || request.connection.remoteAddress;
  
    console.log({
        id: gc_id,
        clientIp: clientIp
    });

    const options = {
        method: 'GET',
        gzip: true,
        headers: headers
    };
    
    try {
        const profile_url = `https://gamersclub.com.br/api/box/init/${gc_id}`;
        const profile_res = await axios.get(profile_url, options);
        const profile = profile_res.data;

        const lastMatch = profile.lastMatches[profile.lastMatches.length - 1];
        const match_url = `https://gamersclub.com.br/lobby/partida/${lastMatch.id}/1`;
        const match_res = await axios.get(match_url, options);
        const match = match_res.data;

        let time = null;
        if (match)
            time = new Date(moment(match.data, 'DD/MM/YYYY HH:mm').tz('America/Sao_Paulo').format('MM/DD/YYYY HH:mm:ss'));

        let stats = {};
        for (let idx in profile.stats)
            stats[profile.stats[idx].stat] = profile.stats[idx].value;

        const data = {
            status: lastMatch ? true : false,
            id: profile.playerInfo.id,
            nick: profile.playerInfo.nick,
            matchID: lastMatch.id,
            time: time ? time.getTime() : null,
            win: lastMatch.win ? true : false,
            ratingDiff: lastMatch.ratingDiff,
            scoreA: lastMatch.win ? Math.max(lastMatch.scoreA, lastMatch.scoreB) : Math.min(lastMatch.scoreA, lastMatch.scoreB),
            scoreB: lastMatch.win ? Math.min(lastMatch.scoreA, lastMatch.scoreB) : Math.max(lastMatch.scoreA, lastMatch.scoreB),
            map: lastMatch.map,
            stats: stats
        }

        response.status(200);
        response.json(data);
        
        if(data.status)
            UpdateSession(profile_res.headers['set-cookie']);

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

export default LastMatch;