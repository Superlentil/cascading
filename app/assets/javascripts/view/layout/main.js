View.Layout.Main = Backbone.View.extend({
  initialize: function() {
    var that = this;
    
    _.bindAll(that, "onResize");
    _.bindAll(that, "openLeftNav");
    _.bindAll(that, "openRightNav");
    
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
  
  
  render: function() {
    var that = this;
    
    var container = that.$el;
    container.empty();
        
    that.leftNav = $("<div id='layout-leftNav' role='navigation'></div>");
    that.rightNav = $("<div id='layout-rightNav' role='navigation'></div>");
    that.adjustSideNavWidth();
    
    that.viewLeftNav = new View.Layout.LeftNav();
    that.leftNav.append(that.viewLeftNav.render().$el);
    
    that.viewRightNav = new View.Layout.RightNav();
    that.rightNav.append(that.viewRightNav.render().$el);
    
    var header = $("<nav id='layout-header' role='navigation'></nav>");
    
    that.viewHeader = new View.Layout.Header({functionToOpenLeftNav: that.openLeftNav, functionToOpenRightNav: that.openRightNav});
    header.append(that.viewHeader.render().$el);
       
    var mainBody = $("<div id='layout-mainBody'></div>");
    mainBody.append("<div id='layout-leftMenuIcon'><div style='height:30px; width:25px; background-color: blue;'></div></div>");
    mainBody.append(header);
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
    if (this.viewHeader.headerChanged) {
      this.viewHeader.remove();
      this.viewHeader = new View.Layout.Header({functionToOpenLeftNav: this.openLeftNav, functionToOpenRightNav: this.openRightNav});
      $("#layout-header").html(this.viewHeader.render().$el);
    }
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
      
      if (this.leftNavOn) {
        this.leftNav.transition({x: this.leftNavWidthInPx}, 0);
      }
      if (this.rightNavOn) {
        this.rightNav.transition({x: -this.rightNavWidthInPx}, 0);
      }
    }
  },
  
  
  events: {
    "click #layout-mainBody": "closeNav"
  },
  
  
  openLeftNav: function() {
    if (!this.leftNavOn) {
      if (this.rightNavOn) {
        this.rightNavOn = false;
        this.rightNav.transition({x: 0}, 500, "ease");
      }
      
      this.leftNavOn = true;
      this.leftNav.transition({x: this.leftNavWidthInPx}, 500, "ease");
      
      this.viewContent.undelegateEvents();
    }
  },
  
  
  openRightNav: function() {
    if (!this.rightNavOn) {
      if (this.leftNavOn) {
        this.leftNavOn = false;
        this.leftNav.transition({x: 0}, 500, "ease");
      }
      
      this.rightNavOn = true;
      this.rightNav.transition({x: -this.rightNavWidthInPx}, 500, "ease");
      
      this.viewContent.undelegateEvents();
    }
  },
  
  
  closeNav: function(event) {
    if (this.leftNavOn || this.rightNavOn) {
      event.preventDefault();
      event.stopPropagation();
      
      if (this.leftNavOn) {
        this.leftNavOn = false;
        this.leftNav.transition({x: 0}, 500, "ease");
      }
      
      if (this.rightNavOn) {
        this.rightNavOn = false;
        this.rightNav.transition({x: 0}, 500, "ease");
      }
      
      this.viewContent.delegateEvents();
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
    
    $(window).off("resize");
    
    Backbone.View.prototype.remove.call(this);
  }
});
