// MVC structure
var Model = {};
var Collection = {};
var View = {};


var GlobalConstant = { 
  Article: {
    Status: {   // If this enumeration needs to be modified, please modify the corresponding one in the "Ruby on Rails" code together.
      INITIAL_TEMPORARILY_CREATED: 0,
      DRAFT: 1,
      PRIVATE_PUBLISHED: 2,
      PUBLIC_PUBLISHED: 3
    }
  },
    
  
  SideNav: {
    BORDER_SHADOW_WIDTH_IN_PX: 10
  },
  
  
  User: {
    Tier: {   // If this enumeration needs to be modified, please modify the corresponding one in the "Ruby on Rails" code together.
      ADMINISTRATOR: 0,
      FREE_USER: 1
    },
    
    Status: {
      UNVERIFIED: 0,
      VERIFIED: 1
    }
  }
};


var GlobalVariable = {
  Browser: {
    Window: null,
    Document: null,
    WindowHeightInPx: 0,
    ScrollBarWidthInPx: 20
  },
  
  
  PageCache: {},
  
  
  UserCache: {},
  
  
  Article: {
    AllCategories: null   // should be a Backbone Collection object
  }
};

