Views.Layouts.Header = Backbone.View.extend({
  el: "div#main_header",
  
  
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
    loginSession.save("login_session", {"type": "sign in", "email": $("#login_email_input").val(), "password": $("#login_password_input").val()}, {
      success: function(loginSession) {
        $.cookie("user_id", loginSession.get("user_id"));
        $.cookie("user_nickname", loginSession.get("user_nickname"));
        $.cookie("user_avatar_url", loginSession.get("user_avatar_url"));
        Backbone.history.loadUrl();
      }
    });
  },
  
  
  onLogOut: function(event) {
    event.preventDefault();
    
    var loginSession = new Models.Layouts.LoginSession();
    loginSession.save("login_session", {"type": "sign out"}, {
      success: function() {
        $.removeCookie("user_id");
        $.removeCookie("user_nickname");
        $.removeCookie("user_avatar_url");
        Backbone.history.loadUrl();
      }
    });
  }
});
