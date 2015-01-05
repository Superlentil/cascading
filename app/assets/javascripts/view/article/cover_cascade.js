// define a cascade view for article covers
View.Article.CoverCascade = View.Cascade.Base.extend({
  ITEM_COUNT_PER_FETCH: 30,
  ITEM_COUNT_PER_DISPLAY_BATCH: 30,
  
  BATCH_EAGER_DISPLAY_ABOVE_VIEWPORT: 1,
  BATCH_EAGER_DISPLAY_BELOW_VIEWPORT: 1,
  
  AUTO_FETCH_WHEN_SCROLL_TO_BOTTOM: true,
  
  ADJUST_CASCADE_WHEN_VIEWPORT_WIDTH_CHANGE: true,
  
  MAX_COLUMN_COUNT: 3,
  ENABLE_COMPACT_MODE: false,

  NORMAL_COLUMN_WIDTH: 300.0,   // in the unit "px"
  NORMAL_VERTICAL_GAP: 30.0,   // in the unit "px"
  NORMAL_HORIZONTAL_GAP: 20.0,   // in the unit "px"

  
  initializeOtherConstants: function() {
    this.ITEM_PICTURE_ORIGINAL_WIDTH = 200;   // in the unit "px"
    this.ITEM_PICTURE_WIDTH = this.NORMAL_COLUMN_WIDTH - this.NORMAL_VERTICAL_GAP;   // in the unit "px"
  },
  
  
  el: "#article-cover-cascade",
  
  mainTemplate: JST["template/article/cover_cascade/main"],
  itemTemplate: JST["template/article/cover_cascade/cover"],
  
  
  initializeHelper: function(options) {
    this.fetchFunction = options.fetchFunction;
    this.coverDisplayType = GlobalConstant.Article.CoverDisplayType.NORMAL;
    if (options.coverDisplayType) {
      this.coverDisplayType = options.coverDisplayType;
    }
    this.on('change:sortType', this.sortByTypeFunc, this);
  },
  
  
  getPageCacheKey: function() {
    var hash = window.location.hash;
    var sortByType = GlobalConstant.Article.SortBy;
    if (hash.length === 0 || hash === "#") {
      return "#/articles/sort_by/" + sortByType.PUBLISH_TIME_DESC;
    } else if (hash.search("/sort_by/") < 0) {
      return hash + "/sort_by/" + sortByType.PUBLISH_TIME_DESC;
    }
    return hash;
  },
  
  
  generateFetchOptions: function() {
    return {pageLoadTime: this.cache.pageLoadTimeSinceEpoch};
  },
  
  
  resetCacheHelper: function() {
    var cache = this.cache;
    cache.pageLoadTimeSinceEpoch = 0;   // in the unit "second", and server will update the value if it is set to 0
  },
  
  
  fetchDataSuccessHelperBeforeAllActions: function(fetchedData) {
    if (this.cache.pageLoadTimeSinceEpoch === 0) {
      this.cache.pageLoadTimeSinceEpoch = fetchedData.pageLoadTime;
    }
  },
  
  
  createItemData: function(fetchedItem) {
    var cache = this.cache;

    var itemData = {
      displayType: this.coverDisplayType,
      id: fetchedItem.get("id"),
      title: fetchedItem.get("title"),
      author: fetchedItem.get("author"),
      userId: fetchedItem.get("user_id"),
      category: fetchedItem.get("category_name"),
      categoryId: fetchedItem.get("category_id"),
      abstract: fetchedItem.get("abstract"),
      like: fetchedItem.get("like"),
      views: fetchedItem.get("views"),
      picUrl: fetchedItem.get("cover_picture_url"),
      picHeight: fetchedItem.get("cover_picture_height") * this.ITEM_PICTURE_WIDTH / this.ITEM_PICTURE_ORIGINAL_WIDTH,
      width: cache.itemWidth,
      padding: cache.itemPadding
    };
    
    return itemData;
  },
  
  
  events: function() {
    return _.extend({}, View.Cascade.Base.prototype.events, {
      "change .sort-filter select" : "setSort"
    });
  },
  
  setSort: function (event) {
    this.sortType = event.currentTarget.value;
    this.trigger('change:sortType');
  },

  sortByTypeFunc: function () {
    var sortByType = 0;
    sortByType = this.sortType;
    
    var hash = window.location.hash;
    if (hash.length === 0 || hash === "#") {
      hash = "#/articles/sort_by/" + sortByType;
    } else {
      var index = hash.search("/sort_by/");
      if (index >= 0) {
        hash = hash.substring(0, index);
      }
      hash += "/sort_by/" + sortByType;
    }
    
    Backbone.history.navigate(hash, {trigger: true});

    var selectedType = document.getElementById('sort-type');
    selectedType.selectedIndex = sortByType;
  }

});
