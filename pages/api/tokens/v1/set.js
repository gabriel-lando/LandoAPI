import fs from 'fs';
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

    let tokens = null;

    try {
        tokens = JSON.parse(fs.readFileSync('./tokens.json', 'UTF-8'));
    } catch (error) {
        if (error.code === "ENOENT") {
            var new_key = { key : crypto.randomBytes(20).toString('hex') };
            fs.writeFileSync('./tokens.json', JSON.stringify(new_key, null, 4), 'UTF-8');

            response.status(200);
            response.json(new_key);
        }
        else {
            response.status(500);
            response.json(error);
        }
        return;
    }

    if (key !== tokens.key) {
        response.status(500);
        response.json("Password does not match.");
        return;
    }

    if (gclubsess) {
        tokens.gclubsess = gclubsess;
    }
    if (faceit) {
        tokens.faceit = faceit;
    }
    
    fs.writeFileSync('./tokens.json', JSON.stringify(tokens, null, 4), 'UTF-8');

    response.status(200);
    response.json(tokens);
}

export default Tokens;