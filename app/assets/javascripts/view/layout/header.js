var slided = false;


View.Layout.Header = Backbone.View.extend({
  el: "#layout-header",
  
  
  template: JST["template/layout/header"],
  
  
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
    
    var loginSession = new Model.Layout.LoginSession();
    loginSession.save("login_session", {"type": "log in", "email": $("#login_email_input").val(), "password": $("#login_password_input").val()}, {
      success: function() {
        Backbone.history.loadUrl();
      }
    });
  },
  
  
  onLogOut: function(event) {
    event.preventDefault();
    
    var loginSession = new Model.Layout.LoginSession();
    loginSession.save("login_session", {"type": "log out"}, {
      success: function() {
        Backbone.history.loadUrl("");
      }
    });
  },
  
  
  openLeftSideBar: function(event) {
    event.preventDefault();
    
    $("#layout-leftNav").css("z-index", GlobalConstant.Layout.SHOWN_NAV_Z_INDEX);
    
    if (slided) {
      slided = false;
      $("#layout-header").velocity({
        "left": 0,
        "width": "100%",
      }, 400);
      $("#layout-canvas").velocity({
        "width": "100%",
        "margin-left": "0"
      }, 400, function() {
        $("#layout-leftNav").css("z-index", GlobalConstant.Layout.HIDDEN_NAV_Z_INDEX);
      });
    } else {
      slided = true;
      var slideDistance = $("#layout-canvas").width() * 0.3;
      $("#layout-header").velocity({
        "left": slideDistance + "px",
        "width": "100%"
      }, 400);
      $("#layout-canvas").velocity({
        "width": "100%",
        "margin-left": slideDistance + "px"
      }, 400);
    }
  },
  
  
  openRightSideBar: function(event) {
    event.preventDefault();
    
    $("#layout-rightNav").css("z-index", GlobalConstant.Layout.SHOWN_NAV_Z_INDEX);
    
    if (slided) {
      slided = false;
      $("#layout-header").velocity({
        "left": 0,
        "width": "100%",
      }, 400);
      $("#layout-canvas").velocity({
        "width": "100%",
        "margin-left": "0"
      }, 400, function() {
        $("#layout-rightNav").css("z-index", GlobalConstant.Layout.HIDDEN_NAV_Z_INDEX);
      });
    } else {
      slided = true;
      var slideDistance = - $("#layout-canvas").width() * 0.3;
      $("#layout-header").velocity({
        "left": slideDistance + "px",
        "width": "100%"
      }, 400);
      $("#layout-canvas").velocity({
        "width": "100%",
        "margin-left": slideDistance + "px"
      }, 400);
    }
  }
});
