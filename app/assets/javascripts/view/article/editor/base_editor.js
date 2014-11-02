// define the view "BaseEditor", which will be inherited by other editors with some special functionality, for example "TextEditor" and "PictureEditor".
View.Article.Editor.BaseEditor = Backbone.View.extend({
  initialize: function(options) {
    if (options) {
      this.articleEditView = options.articleEditView;
      if (options.articleId) {
        this.articleId = options.articleId;
      }
    }
  },
  
  
  tagName: "div",
  className: "Article_Editor",
  
  
  render: function(content) {
    this.viewAddEditor = new View.Article.Editor.AddEditor({
      articleEditView: this.articleEditView,
      enableMinimize: true,
      addBeforeElement: this.$el
    });
    this.$el.append(this.viewAddEditor.render().$el);
    this.$el.append(this.template({"content": content}));
    return this;
  },
  
  
  events: {
    "click .article-editor-move-up-button": "moveUpEditor",
    "click .article-editor-move-down-button": "moveDownEditor",
    "click .article-editor-remove-button": "removeEditor"
  },


  moveUpEditor: function(event) {
    event.preventDefault();
    event.stopPropagation();
    var thisEditor = this.$el;
    thisEditor.prev("div.Article_Editor").before(thisEditor);
  },
  
  
  moveDownEditor: function(event) {
    event.preventDefault();
    event.stopPropagation();
    var thisEditor = this.$el;
    thisEditor.next("div.Article_Editor").after(thisEditor);
  },
  
  
  removeEditor: function(event) {
    event.preventDefault();
    event.stopPropagation();
    if (confirm("Are you sure to remove this paragraph?")) {
      this.$el.remove();
    }
  },
  
  
  remove: function() {
    this.viewAddEditor.remove();
    Backbone.View.prototype.remove.call(this);
  }
});
