var slided = false;


Views.Layouts.Header = Backbone.View.extend({
  el: "#main-header",
  
  
  template: JST["templates/layouts/header"],
  
  
  render: function() {
    this.$el.html(this.template());
    return this;
  },
  
  
  events: {
    "click #login_submit_button": "onLogin",
    "click #log_out_button": "onLogOut",
    "click .avatar-img": "openRightSideBar"
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
  },
  
  
  openRightSideBar: function(event) {
    event.preventDefault();

    $("#main_container").css({
      "background-color": "yellow",
    });
    
    if (slided) {
      slided = false;
      $("#main_container").animate({
        "width": "100%",
        "margin-left": "0"
      });
    } else {
      slided = true;
      var width = - $("#main_container").width() * 0.7;
      $("#main_container").animate({
        "width": "100%",
        "margin-left": width + "px"
      });
    }
  }
});
