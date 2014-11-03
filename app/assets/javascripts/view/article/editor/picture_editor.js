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
    
    var that = this;
    var pictureUploader = $(event.currentTarget);
    var contentContainer = pictureUploader.prev("div.Paragraph");
    
    if (pictureUploader.val() !== "") {
      contentContainer.empty();
      
      var files = pictureUploader.get(0).files;
      var length = files.length;
      
      for (var index = 0; index < length; ++index) {
        var formData = new FormData();
        formData.append("picture[article_id]", that.articleId);
        formData.append("picture[src]", files[index]);
        
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
            contentContainer.append(progressBar);
          },
          
          success: function(savedPicture) {
            progressBar.remove();
            contentContainer.append("<img src='" + savedPicture.medium_url
              + "' alt='Uploaded Picture' data-picture-id='" + savedPicture.id
              + "' />"
            );
          },
          
          error: function(jqXHR, textStatus, errorThrown) {},
          
          complete: function(jqXHR, textStatus ) {}
        });
      }
    }
  }
});
