View.User.SignIn = Backbone.View.extend({
  tagName: "div",
  id: "user-sign-in",
  className: "container",
  template: JST["template/user/sign_in"],
  
  
  render: function() {
    this.$el.html(this.template());
    return this;
  },
  
  
  events: {
    "click .m-close-popup": "closePopup",
    "click #user-sign-in-submit": "onSignIn",
    "keyup #user-sign-in-email": "enterToSignIn",
    "keyup #user-sign-in-password": "enterToSignIn"
  },
  
  
  closePopup: function(event) {
    GlobalVariable.Layout.ViewPopup.closePopup();
  },
  
  
  onSignIn: function(event) {
    event.preventDefault();
    
    var email = $("#user-sign-in-email").val();
    var password = $("#user-sign-in-password").val();    
    GlobalVariable.Layout.SignInHandler(email, password, false, {
      success: function() {
        GlobalVariable.Layout.ViewPopup.closePopup();
      }
    });
  },


  enterToSignIn: function(event) {
    if (event.keyCode == 13) {
      this.onSignIn(event);
    }
  }
});