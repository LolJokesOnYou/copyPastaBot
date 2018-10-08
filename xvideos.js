var cheerio = require("cheerio"),
    https = require("https"),
    qs = require("querystring"),
    url = require("url");

var XVideos = module.exports;

XVideos.resolveId = function resolveId(id, cb) {
  if (typeof id !== "number") {
    return cb(Error("wrong type for id; expected number but got " + typeof id));
  }

  var req = https.get("https://www.xvideos.com/video" + id, function(res) {
    if (res.statusCode === 404) {
      return cb(Error("video not found"));
    }

    if (res.statusCode !== 301) {
      return cb(Error("incorrect status code; expected 301 but got " + res.statusCode));
    }

    return cb(null, res.headers.location);
  });

  req.once("error", cb);
};

XVideos.details = function details(url, cb) {
  var req = https.get(url, function(res) {
    var body = Buffer(0);

    res.on("readable", function() {
      var chunk;
      while (chunk = res.read()) {
        body = Buffer.concat([body, chunk]);
      }
    });

    if (res.statusCode === 404) {
      return cb(Error("video not found"));
    }

    if (res.statusCode !== 200) {
      return cb(Error("incorrect status code; expected 200 but got " + res.statusCode));
    }

    res.on("end", function() {
      
      body = body.toString("utf8");
      var $ = cheerio.load(body);

      var title = $("#main > h2").text().replace(/-[^-]+$/, "").trim();
      
      var tags = $(".video-metadata > ul> li > a:not(.uploader-tag)").map(function(i, e) {
        return $(e).text().trim();
      }).filter(function(e) {
        return e !== "tags";
      });
      
      var duration = $(".duration").text().trim().replace(/^-/, "").trim();
      var flv = '';
      
    if (matches = body.match(/html5player.setVideoUrlHigh+.+\)/)) {
        flv = matches[0];
      }
      var flvArray = flv.split('html5player.setVideoUrlHigh\(\'');
      flvArray = flvArray[1].split('\'');
      flv = flvArray[0];

      if (!flv) {
        return cb(Error("couldn't find flv"));
      }

      var thumb;
      if (matches = body.match(/html5player.setThumbUrl+.+\)/)) {
        thumb = matches[0];
      }
      var thumbArray = thumb.split('html5player.setThumbUrl\(\'');
      thumbArray = thumbArray[1].split('\'');
      thumb = thumbArray[0];

      return cb(null, {title: title, duration: duration, tags: tags, flv: flv, thumb: thumb});
    });
  });

  req.once("error", cb);
};

XVideos.constructSearchUrl = function constructSearchUrl(parameters) {
  console.log("https://www.xvideos.com/?" + qs.stringify(parameters));
  return "https://www.xvideos.com/?" + qs.stringify(parameters);
};

XVideos.search = function search(parameters, cb) {
  var req = https.get(this.constructSearchUrl(parameters), function(res) {
    var body = Buffer(0);

    res.on("readable", function() {
      var chunk;
      while (chunk = res.read()) {
        body = Buffer.concat([body, chunk]);
      }
    });

    if (res.statusCode !== 200) {
      return cb(Error("incorrect status code; expected 200 but got " + res.statusCode));
    }

    res.on("end", function() {
      body = body.toString("utf8");

      var $ = cheerio.load(body);

      var videos = $(".thumbBlock > .thumbInside").map(function(i, e) {
        var find;

        if ($(e).find("script").length) {
          find = cheerio.load($(e).find("script").text().replace(/^thumbcastDisplayRandomThumb\('(.+?)'\);$/, "$1"));
        } else {
          find = $(e).find.bind($(e));
        }

        return {
          url: url.resolve("https://www.xvideos.com/", find("div.thumb > a").attr("href").replace("/THUMBNUM/", "/")),
          title: find("p > a").text(),
          duration: $(e).find("span.duration").text().replace(/[\(\)]/g, "").trim(),
        };
      });

      var total = parseInt($("h3.blackTitle").text().replace(/[\r\n]/g, " ").replace(/^.*- (\d+) results.*$/, "$1"), 10);

      return cb(null, {total: total, videos: videos});
    });
  });

  req.once("error", cb);
};
