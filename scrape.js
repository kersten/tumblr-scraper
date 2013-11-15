var request = require('request'),
    async = require("async"),
    path = require("path"),
    fs = require("fs"),
    apiKey = "fFOf0EWU69UfHfprKtJnhAMZYEH2waE3FZPbtez6zfH9BjmosF",
    blogUrl = process.argv[2],
    url = "http://api.tumblr.com/v2/blog/" + blogUrl + "/posts/photo?api_key=" + apiKey;

try {
fs.mkdirSync(__dirname + "/img/" + blogUrl + "/");
} catch (e) {}
async.parallel([
    function (cb) {
        request(url, function (error, response, body) {
            var json = JSON.parse(body).response;

            cb(null, Math.round(json.total_posts / 20) + 1);
        });
    }
], function (err, res) {
    for (var i = 0; i < res[0]; i++) {
        var offset = i * 20;

        request(url + "&offset=" + offset, function (error, response, body) {
            var blog;

            if (!error && response.statusCode == 200) {
                blog = JSON.parse(body);

                async.mapSeries(blog.response.posts, function (post, cb) {
                    post.photos.forEach(function (photo) {
                        request(photo.original_size.url, function () {
                            console.log("Done loading " + path.basename(photo.original_size.url));

                            cb(null);
                        }).pipe(fs.createWriteStream(__dirname + "/img/" + blogUrl + "/" + path.basename(photo.original_size.url)));
                    });
                }, function () {
                    console.log("Done")
                });
            }
        });
    }
});
