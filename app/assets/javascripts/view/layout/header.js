View.Layout.Header = Backbone.View.extend({
  initialize: function(options) {   
    this.functionToOpenLeftNav = options.functionToOpenLeftNav;
    this.functionToOpenRightNav = options.functionToOpenRightNav;
    
    this.headerChanged = false;
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
    "click #login_submit_button": "onLogin",
    "click #log_out_button": "onLogOut",
    "click .layout-header-openLeftNav": "openLeftNav",
    "click .layout-header-openRightNav": "openRightNav"
  },
  
  
  onLogin: function(event) {
    event.preventDefault();
    
    var that = this;
    
    var loginSession = new Model.Layout.LoginSession();
    loginSession.save("login_session", {"type": "log in", "email": $("#login_email_input").val(), "password": $("#login_password_input").val()}, {
      success: function() {
        that.headerChanged = true;
        Backbone.history.loadUrl();
      }
    });
  },
  
  
  onLogOut: function(event) {
    event.preventDefault();
    
    var that = this;
    
    var loginSession = new Model.Layout.LoginSession();
    loginSession.save("login_session", {"type": "log out"}, {
      success: function() {
        that.headerChanged = true;
        Backbone.history.loadUrl("");
      }
    });
  },
  
  
  openLeftNav: function(event) {
    event.preventDefault();
    event.stopPropagation();
    
    this.functionToOpenLeftNav();
  },
  
  
  openRightNav: function(event) {
    event.preventDefault();
    event.stopPropagation();
    
    this.functionToOpenRightNav();
  }
});
