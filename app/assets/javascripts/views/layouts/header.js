Views.Layouts.Header = Backbone.View.extend({
  el: "#main-header",
  
  
  template: JST["templates/layouts/header"],
  
  
  render: function() {
    this.$el.html(this.template());
    return this;
  },
  
  
  events: {
    "click #login_submit_button": "onLogin",
    "click #log_out_button": "onLogOut"
  },
  
  
  onLogin: function(event) {
    event.preventDefault();
    
    var loginSession = new Models.Layouts.LoginSession();
    loginSession.save("login_session", {"type": "log in", "email": $("#login_email_input").val(), "password": $("#login_password_input").val()}, {
      success: function() {
        Backbone.history.loadUrl();
      }
    });
  },
  
  
  onLogOut: function(event) {
    event.preventDefault();
    
    var loginSession = new Models.Layouts.LoginSession();
    loginSession.save("login_session", {"type": "log out"}, {
      success: function() {
        Backbone.history.loadUrl("");
      }
    });
  }
});
