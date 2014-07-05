// define the view "TextEditor"
Articles.Views.Editors.TextEditor = Backbone.View.extend({
  tagName: "div",
  
  className: "Article_Paragraph_Editor",
  
  template: JST["articles/templates/editors/text_editor"],
  
  render: function() {
    this.$el.html(this.template());
    return this;
  }
});
