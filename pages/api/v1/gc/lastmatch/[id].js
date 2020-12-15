import axios from 'axios';
import moment from 'moment-timezone';
import { UpdateSession, LoadCredentials } from '../../utils/credentials/credentials';

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

async function LastMatch(request, response) {
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
    
    try {
        const profile_url = `https://gamersclub.com.br/api/box/init/${gc_id}`;
        const profile_res = await axios.get(profile_url, options);
        const profile = profile_res.data;

        let time = null;
        const lastMatch = profile.lastMatches[profile.lastMatches.length - 1];

        try {
            const match_url = `https://gamersclub.com.br/lobby/partida/${lastMatch.id}/1`;
            const match_res = await axios.get(match_url, options);
            const match = match_res.data;
    
            if (match) {
                time = new Date(moment(match.data, 'DD/MM/YYYY HH:mm').tz(Intl.DateTimeFormat().resolvedOptions().timeZone).format('MM/DD/YYYY HH:mm:ss'));
                const timeDiff = (180 - new Date().getTimezoneOffset()) * 60000; // 180 minutes = -3:00 GMT (America/Sao_Paulo) --- 60000 = 1 minute in milisseconds
                time = new Date(time.getTime() + timeDiff);
            }
        } catch (error) { console.log(error); }

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