// define the view "BaseEditor", which will be inherited by other editors with some special functionality, for example "TextEditor" and "PictureEditor".
Articles.Views.Editors.BaseEditor = Backbone.View.extend({
  tagName: "div",
  
  
  className: "Article_Editor",
  
  
  render: function(content) {
    content = content || "";
    this.$el.html(this.template({"content": content}));
    return this;
  },
  
  
  events: {
    "click .Move_Up_Button": "moveUpEditor",
    "click .Move_Down_Button": "moveDownEditor"
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
