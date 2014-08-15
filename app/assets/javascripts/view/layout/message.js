View.Layout.Message = Backbone.View.extend({
  el: "#layout-message",
  
  
  template: JST["template/layout/message"],
  
  
  render: function() {
    var that = this;
    
    var messageType = $.cookie("message_type");
    var messageContent = $.cookie("message_content");
    if (messageType && messageContent) {
      that.$el.html(that.template({messageType: messageType, messageContent: messageContent}));
      that.$el.show();
      that.$el.fadeOut(10000);
    }
    $.removeCookie("message_type");
    $.removeCookie("message_content");
    
    return that;
  }
});
