Template.body.helpers({
  files: function() {
    return Files.find();
  }
});
Template.body.events({
  "change input[type=file]": function(event) {
    FS.Utility.eachFile(event, function(file) {
      Files.insert(file);
    });
  }
});
