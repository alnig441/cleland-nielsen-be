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
                        !query.location ? query.location = {[element]: request[element]} : query.location[element] = request[element];
                        break;
                    case 'state':
                        !query.location ? query.location = {[element]: request[element]} : query.location[element] = request[element];
                        break;
                    case 'country':
                        !query.location ? query.location = {[element]: request[element]} : query.location[element] = request[element];
                        break;
                    case 'venue':
                        !query.meta ? query.meta = {[element]: request[element]} : query.meta[element] = request[element];
                        break;
                    case 'occasion':
                        !query.meta ? query.meta = {[element]: request[element]} : query.meta[element] = request[element];
                        break;
                    case 'names':
                        let names = splitAndTrim(request[element]);
                        !query.meta ? query.meta = {[element]: names} : query.meta[element] = names;
                        break;
                    case 'keywords':
                        let keywords = splitAndTrim(request[element]);
                        !query.meta ? query.meta = {[element]: keywords} : query.meta[element] = keywords;
                        break;
                    case 'da':
                        !query.meta ? query.meta = {[element] : { da: request[elem].da }} : query.meta[element] = { da: request[element].da };
                        break;
                    case 'en':
                        !query.meta ? query.meta = {[element] : { en: request[elem].en }} : query.meta[element] = { en: request[element].en };
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

    parse: function(request) {
      let isSearch = request.page ? true: false;
      let query = isSearch ? []: {};

      function buildQueryObj(key, valuesArray) {
        if (isSearch) {
          let obj = {};
          valuesArray ? obj[convert(key)] = { $in : valuesArray } : obj[convert(key)] = request[key];
          query.push(obj);
        } else {
          if (valuesArray) {
            query['$push'] = {};
            query['$push'][convert(key)] = valuesArray;
          } else {
            query[convert(key)] = request[key];
          }
        }
      }

      Object.keys(request).forEach((key) => {
        if (key != 'page' && key != 'doAnd') {
          switch(key) {
              case 'keywords':
                let keywords = splitAndTrim(request[key]);
                buildQueryObj(key, keywords)
                break;
              case 'names':
                let names = splitAndTrim(request[key]);
                buildQueryObj(key, names)
                break;
              default:
                buildQueryObj(key);
                break;
          }
        }
      })
      return query;
    }

}

function convert(key) {
  if (key == 'city' || key == 'state' || key == 'country') {
    return `location.${key}`;
  }
  else if (key == 'day' || key == 'month' || key == 'year') {
    return `date.${key}`;
  }
  else if (key == 'keywords' || key == 'names' || key == 'venue' || key == 'occasion') {
    return `meta.${key}`;
  }
  else if (key == 'en' || key == 'da') {
    return `meta.event.${key}`;
  }
  else if (key == 'fileName' || key == 'thumbnail') {
    return `image.${key}`;
  }
  else {
    return null;
  }
}

function splitAndTrim(field) {
  let array = [];
  field.split(',').forEach((value) => {array.push(value.trim())});
  return array;
}

module.exports = parser;
