var slided = false;


Views.Layouts.Header = Backbone.View.extend({
  el: "#layouts-header",
  
  
  template: JST["templates/layouts/header"],
  
  
  render: function() {
    this.$el.html(this.template());
    return this;
  },
  
  
  events: {
    "click #login_submit_button": "onLogin",
    "click #log_out_button": "onLogOut",
    "click .avatar-img": "openRightSideBar",
    "click .navbar-brand": "openLeftSideBar"
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
  
  
  openLeftSideBar: function(event) {
    event.preventDefault();
    
    $("#layouts-leftNav").css("z-index", GlobalConstant.Layout.SHOWN_NAV_Z_INDEX);
    
    if (slided) {
      slided = false;
      $("#layouts-header").animate({
        "left": 0,
        "width": "100%",
      }, 400);
      $("#layouts-navBlocker").animate({
        "width": "100%",
        "margin-left": "0"
      }, 400, function() {
        $("#layouts-leftNav").css("z-index", GlobalConstant.Layout.HIDDEN_NAV_Z_INDEX);
      });
    } else {
      slided = true;
      var slideDistance = $("#layouts-navBlocker").width() * 0.3;
      $("#layouts-header").animate({
        "left": slideDistance + "px",
        "width": "100%"
      }, 400);
      $("#layouts-navBlocker").animate({
        "width": "100%",
        "margin-left": slideDistance + "px"
      }, 400);
    }
  },
  
  
  openRightSideBar: function(event) {
    event.preventDefault();
    
    $("#layouts-rightNav").css("z-index", GlobalConstant.Layout.SHOWN_NAV_Z_INDEX);
    
    if (slided) {
      slided = false;
      $("#layouts-header").animate({
        "left": 0,
        "width": "100%",
      }, 400);
      $("#layouts-navBlocker").animate({
        "width": "100%",
        "margin-left": "0"
      }, 400, function() {
        $("#layouts-rightNav").css("z-index", GlobalConstant.Layout.HIDDEN_NAV_Z_INDEX);
      });
    } else {
      slided = true;
      var slideDistance = - $("#layouts-navBlocker").width() * 0.3;
      $("#layouts-header").animate({
        "left": slideDistance + "px",
        "width": "100%"
      }, 400);
      $("#layouts-navBlocker").animate({
        "width": "100%",
        "margin-left": slideDistance + "px"
      }, 400);
    }
  }
});
