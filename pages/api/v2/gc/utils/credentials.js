export function UpdateSession(cookies, data, token) {
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

export default (request, response) => {
    response.status(404).json(null);
}