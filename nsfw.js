var porn = require("./xvideos");

exports.getDetails = (link,cb) => {
    porn.details(link, (err, details) => {
        if (err) {
            return cb(err);
        }
        return cb(null,details);
    });
}

exports.searchPorn = (queryObject,cb) => {
    porn.search(queryObject, (err, results) => {
        if (err) {
            return cb(err);
        }
        console.log(results);
        return cb(null,results);
    });
}
