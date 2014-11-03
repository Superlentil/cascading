// define the view "AddEditor"
View.Article.Editor.AddEditor = Backbone.View.extend({
  initialize: function(options) {
    this.articleEditView = options.articleEditView;
    this.enableMinimize = options.enableMinimize;
    this.addBeforeElement = options.addBeforeElement;
    
    this.headText01 = "click to add more here";
    this.headText02 = "click to minimize";
  },
  
  
  tagName: "div",
  className: "article-edit-add-editor",


  template: JST["template/article/editor/add_editor"],
  
  
  render: function() {
    this.head = $("<div class='article-edit-add-editor-head'>" + this.headText01 + "</div>");
    this.body = $(this.template());
    
    if (this.enableMinimize) {
      this.$el.append(this.head);
      this.$el.append(this.body);
    } else {
      this.$el.append(this.body);
      this.body.show();
    }
    
    return this;
  },
  
  
  events: {
    "click .article-edit-add-editor-head": "onClickHead",
    "click .article-edit-add-text": "addText",
    "click .article-edit-add-picture": "addPicture"
  },
  
  
  onClickHead: function(event) {
    event.preventDefault();
    if (this.body.is(":visible")) {
      this.minimize(500);
    } else {
      this.head.html(this.headText02);
      this.body.slideDown(500);
    }
  },
  
  
  addText: function(event) {
    event.preventDefault();

    this.minimize();
    this.articleEditView.addText(this.addBeforeElement);
  },
  
  
  addPicture: function(event) {
    event.preventDefault();
    
    this.minimize();
    this.articleEditView.addPicture(this.addBeforeElement);
  },
  
  
  minimize: function(animationDuration) {
    if (this.enableMinimize) {
      this.head.html(this.headText01);
      var duration = animationDuration || 0;
      this.body.slideUp(duration);
    }
  }
});
