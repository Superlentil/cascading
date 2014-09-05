View.Layout.Header = Backbone.View.extend({
  initialize: function() {   
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
  }
});
