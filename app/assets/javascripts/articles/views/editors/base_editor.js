// define the view "BaseEditor", which will be inherited by other editors with some special functionality, for example "TextEditor" and "PictureEditor".
Articles.Views.Editors.BaseEditor = Backbone.View.extend({
  tagName: "div",
  
  
  className: "Article_Editor",
  
  
  render: function() {
    var that = this;
    that.$el.html(that.template());
    $(function() {
      that.$el.children(".Move_Up_Button").on("click", that.moveUpEditor);
      that.$el.children(".Move_Down_Button").on("click", that.moveDownEditor);
    });
    return that;
  },


  moveUpEditor: function(event) {
    var editor = $(event.currentTarget).parent();
    editor.prev("div.Article_Editor").before(editor);
  },
  
  
  moveDownEditor: function(event) {
    var editor = $(event.currentTarget).parent();
    editor.next("div.Article_Editor").after(editor);
  },
});
