// define the view "PictureEditor"
Articles.Views.Editors.PictureEditor = Articles.Views.Editors.BaseEditor.extend({
  template: JST["articles/templates/editors/picture_editor"],
  
  
  events: {
    "change :file": "onFileChange",
    "click .Submit_Button": "onSubmit"
  },
  
  
  onFileChange: function() {
    $(function() {
      var file = $(":file").get(0).files[0];
      var name = file.name;
      var size = file.size;
      var type = file.type;
    });
  },
  
  
  onSubmit: function(event) {
    event.preventDefault();
    event.stopPropagation();
    var pictureUploader = $(event.currentTarget).prev("input:file");
    var contentContainer = pictureUploader.prev("div.Paragraph");
    
    $(function() {
      var formData = new FormData();
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
          var oldPictureHtml = contentContainer.children("img");
          if (oldPictureHtml.length > 0) {
            var oldPictureId = oldPictureHtml.data("pictureId");
            var oldPicture = new Articles.Models.Picture({"id": oldPictureId});
            oldPicture.destroy();
          }
          contentContainer.empty();
          contentContainer.append("<progress></progress>");
        },
        
        success: function(picture) {
          contentContainer.empty();
          contentContainer.append("<img src='" + picture.medium_url + "' alt='Uploaded Picture' data-picture-id = '" + picture.id + "' />");
        },
        
        error: function(jqXHR, textStatus, errorThrown) {},
        
        complete: function(jqXHR, textStatus ) {}
      });
    });
  }
});
