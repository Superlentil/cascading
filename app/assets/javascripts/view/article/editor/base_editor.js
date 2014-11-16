// define the view "BaseEditor", which will be inherited by other editors with some special functionality, for example "TextEditor" and "PictureEditor".
View.Article.Editor.BaseEditor = Backbone.View.extend({
  initialize: function(options) {
    if (options) {
      this.articleEditView = options.articleEditView;
      if (options.articleId) {
        this.articleId = options.articleId;
      }
    }
    this.initializeHelper(options);
  },
  
  
  initializeHelper: function(options) {
  },
  
  
  tagName: "div",
  className: "article-editor-container",
  
  
  headerTemplate: JST["template/article/editor/editor_header"],
  additionalOptionTemplate: null,
  
  
  additionalClassName: function() {
    return "";
  },
  
  
  render: function(content) {
    this.viewAddEditor = new View.Article.Editor.AddEditor({
      articleEditView: this.articleEditView,
      enableMinimize: true,
      addBeforeElement: this.$el
    });
    this.$el.append(this.viewAddEditor.render().$el);
    var editor = $("<div class='article-editor " + this.additionalClassName() +" article-edit-new-editor'></div>");
    var additionalOptions = null;
    if (this.additionalOptionTemplate) {
      additionalOptions = this.additionalOptionTemplate();
    }
    editor.append(this.headerTemplate({additionalOptions: additionalOptions}));
    editor.append(this.template({"content": content}));
    this.$el.append(editor);
    this.renderHelper();
    
    this.options = this.$el.find(".article-editor-options");
    this.optionSwitch = this.$el.find(".article-editor-option-switch").find("img");
    this.closeButton = this.$el.find(".article-editor-remove").find("img");
    
    return this;
  },
  
  
  renderHelper: function() {
  },
  
  
  events: {
    "click .article-editor-move-up": "moveUpEditor",
    "click .article-editor-move-down": "moveDownEditor",
    "click .article-editor-remove": "removeEditor",
    "click .article-edit-new-editor": "removeNewEditorMark",
    "click .article-editor-option-switch": "toggleOptions"
  },


  moveUpEditor: function(event) {
    event.preventDefault();
    var thisEditor = this.$el;
    thisEditor.prev("div.article-editor-container").before(thisEditor);
  },
  
  
  moveDownEditor: function(event) {
    event.preventDefault();
    var thisEditor = this.$el;
    thisEditor.next("div.article-editor-container").after(thisEditor);
  },
  
  
  removeEditor: function(event) {
    event.preventDefault();
    this.closeButton.transition({rotate: "90deg"}, 250, "ease").transition({rotate: 0}, 250, "ease");
    if (confirm("Are you sure to remove this paragraph?")) {
      this.$el.remove();
    }
  },
  
  
  removeNewEditorMark: function(event) {
    this.$el.find(".article-edit-new-editor").removeClass("article-edit-new-editor");
  },
  
  
  toggleOptions: function(event) {
    if (this.options.is(":hidden")) {
      this.optionSwitch.transition({rotate: "-360deg"}, 500, "ease");
      this.options.slideDown(500);
    } else {
      this.optionSwitch.transition({rotate: 0}, 500, "ease");
      this.options.slideUp(500);
    }
  },
  
  
  remove: function() {
    this.removeHelper();
    this.viewAddEditor.remove();
    Backbone.View.prototype.remove.call(this);
  },
  
  
  removeHelper: function() {
  }
});
