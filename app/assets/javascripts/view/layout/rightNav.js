View.Layout.RightNav = Backbone.View.extend({
  initialize: function(options) {   
    this.signInHandler = options.signInHandler;
    this.signOutHandler = options.signOutHandler;
    this.closeNavHandler = options.closeNavHandler;
  },
  
  
  tagName: "div",
  id: "layout-rightNav-content",
  className: "container",
  
  
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
    this.signInHandler(email, password);
  },
  
  
  onSignOut: function(event) {
    event.preventDefault();
    this.signOutHandler();
  },
  
  
  onCloseNav: function(event) {
    this.closeNavHandler();
  },
  
  
  enterToSignIn: function(event) {
    if (event.keyCode == 13) {
      this.onSignIn(event);
    }
  }
});
