View.Layout.Main = Backbone.View.extend({
  initialize: function() {   
    _.bindAll(this, "openLeftNav");
    _.bindAll(this, "openRightNav");
    
    this.leftNavOn = false;
    this.rightNavOn = false;
    this.leftNavWidth = 300;
    this.rightNavWidth = 300;
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
    that.leftNavWidth = navWidth;
    that.rightNavWidth = navWidth;
    navWidth += "px";
    
    var leftNav = $("<div id='layout-leftNav'></div>");
    var rightNav = $("<div id='layout-rightNav'></div>");
    var header = $("<nav id='layout-header' class='navbar navbar-default navbar-fixed-top' role='navigation'></nav>");
    
    leftNav.css({
      "left": "-" + navWidth,
      "width": navWidth
    });
    rightNav.css({
      "right": "-" + navWidth,
      "width": navWidth
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
    mainBody.append("<div id='layout-message'></div><div id='layout-content' class='container'></div>");  
    
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
    $("#layout-mainBody").append("<div id='layout-message'></div><div id='layout-content' class='container'></div>");
    this.viewMessage = new View.Layout.Message();
    this.viewMessage.render();
    return this;
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
      $("#layout-leftNav").transition({x: this.leftNavWidth});
      
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
      $("#layout-rightNav").transition({x: -this.rightNavWidth});
      
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
    
    Backbone.View.prototype.remove.call(this);
  }
});
