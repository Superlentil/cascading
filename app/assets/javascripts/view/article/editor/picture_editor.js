// define the view "PictureEditor"
View.Article.Editor.PictureEditor = View.Article.Editor.BaseEditor.extend({ 
  template: JST["template/article/editor/picture_editor"],
  
  
  additionalClassName: function() {
    return "article-picture-editor";
  },
  
  
  renderHelper: function() {
    this.contentContainer = this.$el.find(".m-paragraph");
    this.fileUploader = this.$el.find(".m-file-uploader");
  },
  
  
  populateContent: function(content) {
    if (content) {
      var contentContainer = this.contentContainer;
      contentContainer.empty();
      this.fileUploader.hide();
      contentContainer.append("<div>(Click Picture to Make a Change)</div>");
      contentContainer.append("<img class='article-picture-editor-img' src='" + content.url
        + "' alt='Uploaded Picture' data-picture-id='" + content.id
        + "' title='Click Picture to Make a Change' />"
      );
    }
  },

  
  events: function() {
    return _.extend({}, View.Article.Editor.BaseEditor.prototype.events, {
      "click .article-picture-editor-img": "selectNewPicture",
      "change .m-file-uploader": "onFileChange"
    });
  },
  
  
  selectNewPicture: function(event) {
    event.preventDefault();
    this.fileUploader.trigger("click");
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
    
    var contentContainer = this.contentContainer;
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
        contentContainer.after(progressBar);
        that.fileUploader.hide();
      },
      
      success: function(savedPicture) {
        progressBar.remove();
        that.populateContent({url: savedPicture.medium_url, id: savedPicture.id});
      },
      
      error: function() {
        this.fileUploader.show();
      }
    });
  }
});
