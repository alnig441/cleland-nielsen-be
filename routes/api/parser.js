parser = {

    createDoc: function (request) {
        let query = {};

        Object.keys(request).forEach((element) => {

            if (element != 'page') {

                switch (element) {
                    case 'day':
                        !query.date ? query.date = {[element]: parseInt(request[element])} : query.date[element] = parseInt(request[element]);
                        break;
                    case 'month':
                        !query.date ? query.date = {[element]: parseInt(request[element])} : query.date[element] = parseInt(request[element]);
                        break;
                    case 'year':
                        !query.date ? query.date = {[element]: parseInt(request[element])} : query.date[element] = parseInt(request[element]);
                        break;
                    case 'city':
                        !query.location ? query.location = {[element]: request[element]} : query.date[element] = request[element];
                        break;
                    case 'state':
                        !query.location ? query.location = {[element]: request[element]} : query.date[element] = request[element];
                        break;
                    case 'country':
                        !query.location ? query.location = {[element]: request[element]} : query.date[element] = request[element];
                        break;
                    case 'venue':
                        !query.meta ? query.meta = {[element]: request[element]} : query.date[element] = request[element];
                        break;
                    case 'occasion':
                        !query.meta ? query.meta = {[element]: request[element]} : query.date[element] = request[element];
                        break;
                    case 'names':
                        !query.meta ? query.meta = {[element]: request[element]} : query.date[element] = request[element];
                        break;
                    case 'fileName':
                        !query.image ? query.image = {[element]: request[element]} : query.date[element] = request[element];
                        break;
                    default:
                        query[element] = request[element];
                        break;
                }
            }
        })
        return query;
    },

    parseQuery: function (request) {

        let query;

        Object.keys(request).forEach((key) => {

            if (key != 'page') {
                switch (key) {
                    case 'city':
                        return  query = { "location.city" : request[key] };
                    case 'state':
                        return  query = { "location.state" : request[key] };
                    case 'country':
                        return  query = { "location.country" : request[key] };
                    case 'day':
                        return  query = { "date.day" : parseInt(request[key]) };
                    case 'month':
                        return  query = { "date.month" : parseInt(request[key])};
                    case 'year':
                        return  query = { "date.year" : parseInt(request[key]) };
                    case 'names':
                        let names = [];
                        request[key].split(',').forEach((name) => {
                            names.push(name.trim());
                        });
                        return  query = { $push: {"meta.names" : names }};
                    case 'venue':
                        return  query = { "meta.venue" : request[key] };
                    case 'occasion':
                        return  query = { "meta.occasion" : request[key] };
                    case 'fileName':
                        return  query = { "image.fileName" : request[key] };
                    case 'thumbnail':
                        return  query = { "image.thumbnail" : request[key] };
                    default:
                        return null;
                }
            }
        })
        return query;
    }
}

module.exports = parser;