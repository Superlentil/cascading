// define the view "PictureEditor"
Articles.Views.Editors.PictureEditor = Articles.Views.Editors.BaseEditor.extend({ 
  template: JST["articles/templates/editors/picture_editor"],

  
  events: function() {
    return _.extend({}, Articles.Views.Editors.BaseEditor.prototype.events, {
      "change .Upload_Picture": "onFileChange",
      "click .Upload_Button": "onUpload"
    });
  },
  
  
  removeEditor: function(event) {
    event.preventDefault();
    event.stopPropagation();
    
    if (confirm("Are you sure to remove this picture?")) {
      var pictureEditor = $(event.currentTarget).parent();
      pictureEditor.remove();
    }
  },
  
  
  onFileChange: function(event) {
    // var file = $(":file").get(0).files[0];
    // var name = file.name;
    // var size = file.size;
    // var type = file.type;
    $(event.currentTarget).prev("div.Paragraph").empty();
  },
  
  
  onUpload: function(event) {
    event.preventDefault();
    event.stopPropagation();
    
    var that = this;
    var pictureUploader = $(event.currentTarget).prev("input.Upload_Picture");
    var contentContainer = pictureUploader.prev("div.Paragraph");
    
    $(function() {
      var formData = new FormData();
      formData.append("picture[article_id]", that.articleId);
      formData.append("picture[src]", pictureUploader.get(0).files[0]);
      
      var picture = new Articles.Models.Picture();
      
      picture.save(formData, {
        progress: function(event) {
          if (event.lengthComputable) {
            $('progress').attr({
              value: event.loaded,
              max: event.total
            });
          }
        },
        
        beforeSend: function() {
          contentContainer.empty();
          contentContainer.append("<progress></progress>");
        },
        
        success: function(savedPicture) {
          contentContainer.empty();
          contentContainer.append("<img src='" + savedPicture.medium_url
            + "' alt='Uploaded Picture' data-picture-id='" + savedPicture.id
            + "' />"
          );
        },
        
        error: function(jqXHR, textStatus, errorThrown) {},
        
        complete: function(jqXHR, textStatus ) {}
      });
    });
  }
});
