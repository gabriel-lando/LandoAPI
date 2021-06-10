const axios = require('axios');
const moment = require('moment-timezone');

let headersProfile = {
    'authority': 'gamersclub.com.br',
    'accept': 'application/json, text/javascript, */*; q=0.01',
    'dnt': '1',
    'x-requested-with': 'XMLHttpRequest',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36 Edg/87.0.664.60',
    'sec-fetch-site': 'same-origin',
    'sec-fetch-mode': 'cors',
    'sec-fetch-dest': 'empty',
    'referer': 'https://gamersclub.com.br/',
    'accept-language': 'pt-BR,pt;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6',
    'accept-encoding': 'gzip',
    'cookie': ''
};

const headersMatch = {
    'authority': 'csgo.gamersclub.gg',
    'accept': 'application/json, text/javascript, */*; q=0.01',
    'dnt': '1',
    'x-requested-with': 'XMLHttpRequest',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36 Edg/87.0.664.60',
    'sec-fetch-site': 'same-origin',
    'sec-fetch-mode': 'cors',
    'sec-fetch-dest': 'empty',
    'referer': 'https://csgo.gamersclub.gg',
    'accept-language': 'pt-BR,pt;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6',
    'accept-encoding': 'gzip'
};

function UpdateSession(cookies, data, token) {
    data.token = null;
    if (!cookies)
        return data;
    
    let cookiesParsed = {};
	cookies.forEach(function (cookie) {
		const data = cookie.split("; ")[0].split("=");
		if(data[0] && data[1]){
			cookiesParsed[data[0]] = data[1];
		}
    });
    
    if(Object.keys(cookiesParsed).length > 0) {
        if (cookiesParsed.gclubsess && cookiesParsed.gclubsess != token)
            data.token = cookiesParsed.gclubsess;
	}

    return data;
}

module.exports.GCLastMatch = async (event, context, callback) => {
    if (event.source === 'serverless-plugin-warmup') {
        return callback(null, 'Lambda is warm!')
    }

    const gc_id = event.pathParameters?.id;
    const token = event.queryStringParameters?.token;

    if (token == null){
        const data = {
            status: false,
            id: gc_id,
            message: "Token is invalid or null."
        };
        console.log(data);
        return callback(null, { statusCode: 403, body: JSON.stringify(data) });
    }

    if (gc_id == null){
        const data = {
            status: false,
            id: gc_id,
            message: "GC ID is invalid or null."
        };
        console.log(data);
        return callback(null, { statusCode: 403, body: JSON.stringify(data) });
    }

    headersProfile.cookie = `gclubsess=${token}`;
    
    const options = {
        method: 'GET',
        gzip: true,
        headers: headersProfile
    };
    
    try {
        const profile_url = `https://gamersclub.com.br/api/box/init/${gc_id}`;
        const profile_res = await axios.get(profile_url, options);
        const profile = profile_res.data;

        let time = null;
        const lastMatch = profile.lastMatches[profile.lastMatches.length - 1];

        try {
            const match_url = `https://csgo.gamersclub.gg/lobby/partida/${lastMatch.id}/1`;
            const optionsMatch = { gzip: true, headers: headersMatch };

            const match_res = await axios.get(match_url, optionsMatch);
            const match = match_res.data;
    
            if (match) {
                time = new Date(moment(match.data, 'DD/MM/YYYY HH:mm').tz(Intl.DateTimeFormat().resolvedOptions().timeZone).format('MM/DD/YYYY HH:mm:ss'));
                const timeDiff = (180 - new Date().getTimezoneOffset()) * 60000; // 180 minutes = -3:00 GMT (America/Sao_Paulo) --- 60000 = 1 minute in milisseconds
                time = new Date(time.getTime() + timeDiff);
            }
        } catch (error) { console.log(JSON.parse(error)); }

        let stats = {};
        for (let idx in profile.stats)
            stats[profile.stats[idx].stat] = profile.stats[idx].value;

        let data = {
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
        
        if(data.status)
            data = UpdateSession(profile_res.headers['set-cookie'], data, token);
        return callback(null, { statusCode: 200, body: JSON.stringify(data) });
    }
    catch (error) {
        const data = {
            status: false,
            id: gc_id,
            message: error.message ? error.message : error
        };

        return callback(null, { statusCode: 500, body: JSON.stringify(data) });
    }
}