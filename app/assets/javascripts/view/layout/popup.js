View.Layout.Popup = Backbone.View.extend({
  tagName: "div",
  id: "layout-popup",
  template: JST["template/layout/popup"],
  
  
  render: function() {
    this.$el.html(this.template());
    return this;
  },
  
  
  renderContent: function(viewContent, options) {
    if (!this.content) {
      this.content = $("#layout-popup-content");
    }
      
    if (this.viewContent) {
      this.viewContent.remove();
    }
    this.content.empty();
    
    this.viewContent = viewContent;
    
    if (options) {
      this.content.append(viewContent.render(options).$el);
    } else {
      this.content.append(viewContent.render().$el);
    }
  },
  
  
  events: {
    "click #layout-popup-close": "closePopup",
    "click #layout-popup-foreground": "closePopup",
    "click #layout-popup-background": "closePopup",
    "click #layout-popup-content": "preventClosePopup"
  },
  
  
  openPopup: function() {
    this.$el.addClass("m-popped-up");
  },
  
  
  closePopup: function(event) {
    if (event) {
      event.preventDefault();
    }
    this.$el.removeClass("m-popped-up");
  },
  
  
  preventClosePopup: function(event) {
    event.stopPropagation();
  },
  
  
  remove: function() {
    if (this.viewContent) {
      this.viewContent.remove();
    }
    
    Backbone.View.prototype.remove.call(this);
  }
});