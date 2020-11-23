require('dotenv').config();
import crypto from 'crypto';

async function Tokens(request, response) {
    const gclubsess = request.query.gclubsess ?? null;
    const faceit = request.query.faceit ?? null;
    const key = request.query.key ?? null;
    const clientIp = request.headers['x-forwarded-for'] || request.connection.remoteAddress;
  
    console.log({
        url: request.url,
        clientIp: clientIp,
    });

    if (process.env.PASS_KEY == null){
        process.env.PASS_KEY = crypto.randomBytes(20).toString('hex');
        var new_key = { key : process.env.PASS_KEY };
        response.status(200);
        response.json(new_key);
        return;
    }

    if (key !== process.env.PASS_KEY) {
        response.status(500);
        response.json("Keys does not match.");
        return;
    }

    if (gclubsess) {
        process.env.GCLUBSESS = gclubsess;
    }
    if (faceit) {
        process.env.FACEIT = faceit;
    }

    const tokens = {
        key: process.env.PASS_KEY,
        gclubsess: process.env.GCLUBSESS,
        faceit: process.env.FACEIT
    }

    response.status(200);
    response.json(tokens);
}

export default Tokens;