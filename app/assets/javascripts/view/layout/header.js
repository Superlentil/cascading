View.Layout.Header = Backbone.View.extend({
  initialize: function(options) {   
    this.signInHandler = options.signInHandler;
  },
  
  
  tagName: "div",
  className: "container",
  
  
  template: JST["template/layout/header"],
  
  
  render: function() {
    this.$el.html(this.template());
    return this;
  },
  
  
  events: {
    "click #layout-header-form-submit": "onSignIn",
    "keyup #layout-header-form-password": "enterToSignIn",
    "keyup #layout-header-form-email": "enterToSignIn",
    
    "click .layout-header-signinup": "popupSignInForm"
  },
  
  
  onSignIn: function(event) {
    event.preventDefault();
    
    var email = $("#layout-header-form-email").val();
    var password = $("#layout-header-form-password").val();    
    this.signInHandler(email, password);
  },
  
  
  enterToSignIn: function(event) {
    if (event.keyCode == 13) {
      this.onSignIn(event);
    }
  },
  
  
  popupSignInForm: function(event) {
    event.preventDefault();
    
    $("body").css("overflow", "hidden");
    
    $(event.currentTarget).transition({scale: 0.7}, 200, "ease").transition({scale: 1}, 200, "ease");
    
    $("#layout-popup").addClass("m-popped-up");
  }
});
