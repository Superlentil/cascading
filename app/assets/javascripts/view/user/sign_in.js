View.User.SignIn = Backbone.View.extend({
  initialize: function(options) {
    this.popupCache = options.popupCache;
    if (!this.popupCache.signInEmail) {
      this.popupCache.signInEmail = "";
    }
  },
  
  
  tagName: "div",
  id: "user-sign-in",
  className: "container",
  template: JST["template/user/sign_in"],
  
  
  render: function() {
    this.$el.html(this.template({email: this.popupCache.signInEmail}));
    return this;
  },
  
  
  events: {
    "click .m-close-popup": "closePopup",
    
    "blur #user-sign-in-email": "recordEmail",
    
    "click #user-sign-in-submit": "onSignIn",
    "keyup #user-sign-in-email": "enterToSignIn",
    "keyup #user-sign-in-password": "enterToSignIn"
  },
  
  
  closePopup: function(event) {
    GlobalVariable.Layout.ViewPopup.closePopup();
  },
  
  
  recordEmail: function(event) {
    this.popupCache.signInEmail = $(event.currentTarget).val();
  },
  
  
  onSignIn: function(event) {
    event.preventDefault();
    
    var that = this;
    
    var email = $("#user-sign-in-email").val();
    var password = $("#user-sign-in-password").val();    
    GlobalVariable.Layout.SignInHandler(email, password, false, {
      success: function() {
        that.popupCache.signInEmail = "";
        GlobalVariable.Layout.ViewPopup.closePopup();
      }
    });
  },


  enterToSignIn: function(event) {
    if (event.keyCode === 13) {
      this.onSignIn(event);
    }
  }
});