// MVC structure
var Model = {};
var Collection = {};
var View = {};


var GlobalConstant = {
  DOMAIN: "http://haigy.com",

  Article: {
    Status: {   // If this enumeration needs to be modified, please modify the corresponding one in the "Ruby on Rails" code together.
      INITIAL_TEMPORARILY_CREATED: 0,
      DRAFT: 1,
      PRIVATE_PUBLISHED: 2,
      PUBLIC_PUBLISHED: 3
    },
    
    SortBy: {   // If this enumeration needs to be modified, please modify the corresponding one in the "Ruby on Rails" code together.
      PUBLISH_TIME_DESC: 0,
      LOVE_DESC: 1,
      VIEW_DESC: 2
    },
    
    CoverDisplayType: {
      NORMAL: 0,
      SEARCH_RESULT: 1
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
  
  
  Layout: {
    ViewPopup: null,
    
    SignInHandler: null,
    SignOutHandler: null,
    CloseNavHandler: null,
    
    Header: {
      UpdateSubTitle: null,
      Hide: null,
      Show: null
    },
    
    LeftNav: {
      FetchAllCategories: null
    }
  },
  
  
  Article: {
    AllCategories: null   // should be a Backbone Collection object
  },
  
  
  PageCache: {},
  
  
  UserCache: {},
  
  
  BrowsingHistory: []
};

