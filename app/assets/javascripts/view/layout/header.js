View.Layout.Header = Backbone.View.extend({
  initialize: function(options) {   
    this.signInHandler = options.signInHandler;
  },
  
  
  tagName: "div",
  className: "container",
  
  
  template: JST["template/layout/header"],
  
  
  render: function() {
    this.$el.html(this.template());
    this.headerChanged = false;
    return this;
  },
  
  
  events: {
    "click #layout-header-form-submit": "onSignIn"
  },
  
  
  onSignIn: function(event) {
    event.preventDefault();
    
    var email = $("#layout-header-form-email").val();
    var password = $("#layout-header-form-password").val();    
    this.signInHandler(email, password);
  }
});
