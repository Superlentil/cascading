View.User.Header = Backbone.View.extend({
  initialize: function(options) {
    this.user = options.user;
  },
  
  
  tagName: "div",
  className: "user-header-container",
  
  
  template: JST["template/user/header"],
  
  
  render: function() {  
    this.$el.html(this.template({user: this.user}));
       
    return this;
  }
});
