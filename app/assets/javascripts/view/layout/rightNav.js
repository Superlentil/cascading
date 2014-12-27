View.Layout.RightNav = Backbone.View.extend({  
  tagName: "nav",
  id: "layout-rightNav",
  attributes: {"role": "navigation"},
  
  
  template: JST["template/layout/rightNav"],
  
  
  render: function() {
    this.$el.html(this.template());
    return this;
  },
  
  
  events: {
    "click #layout-rightNav-form-submit": "onSignIn",
    "click #layout-rightNav-signOut": "onSignOut",
    "click .m-close-nav": "onCloseNav",
    "keyup #layout-rightNav-form-email": "enterToSignIn",
    "keyup #layout-rightNav-form-password": "enterToSignIn"
  },
  
  
  onSignIn: function(event) {
    event.preventDefault();
    
    var email = $("#layout-rightNav-form-email").val();
    var password = $("#layout-rightNav-form-password").val();    
    GlobalVariable.Layout.SignInHandler(email, password);
  },
  
  
  onSignOut: function(event) {
    event.preventDefault();
    GlobalVariable.Layout.SignOutHandler();
  },
  
  
  onCloseNav: function(event) {
    GlobalVariable.Layout.CloseNavHandler();
  },
  
  
  enterToSignIn: function(event) {
    if (event.keyCode == 13) {
      this.onSignIn(event);
    }
  }
});
