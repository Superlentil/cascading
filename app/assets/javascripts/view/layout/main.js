View.Layout.Main = Backbone.View.extend({
  initialize: function() {
    var that = this;
    
    _.bindAll(that, "onResize");
    _.bindAll(that, "signIn");
    _.bindAll(that, "signOut");
    
    that.leftNavOn = false;
    that.rightNavOn = false;
    that.leftNavWidthInPx = 0;
    that.rightNavWidthInPx = 0;
    
    $(window).on("resize", function() {
      clearTimeout(that.resizeTimeout);
      that.resizeTimeout = setTimeout(that.onResize, 300);
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
        
    that.leftNav = $("<div id='layout-leftNav' role='navigation'></div>");
    that.rightNav = $("<div id='layout-rightNav' role='navigation'></div>");
    that.adjustSideNavWidth();
    
    that.viewLeftNav = new View.Layout.LeftNav();
    that.leftNav.append(that.viewLeftNav.render().$el);
    
    that.viewRightNav = new View.Layout.RightNav({signInHandler: that.signIn, signOutHandler: that.signOut});
    that.rightNav.append(that.viewRightNav.render().$el);
    
    that.menuIcon = $(that.menuIconTemplate());
    that.userAvatar = $("<div id='layout-userAvatar'></div>");
    that.renderUserAvatar();

    that.header = $("<nav id='layout-header' role='navigation'></nav>");
    that.viewHeader = new View.Layout.Header({signInHandler: that.signIn});
    that.header.append(that.viewHeader.render().$el);
    
    var mainBody = $("<div id='layout-mainBody'></div>");
    mainBody.append(that.menuIcon);
    mainBody.append(that.userAvatar);
    mainBody.append(that.header);
    mainBody.append("<div id='layout-message' class='container'></div><div id='layout-content' class='container'></div>");  
    
    container.append(that.leftNav);
    container.append(that.rightNav);
    container.append(mainBody);
    
    that.viewMessage = new View.Layout.Message();
    that.viewMessage.render();
       
    return that;
  },
  
  
  refresh: function() {
    this.viewContent.remove();
    this.viewMessage.remove();
    $("#layout-mainBody").append("<div id='layout-message' class='container'></div><div id='layout-content' class='container'></div>");
    this.viewMessage = new View.Layout.Message();
    this.viewMessage.render();
    return this;
  },
  
  
  onResize: function(event) {
    this.closeNav(null, true);
    this.adjustSideNavWidth();
    
    if (this.viewContent && this.viewContent.onResize) {
      this.viewContent.onResize(event);
    }
  },
  
  
  adjustSideNavWidth: function() {  
    var navWidth = $(window).width() * 0.618;
    if (navWidth > 300) {
      navWidth = 300;
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
    }
  },
  
  
  events: {
    "click #layout-menuIcon": "openLeftNav",
    "click #layout-userAvatar": "openRightNav",
    "click #layout-mainBody": "closeNav"
  },
  
  
  getMenuIconTransitionOffset: function() {
    return this.menuIcon.position().left + this.menuIcon.width() / 2.0 + GlobalConstant.SideNav.BORDER_SHADOW_WIDTH_IN_PX;
  },
  
  
  getUserAvatarTransitionOffset: function() {
    return this.header.width() - this.userAvatar.position().left - this.userAvatar.width() / 2.0 + GlobalConstant.SideNav.BORDER_SHADOW_WIDTH_IN_PX;
  },
  
  
  openLeftNav: function(event) {
    if (!this.leftNavOn) {
      event.preventDefault();
      event.stopPropagation();
      
      if (this.rightNavOn) {
        this.rightNavOn = false;
        this.rightNav.transition({x: 0}, 500, "ease");
        this.userAvatar.transition({x: 0}, 400, "out");
      }
      
      this.leftNavOn = true;
      this.leftNav.transition({x: this.leftNavWidthInPx}, 500, "ease");
      this.menuIcon.transition({x: this.leftNavWidthInPx - this.getMenuIconTransitionOffset()}, 400, "in");
      
      this.viewHeader.undelegateEvents();
      this.viewContent.undelegateEvents();
    }
  },
  
  
  openRightNav: function(event) {
    if (!this.rightNavOn) {
      event.preventDefault();
      event.stopPropagation();
      
      if (this.leftNavOn) {
        this.leftNavOn = false;
        this.leftNav.transition({x: 0}, 500, "ease");
        this.menuIcon.transition({x: 0}, 400, "out");
      }
      
      this.rightNavOn = true;
      this.rightNav.transition({x: -this.rightNavWidthInPx}, 500, "ease");
      this.userAvatar.transition({x: -this.rightNavWidthInPx + this.getUserAvatarTransitionOffset(), delay: 100}, 300, "in");
      
      this.viewHeader.undelegateEvents();
      this.viewContent.undelegateEvents();
    }
  },
  
  
  closeNav: function(event, immediateClose) {
    if (this.leftNavOn || this.rightNavOn) {
      if (event) {
        event.preventDefault();
        event.stopPropagation();
      }

      var navSpeed = 500;
      var iconSpeed = 400;
      if (immediateClose === true) {
        navSpeed = 0;
        iconSpeed = 0;
      }
      
      if (this.leftNavOn) {
        this.leftNavOn = false;
        this.leftNav.transition({x: 0}, navSpeed, "ease");
        this.menuIcon.transition({x: 0}, iconSpeed, "out");
      }
      
      if (this.rightNavOn) {
        this.rightNavOn = false;
        this.rightNav.transition({x: 0}, navSpeed, "ease");
        this.userAvatar.transition({x: 0}, iconSpeed, "out");
      }
      
      this.viewHeader.delegateEvents();
      this.viewContent.delegateEvents();
    }
  },
  
  
  signIn: function(email, password) {
    var that = this;

    var loginSession = new Model.Layout.LoginSession();
    loginSession.save("login_session", {"type": "log in", "email": email, "password": password}, {
      success: function() {
        that.renderUserAvatar();
        that.viewHeader.render();
        that.viewRightNav.render();
      }
    });
  },
  
  
  signOut: function() {
    var that = this;
    
    var loginSession = new Model.Layout.LoginSession();
    loginSession.save("login_session", {"type": "log out"}, {
      success: function() {
        that.renderUserAvatar();
        if (that.userAvatar.css("display") === "none") {
          that.closeNav(null, true);
        }        
        that.viewHeader.render();
        that.viewRightNav.render();
      }
    });
  },
  
  
  renderUserAvatar: function() {
    if ($.cookie("user_id")) {
      this.userAvatar.removeClass("hidden-sm-and-larger");
      this.userAvatar.html("<img id='layout-userAvatar-img' src='" + $.cookie("user_avatar_url") +"'>");
    } else {
      this.userAvatar.addClass("hidden-sm-and-larger");
      this.userAvatar.html("<div id='layout-userAvatar-notLogin'></div>");
    }
  },

  
  remove: function() {
    this.viewLeftNav.remove();
    this.viewRightNav.remove();
    this.viewHeader.remove();
    this.viewMessage.remove();
    this.viewContent.remove();
    
    this.leftNav = null;
    this.rightNav = null;
    this.menuIcon = null;
    this.userAvatar = null;
    this.header = null;
    
    $(window).off("resize");
    
    Backbone.View.prototype.remove.call(this);
  }
});
