import crypto from 'crypto';
import { GetCredentials, SetCredentials } from '../mongo/db';

let credentials = {};

async function Tokens(request, response) {
    const gclubsess = request.query.gclubsess ?? null;
    const faceit = request.query.faceit ?? null;
    const key = request.query.key ?? null;
    const clientIp = request.headers['x-forwarded-for'] || request.connection.remoteAddress;
  
    console.log({
        url: request.url,
        clientIp: clientIp,
    });

    if(Object.keys(credentials).length == 0)
        credentials = GetCredentials();

    if (credentials.key == null){
        credentials.key = crypto.randomBytes(20).toString('hex');
        response.status(200);
        response.json(credentials);
        SetCredentials(credentials);
        return;
    }

    if (key !== credentials.key) {
        response.status(500);
        response.json("Keys does not match.");
        return;
    }

    if (gclubsess) {
        credentials.gclubsess = gclubsess;
    }
    if (faceit) {
        credentials.faceit = faceit;
    }

    response.status(200);
    response.json(credentials);
    SetCredentials(credentials);
}

export default Tokens;