import {GetCredentials, SetCredentials} from '../mongo/db';

export async function LoadCredentials(){
    if (!global.credentials)
        await GetCredentials();
    return global.credentials;
}

export async function UpdateSession(cookies) {
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
        if (cookiesParsed.gclubsess && global.credentials.gclubsess != cookiesParsed.gclubsess) {
            global.credentials.gclubsess = cookiesParsed.gclubsess;
            await SetCredentials();
        }
	}
}

export default (request, response) => {
    response.status(404);
    response.json(null);
}