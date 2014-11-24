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
    "click .layout-rightNav-alsoCloseNav": "onAlsoCloseNav"
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
  
  
  onAlsoCloseNav: function(event) {
    this.closeNavHandler();
  }
});
