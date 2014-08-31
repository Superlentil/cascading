View.Layout.Main = Backbone.View.extend({
  initialize: function() {
    var that = this;
    
    _.bindAll(that, "onResize");
    _.bindAll(that, "openLeftNav");
    _.bindAll(that, "openRightNav");
    
    that.leftNavOn = false;
    that.rightNavOn = false;
    that.leftNavWidthInPx = 300;
    that.rightNavWidthInPx = 300;
    
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
    
    var viewportWidth = $(window).width();
    var navWidth = viewportWidth * 0.618;
    if (navWidth > 300) {
      navWidth = 300;
    }
    var navContentWidth = navWidth - GlobalConstant.SideNav.BORDER_SHADOW_WIDTH_IN_PX;
    that.leftNavWidthInPx = navWidth;
    that.rightNavWidthInPx = navWidth;
    
    var leftNav = $("<div id='layout-leftNav' role='navigation'></div>");
    var rightNav = $("<div id='layout-rightNav' role='navigation'></div>");
    var header = $("<nav id='layout-header' role='navigation'></nav>");
    
    navWidth = ["-", navWidth, "px"].join("");
    navContentWidth = [navContentWidth, "px"].join("");
    leftNav.css({
      "left": navWidth,
      "width": navContentWidth
    });
    rightNav.css({
      "right": navWidth,
      "width": navContentWidth
    });
    
    that.viewLeftNav = new View.Layout.LeftNav();
    leftNav.append(that.viewLeftNav.render().$el);
    
    that.viewRightNav = new View.Layout.RightNav();
    rightNav.append(that.viewRightNav.render().$el);
    
    that.viewHeader = new View.Layout.Header({functionToOpenLeftNav: that.openLeftNav, functionToOpenRightNav: that.openRightNav});
    header.append(that.viewHeader.render().$el);
    
    container.append(leftNav);
    container.append(rightNav);
    
    var mainBody = $("<div id='layout-mainBody'></div>");
    mainBody.append(header);
    mainBody.append("<div id='layout-message' class='container'></div><div id='layout-content' class='container'></div>");  
    
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
    if (this.viewContent && this.viewContent.onResize) {
      this.viewContent.onResize(event);
    }
  },
  
  
  events: {
    "click #layout-mainBody": "closeNav"
  },
  
  
  openLeftNav: function() {
    if (!this.leftNavOn) {
      if (this.rightNavOn) {
        this.rightNavOn = false;
        $("#layout-rightNav").transition({x: 0});
      }
      
      this.leftNavOn = true;
      $("#layout-leftNav").transition({x: this.leftNavWidthInPx});
      
      this.viewContent.undelegateEvents();
    }
  },
  
  
  openRightNav: function() {
    if (!this.rightNavOn) {
      if (this.leftNavOn) {
        this.leftNavOn = false;
        $("#layout-leftNav").transition({x: 0});
      }
      
      this.rightNavOn = true;
      $("#layout-rightNav").transition({x: -this.rightNavWidthInPx});
      
      this.viewContent.undelegateEvents();
    }
  },
  
  
  closeNav: function(event) {
    if (this.leftNavOn || this.rightNavOn) {
      event.preventDefault();
      event.stopPropagation();
      
      if (this.leftNavOn) {
        this.leftNavOn = false;
        $("#layout-leftNav").transition({x: 0});
      }
      
      if (this.rightNavOn) {
        this.rightNavOn = false;
        $("#layout-rightNav").transition({x: 0});
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
    
    $(window).off("resize");
    
    Backbone.View.prototype.remove.call(this);
  }
});
