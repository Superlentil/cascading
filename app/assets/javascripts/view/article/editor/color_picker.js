View.Article.Editor.ColorPicker = Backbone.View.extend({
  initialize: function(options) {
    this.colorPickHandler = null;
  },
  
  
  tagName: "div",
  className: "color-picker-container",
  
  
  template: JST["template/article/editor/color_picker"],
  
  
  render: function() {
    this.$el.html(this.template());
    this.userColorInput = this.$el.find("input");
    return this;
  },
  
  
  setColorPickHandler: function(colorPickHandler) {
    this.colorPickHandler = colorPickHandler;
  },
  
  
  events: {
    "click pre": "selectColor",
    "change input": "showUserColor",
    "keyup input": "showUserColor",
    "click button": "selectUserColor"
  },
  
  
  selectColor: function(event) {
    event.preventDefault();
    $(event.currentTarget).transition({scale: 0.7}, 250, "ease").transition({scale: 1}, 250, "ease");
    var color = $(event.currentTarget).data("color");
    if (this.colorPickHandler) {
      this.colorPickHandler(color);
    }
  },
  
  
  getUserColorInput: function() {
    var value = this.userColorInput.val().toLowerCase() + "000";
    if (value.charAt(0) === '#') {
      value = value.substr(1);
    }
    var length = value.length;
    if (length > 6) {
      value = value.substr(0, 6);
    } else if (length > 3) {
      value = value.substr(0, 3);
    }
    var numArray = value.split("");
    length = numArray.length;
    
    for (var index = 0; index < length; ++index) {
      var num = numArray[index];
      if ((num < '0' || num > '9') && (num < 'a'|| num > 'f')) {
        numArray[index] = '0';
      }
    }

    return "#" + numArray.join("");
  },
  
  
  showUserColor: function(event) {
    var color = this.getUserColorInput();
    this.userColorInput.css("background-color", color);
  },
  
  
  selectUserColor: function(event) {
    event.preventDefault();
    $(event.currentTarget).transition({scale: 0.7, y: "10px"}, 250, "ease").transition({scale: 1, y: 0}, 250, "ease");
    var color = this.getUserColorInput();
    if (this.colorPickHandler) {
      this.colorPickHandler(color);
    }
  }
});