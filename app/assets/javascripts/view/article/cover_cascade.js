// define a cascade view for article covers
View.Article.CoverCascade = View.Cascade.Base.extend({
  ITEM_COUNT_PER_FETCH: 30,
  ITEM_COUNT_PER_DISPLAY_BATCH: 23,
  
  BATCH_EAGER_DISPLAY_ABOVE_VIEWPORT: 1,
  BATCH_EAGER_DISPLAY_BELOW_VIEWPORT: 1,
  
  AUTO_FETCH_WHEN_SCROLL_TO_BOTTOM: true,
  
  ADJUST_CASCADE_WHEN_VIEWPORT_WIDTH_CHANGE: true,
  
  MAX_COLUMN_COUNT: 3,
  ENABLE_COMPACT_MODE: true,
  MAX_AUTO_COMPACT_MODE_WIDTH: 894.0,   // if compact mode is enabled and the cascading area width is smaller than this value, then the initial display mode will be automatically set to compact.
  
  NORMAL_COLUMN_WIDTH: 303.0,   // in the unit "px"
  NORMAL_VERTICAL_GAP: 30.0,   // in the unit "px"
  NORMAL_HORIZONTAL_GAP: 20.0,   // in the unit "px"
  
  COMPACT_COLUMN_WIDTH: 278.0,   // in the unit "px"
  COMPACT_VERTICAL_GAP: 15.0,   // in the unit "px"
  COMPACT_HORIZONTAL_GAP: 10.0,   // in the unit "px"
  
  
  initializeOtherConstants: function() {
    this.ITEM_PICTURE_WIDTH = 250.0;   // in the unit "px"
    this.NORMAL_ITEM_PADDING = 10.0;   // in the unit "px"
    this.COMPACT_ITEM_PADDING = 5.0;   // in the unit "px"
    this.OTHER_NOT_INCLUDED_WIDTH = 3.0;   // in the unit "px"
  },
  
  
  el: "#article-cover-cascade",
    
  mainTemplate: JST["template/article/cover_cascade/main"],
  itemTemplate: JST["template/article/cover_cascade/cover"],
  
  
  getPageCacheKey: function() {
    var href = window.location.href;
    if (href.indexOf("#") === -1) {
      if (href.charAt(href.length - 1) === '/') {
        href += "#";
      } else {
        href += "/#";
      }
    }
    return href;
  },
  
  
  initializeHelper: function(options) {
    this.fetchFunction = options.fetchFunction;
  },
  
  
  generateFetchOptions: function() {
    return {pageLoadTime: this.cache.pageLoadTimeSinceEpoch};
  },
  
  
  resetCacheHelper: function() {
    var cache = this.cache;
    cache.itemPadding = 0;
    cache.itemPictureScale = 1.0;
    cache.pageLoadTimeSinceEpoch = 0;   // in the unit "second", and server will update the value if it is set to 0
  },
  
  
  resetDisplayModeParameterHelper: function(maxWidth) {
    var cache = this.cache;
    if (cache.compactMode) {
      cache.itemPadding = this.COMPACT_ITEM_PADDING;
      cache.itemPictureScale = (cache.itemWidth - cache.itemPadding * 2.0 - this.OTHER_NOT_INCLUDED_WIDTH) / this.ITEM_PICTURE_WIDTH;
    } else {
      cache.itemPadding = this.NORMAL_ITEM_PADDING;
      cache.itemPictureScale = 1.0;
    }
  },
  
  
  fetchDataSuccessHelperBeforeAllActions: function(fetchedData) {
    if (this.cache.pageLoadTimeSinceEpoch === 0) {
      this.cache.pageLoadTimeSinceEpoch = fetchedData.pageLoadTime;
    }
  },
  
  
  createItemData: function(fetchedItem) {
    var cache = this.cache;
    var itemPictureScale = cache.itemPictureScale;
    var originalItemPictureHeight = fetchedItem.get("cover_picture_height");
    
    var itemData = {
      id: fetchedItem.get("id"),
      title: fetchedItem.get("title"),
      abstract: fetchedItem.get("abstract"),
      like: fetchedItem.get("like"),
      picUrl: fetchedItem.get("cover_picture_url"),
      originalPicHeight: originalItemPictureHeight,
      picHeight: Math.floor(originalItemPictureHeight * itemPictureScale),
      picWidth: Math.floor(this.ITEM_PICTURE_WIDTH * itemPictureScale),
      width: cache.itemWidth,
      padding: cache.itemPadding
    };
    
    return itemData;
  },
  
  
  updateItemDataInCacheAfterDisplayModeChange: function(itemIndex) {
    var cache = this.cache;
    var itemPictureScale = cache.itemPictureScale;
    var itemData = cache.itemData[itemIndex];
    itemData.width = cache.itemWidth;
    itemData.padding = cache.itemPadding;
    itemData.picHeight = Math.floor(itemData.originalPicHeight * itemPictureScale);
    itemData.picWidth = Math.floor(this.ITEM_PICTURE_WIDTH * itemPictureScale);
  }
});
