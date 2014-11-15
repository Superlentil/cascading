// define the view "PictureEditor"
View.Article.Editor.PictureEditor = View.Article.Editor.BaseEditor.extend({ 
  template: JST["template/article/editor/picture_editor"],

  
  events: function() {
    return _.extend({}, View.Article.Editor.BaseEditor.prototype.events, {
      "change .Upload_Picture": "onFileChange"
    });
  },
  
  
  onFileChange: function(event) {
    // var file = $(":file").get(0).files[0];
    // var name = file.name;
    // var size = file.size;
    // var type = file.type;
    
    var pictureUploader = $(event.currentTarget);
    
    if (pictureUploader.val() !== "") {
      var allFiles = pictureUploader.get(0).files;
      var lastFileIndex = allFiles.length - 1;
      
      if (lastFileIndex > 0) {
        for (var index =0; index < lastFileIndex; ++index) {
          var newPictureEditor = this.articleEditView.addPicture(this.$el);
          newPictureEditor.saveFile(allFiles[index]);
        }
      }
      
      this.saveFile(allFiles[lastFileIndex]);
    }
  },
  
  
  saveFile: function(file) {
    var that = this;
    
    var contentContainer = this.$el.find("div.Paragraph");
    var formData = new FormData();
    formData.append("picture[article_id]", that.articleId);
    formData.append("picture[src]", file);
    
    var picture = new Model.Picture();
    var progressBar = $("<progress></progress>");
    
    picture.save(formData, {
      progress: function(event) {
        if (event.lengthComputable) {
          progressBar.attr({
            value: event.loaded,
            max: event.total
          });
        }
      },
      
      beforeSend: function() {
        contentContainer.empty();
        contentContainer.append(progressBar);
      },
      
      success: function(savedPicture) {
        contentContainer.empty();
        contentContainer.append("<img src='" + savedPicture.medium_url
          + "' alt='Uploaded Picture' data-picture-id='" + savedPicture.id
          + "' />"
        );
      }
    });
  }
});
