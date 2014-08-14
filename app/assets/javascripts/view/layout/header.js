View.Layout.Header = Backbone.View.extend({
  tagName: "div",
  className: "container",
  
  
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
    event.stopPropagation();
    
    var that = this;

    if (GlobalVariable.Layout.leftNavOn) {
      GlobalVariable.Layout.leftNavOn = false;
      $("#layout-leftNav").transition({x: 0});
    } else {
      if (GlobalVariable.Layout.rightNavOn) {
        GlobalVariable.Layout.rightNavOn = false;
        $("#layout-rightNav").transition({x: 0});
      }
      
      GlobalVariable.Layout.leftNavOn = true;
      $("#layout-leftNav").transition({x: GlobalVariable.Layout.leftNavWidth});
    }
  },
  
  
  openRightSideBar: function(event) {
    event.preventDefault();
    event.stopPropagation();
    
    var that = this;
            
    if (GlobalVariable.Layout.rightNavOn) {
      GlobalVariable.Layout.rightNavOn = false;
      $("#layout-rightNav").transition({x: 0});
    } else {
      if (GlobalVariable.Layout.leftNavOn) {
        GlobalVariable.Layout.leftNavOn = false;
        $("#layout-leftNav").transition({x: 0});
      }
      
      GlobalVariable.Layout.rightNavOn = true;
      $("#layout-rightNav").transition({x: -GlobalVariable.Layout.rightNavWidth});
    }
  },
  
  
  clearNav: function(event) {
    event.preventDefault();
    
    var that = this;
    alert("aaaa");
    
    if (GlobalVariable.Layout.leftNavOn) {
      GlobalVariable.Layout.leftNavOn = false;
      $("#layout-leftNav").transition({x: 0});
    }
    
    if (GlobalVariable.Layout.rightNavOn) {
      GlobalVariable.Layout.rightNavOn = false;
      $("#layout-rightNav").transition({x: 0});
    }
  }
});
