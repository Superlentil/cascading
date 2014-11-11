View.Article.Editor.ColorPicker = Backbone.View.extend({
  initialize: function(options) {
    this.colorPickHandler = null;
  },
  
  
  tagName: "div",
  className: "color-picker-container",
  
  
  template: JST["template/article/editor/color_picker"],
  
  
  render: function() {
    this.$el.html(this.template());
    return this;
  },
  
  
  setColorPickHandler: function(colorPickHandler) {
    this.colorPickHandler = colorPickHandler;
  },
  
  
  events: {
    "click pre": "selectColor",
  },
  
  
  selectColor: function(event) {
    var color = $(event.currentTarget).data("color");
    if (this.colorPickHandler) {
      this.colorPickHandler(color);
    }
  }
});