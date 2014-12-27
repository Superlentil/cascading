View.Layout.Main = Backbone.View.extend({
  initialize: function() {
    var that = this;
    
    _.bindAll(that, "onWidthChange");
    _.bindAll(that, "signIn");
    _.bindAll(that, "signOut");
    _.bindAll(that, "closeNav");
    
    GlobalVariable.Layout.SignInHandler = that.signIn;
    GlobalVariable.Layout.SignOutHandler = that.signOut;
    GlobalVariable.Layout.CloseNavHandler = that.closeNav;
    
    that.leftNavOn = false;
    that.rightNavOn = false;
    that.leftNavWidthInPx = 0;
    that.rightNavWidthInPx = 0;
    
    that.widthChangeThreshold = GlobalVariable.Browser.ScrollBarWidthInPx > 6 ? GlobalVariable.Browser.ScrollBarWidthInPx : 6;
    
    var thisWindow = GlobalVariable.Browser.Window;
    that.windowWidth = thisWindow.outerWidth();
    
    thisWindow.on("resize", function() {
      clearTimeout(that.widthChangeTimeout);
      that.widthChangeTimeout = setTimeout(that.onWidthChange, 300);
    });
  },
  
  
  tagName: "div",
  id: "layout-main",
  
  
  menuIconTemplate: JST["template/layout/menuIcon"],
  userAvatarTemplate: JST["template/layout/userAvatar"],
  headerTemplate: JST["template/layout/header"],
  
  
  render: function() {
    var that = this;
    
    var container = that.$el;
    container.empty();
    
    that.viewLeftNav = new View.Layout.LeftNav();
    that.leftNav = that.viewLeftNav.render().$el;
    that.viewRightNav = new View.Layout.RightNav();
    that.rightNav = that.viewRightNav.render().$el;

    that.adjustSideNavWidth();
    
    that.menuIcon = $(that.menuIconTemplate());
    that.userAvatar = $("<div id='layout-userAvatar'></div>");
    that.renderUserAvatar();

    that.viewHeader = new View.Layout.Header();
    that.header = that.viewHeader.render().$el;
    
    that.mainBody = $("<div id='layout-mainBody'></div>");
    that.mainBody.append("<div id='layout-mainBody-clickListener'></div>");
    that.mainBody.append(that.header);
    that.mainBody.append("<div id='layout-content' class='container'></div>");  
    
    that.viewPopup = new View.Layout.Popup();
    GlobalVariable.Layout.ViewPopup = that.viewPopup;
    
    container.append(that.viewPopup.render().$el);
    container.append(that.leftNav);
    container.append(that.rightNav);
    container.append(that.menuIcon);
    container.append(that.userAvatar);
    container.append(that.popup);
    container.append(that.mainBody);
    
    return that;
  },
  
  
  refresh: function() {
    this.viewContent.remove();
    $("#layout-mainBody").append("<div id='layout-content' class='container'></div>");
    return this;
  },
  
  
  onWidthChange: function(event) {
    var thisWindow = GlobalVariable.Browser.Window;
    GlobalVariable.Browser.WindowHeightInPx = thisWindow.height();
    
    var windowWidth = thisWindow.outerWidth();
    if (Math.abs(this.windowWidth - windowWidth) > this.widthChangeThreshold) {   // Width change is expensive. Filter out only height change and very small width change.
      this.windowWidth = windowWidth;
      this.adjustSideNavWidth();

      if (this.viewContent && this.viewContent.onWidthChange) {
        this.viewContent.onWidthChange(event);
      }
    }
  },
  
  
  adjustSideNavWidth: function() {  
    var navWidth = $("body").width() * 0.75;
    if (navWidth > 360) {
      navWidth = 360;
    }
    
    if (navWidth !== this.leftNavWidthInPx) {
      var navContentWidth = navWidth - GlobalConstant.SideNav.BORDER_SHADOW_WIDTH_IN_PX;
      this.leftNavWidthInPx = navWidth;
      this.rightNavWidthInPx = navWidth;
            
      navWidth = ["-", navWidth, "px"].join("");
      navContentWidth = [navContentWidth, "px"].join("");
      this.leftNav.css({
        "left": navWidth,
        "width": navContentWidth
      });
      this.rightNav.css({
        "right": navWidth,
        "width": navContentWidth
      });
      
      if (this.leftNavOn) {
        this.leftNav.transition({x: this.leftNavWidthInPx}, 0);
      }
      if (this.rightNavOn) {
        this.rightNav.transition({x: -this.rightNavWidthInPx}, 0);
      }
    }
  },
  
  
  events: {
    "click #layout-menuIcon": "openLeftNav",
    "click #layout-userAvatar": "openRightNav"
  },
  
  
  openLeftNav: function(event) {  
    event.preventDefault();
    event.stopPropagation();
    
    var leftNavOn = this.leftNavOn;
    this.closeNav();
    if (!leftNavOn) {
      this.leftNavOn = true;
      this.viewHeader.undelegateEvents();
      this.viewContent.undelegateEvents();
      this.mainBody.on("click", this.closeNav);
      this.leftNav.transition({x: this.leftNavWidthInPx}, 500, "ease");
      this.menuIcon.transition({rotate: "360deg"}, 500, "ease");
    }
  },
  
  
  openRightNav: function(event) {
    event.preventDefault();
    event.stopPropagation();
    
    var rightNavOn = this.rightNavOn;
    this.closeNav();
    if (!rightNavOn) {
      this.rightNavOn = true;
      this.viewHeader.undelegateEvents();
      this.viewContent.undelegateEvents();
      this.mainBody.on("click", this.closeNav);
      this.rightNav.transition({x: -this.rightNavWidthInPx}, 500, "ease");
      this.userAvatar.transition({rotate: "-360deg"}, 500, "ease");
    }
  },
  
  
  closeNav: function(event, immediateClose) {
    if (this.leftNavOn || this.rightNavOn) {
      if (event) {
        event.preventDefault();
        event.stopPropagation();
      }

      var speed = 500;
      if (immediateClose === true) {
        speed = 0;
      }
      
      if (this.leftNavOn) {
        this.leftNavOn = false;
        this.leftNav.transition({x: 0}, speed, "ease");
        this.menuIcon.transition({rotate: 0}, speed, "ease");
      }
      
      if (this.rightNavOn) {
        this.rightNavOn = false;
        this.rightNav.transition({x: 0}, speed, "ease");
        this.userAvatar.transition({rotate: 0}, speed, "ease");
      }
      
      this.mainBody.off("click");
      this.viewHeader.delegateEvents();
      this.viewContent.delegateEvents();
    }
  },
  
  
  signIn: function(email, password, alreadyHasLoginSession, callbacks) {
    if (alreadyHasLoginSession) {
      this.renderUserAvatar();
      this.viewHeader.render();
      this.viewRightNav.render();
      Backbone.history.loadUrl();
      if (callbacks) {
        callbacks.success();
      }
    } else {
      var that = this;
      var loginSession = new Model.LoginSession();
      loginSession.save("login_session", {"type": "log in", "email": email, "password": password}, {
        success: function() {
          that.renderUserAvatar();
          that.viewHeader.render();
          that.viewRightNav.render();
          Backbone.history.loadUrl();
          if (callbacks) {
            callbacks.success();
          }
        }
      });
    }
  },
  
  
  signOut: function() {
    var that = this;
    
    var loginSession = new Model.LoginSession();
    loginSession.save("login_session", {"type": "log out"}, {
      success: function() {
        that.renderUserAvatar();
        if (that.userAvatar.is(":hidden")) {
          that.closeNav(null, true);
        }        
        that.viewHeader.render();
        that.viewRightNav.render();
        Backbone.history.navigate("#", {trigger: true});
      }
    });
  },
  
  
  renderUserAvatar: function() {
    if ($.cookie("user_id")) {
      this.userAvatar.show();
      this.userAvatar.html("<img id='layout-userAvatar-img' src='" + $.cookie("user_avatar_url") +"'>");
    } else {
      this.userAvatar.hide();
    }
  },

  
  remove: function() {
    GlobalVariable.Browser.Window.off("resize");
    this.mainBody.off("click");
    
    this.viewPopup.remove();
    this.viewLeftNav.remove();
    this.viewRightNav.remove();
    this.viewHeader.remove();
    this.viewContent.remove();
    
    this.leftNav = null;
    this.rightNav = null;
    this.menuIcon = null;
    this.userAvatar = null;
    this.header = null;
    this.mainBody = null;
    
    Backbone.View.prototype.remove.call(this);
  }
});
