View.Layout.Main = Backbone.View.extend({
  initialize: function() {   
    GlobalVariable.Layout.leftNavOn = false;
    GlobalVariable.Layout.rightNavOn = false;
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
    GlobalVariable.Layout.leftNavWidth = navWidth;
    GlobalVariable.Layout.rightNavWidth = navWidth;
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
    
    that.viewHeader = new View.Layout.Header();
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
  
  
  events: {
    "click #layout-mainBody": "clearNav"
  },
  
  
  clearNav: function(event) {
    if (GlobalVariable.Layout.leftNavOn || GlobalVariable.Layout.rightNavOn) {
      event.preventDefault();
      event.stopPropagation();
      
      if (GlobalVariable.Layout.leftNavOn) {
        GlobalVariable.Layout.leftNavOn = false;
        $("#layout-leftNav").transition({x: 0});
      }
      
      if (GlobalVariable.Layout.rightNavOn) {
        GlobalVariable.Layout.rightNavOn = false;
        $("#layout-rightNav").transition({x: 0});
      }
    }
  },
  
  
  remove: function() {
    this.viewLeftNav.remove();
    this.viewRightNav.remove();
    this.viewHeader.remove();
    this.viewMessage.remove();
    
    Backbone.View.prototype.remove.call(this);
  }
});
