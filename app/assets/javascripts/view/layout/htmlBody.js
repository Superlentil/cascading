View.Layout.HtmlBody = Backbone.View.extend({
  initialize: function() {
    this.allSubviews = [];
    
    GlobalVariable.Layout.leftNavOn = false;
    GlobalVariable.Layout.rightNavOn = false;
  },
  
  
  el: "body",
  
  
  render: function() {
    var that = this;
    
    var htmlBody = that.$el;
    htmlBody.empty();
    
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
    
    var viewLeftNav = new View.Layout.LeftNav();
    that.allSubviews.push(viewLeftNav);
    leftNav.append(viewLeftNav.render().$el);
    
    var viewRightNav = new View.Layout.RightNav();
    that.allSubviews.push(viewRightNav);
    rightNav.append(viewRightNav.render().$el);
    
    var viewHeader = new View.Layout.Header();
    that.allSubviews.push(viewHeader);
    header.append(viewHeader.render().$el);
    
    htmlBody.append(leftNav);
    htmlBody.append(rightNav);
    
    var mainBody = $("<div id='layout-mainBody'></div>");
    mainBody.append(header);
    mainBody.append("<div id='layout-message'></div><div id='layout-content' class='container'></div>");  
    
    var viewMessage = new View.Layout.Message();
    that.allSubviews.push(viewMessage);
    viewMessage.render();
    
    htmlBody.append(mainBody);
    
    return that;
  },
  
  
  events: {
    "click #layout-mainBody": "clearNav"
  },
  
  
  clearNav: function(event) {
    if (GlobalVariable.Layout.leftNavOn || GlobalVariable.Layout.rightNavOn) {
      // event.preventDefault();
      // event.stopPropagation();
      
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
    var subview;
    while (this.allSubviews.length > 0) {
      subview = this.allSubviews.pop();
      if (subview) {
        subview.remove();
      }
    }
    
    this.$el.empty();
    this.stopListening();
  }
});
