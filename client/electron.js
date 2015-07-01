if (typeof process !== "undefined") {

  var folder = require("path").join(require("os").tmpdir(), "ddropbox");
  require("fs").mkdir(folder, function() {

    require("shell").openItem(folder);

    require("chokidar").watch(folder).on("add", Meteor.bindEnvironment(function(path) {
      var filename = require("path").basename(path);
      if (filename[0] !== "." && !Files.findOne({"original.name": filename})) {
        var f = new FS.File();
        f.name(filename);
        f.attachData(new Uint8Array(require("fs").readFileSync(path)), {type: require("mime").lookup(path)});
        Files.insert(f);
      }
    })).on("unlink", Meteor.bindEnvironment(function(path) {
      var filename = require("path").basename(path);
      Files.remove(Files.findOne({"original.name": filename})._id);
    }));

    Files.find().observe({
      changed: function(file) {
        var path = require("path").join(folder, file.name());
        if (file.url() && !require("fs").existsSync(path)) {
          var stream = require("fs").createWriteStream(path);
          require("http").get(file.url(), function(response) {
            response.pipe(stream);
            stream.on("finish", function() {
              stream.close();
              require("remote").require("app").addRecentDocument(path);
            });
          });
        }
      },
      removed: function(file) {
        var path = require("path").join(folder, file.name());
        if (require("fs").existsSync(path)) {
          require("fs").unlink(path);
        }
      }
    });

  });

}
