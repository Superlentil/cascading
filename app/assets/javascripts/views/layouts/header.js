Views.Layouts.Header = Backbone.View.extend({
  el: "div#main_header",
  
  
  template: JST["templates/layouts/header"],
  
  
  render: function() {
    this.$el.html(this.template());
    return this;
  },
  
  
  events: {
    "click #login_submit_button": "onLogin"
  },
  
  
  onLogin: function() {
    var loginSession = new Models.Layouts.LoginSession();
    loginSession.save("login_session", {"email": $("#login_email_input").val(), "password": $("#login_password_input").val()}, {
      success: function(loginSession) {
        // console.log(loginSession);
      }
    });
  }
});
