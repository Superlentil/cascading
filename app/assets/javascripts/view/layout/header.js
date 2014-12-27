View.Layout.Header = Backbone.View.extend({
  tagName: "nav",
  id: "layout-header",
  className: "container",
  attributes: {"role": "navigation"},
  
  
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
    GlobalVariable.Layout.SignInHandler(email, password);
  },
  
  
  enterToSignIn: function(event) {
    if (event.keyCode == 13) {
      this.onSignIn(event);
    }
  },
  
  
  popupSignInForm: function(event) {
    event.preventDefault();
    
    $(event.currentTarget).transition({scale: 0.7}, 200, "ease").transition({scale: 1}, 200, "ease");
    
    var viewPopup = GlobalVariable.Layout.ViewPopup;
    var viewUserSignIn = new View.User.SignIn();
    viewPopup.renderContent(viewUserSignIn);
    viewPopup.openPopup();
  }
});
