View.Layout.Main = Backbone.View.extend({
  initialize: function() {
    var that = this;
    
    _.bindAll(that, "onResize");
    _.bindAll(that, "signIn");
    _.bindAll(that, "signOut");
    _.bindAll(that, "closeNav");
    
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
    
    that.viewLeftNav = new View.Layout.LeftNav({closeNavHandler: that.closeNav});
    that.leftNav.append(that.viewLeftNav.render().$el);
    
    that.viewRightNav = new View.Layout.RightNav({signInHandler: that.signIn, signOutHandler: that.signOut, closeNavHandler: that.closeNav});
    that.rightNav.append(that.viewRightNav.render().$el);
    
    that.menuIcon = $(that.menuIconTemplate());
    that.userAvatar = $("<div id='layout-userAvatar'></div>");
    that.renderUserAvatar();

    that.header = $("<nav id='layout-header' role='navigation'></nav>");
    that.viewHeader = new View.Layout.Header({signInHandler: that.signIn});
    that.header.append(that.viewHeader.render().$el);
    
    var mainBody = $("<div id='layout-mainBody'></div>");
    mainBody.append("<div id='layout-mainBody-clickListener'></div>");
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
    this.adjustSideNavWidth();
    
    if (this.viewContent && this.viewContent.onResize) {
      this.viewContent.onResize(event);
    }
  },
  
  
  adjustSideNavWidth: function() {  
    var navWidth = $(window).width() * 0.75;
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
    "click #layout-userAvatar": "openRightNav",
    "click #layout-mainBody": "closeNav"
  },
  
  
  openLeftNav: function(event) {
    if (!this.leftNavOn) {
      event.preventDefault();
      event.stopPropagation();
      
      if (this.rightNavOn) {
        this.rightNavOn = false;
        this.rightNav.transition({x: 0}, 500, "ease");
        this.userAvatar.transition({rotate: 0}, 0);
      }
      
      this.leftNavOn = true;
      this.leftNav.transition({x: this.leftNavWidthInPx}, 500, "ease");
      this.menuIcon.transition({rotate: "360deg"}, 500, "ease");
      
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
        this.menuIcon.transition({rotate: 0}, 0);
      }
      
      this.rightNavOn = true;
      this.rightNav.transition({x: -this.rightNavWidthInPx}, 500, "ease");
      this.userAvatar.transition({rotate: "-360deg"}, 500, "ease");
      
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
