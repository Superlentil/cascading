// define a cascade view for article covers
View.Article.CoverCascade = View.Cascade.Base.extend({
  ITEM_COUNT_PER_FETCH: 30,
  ITEM_COUNT_PER_DISPLAY_BATCH: 23,
  
  BATCH_EAGER_DISPLAY_ABOVE_VIEWPORT: 1,
  BATCH_EAGER_DISPLAY_BELOW_VIEWPORT: 1,
  
  AUTO_FETCH_WHEN_SCROLL_TO_BOTTOM: true,
  
  ADJUST_CASCADE_WHEN_VIEWPORT_WIDTH_CHANGE: true,
  
  MAX_COLUMN_COUNT: 5,
  ENABLE_COMPACT_MODE: true,
  MAX_AUTO_COMPACT_MODE_WIDTH: 720.0,   // if compact mode is enabled and the cascading area width is smaller than this value, then the initial display mode will be automatically set to compact.
  
  NORMAL_COLUMN_WIDTH: 240.0,   // in the unit "px"
  NORMAL_VERTICAL_GAP: 8.0,   // in the unit "px"
  NORMAL_HORIZONTAL_GAP: 8.0,   // in the unit "px"
  
  COMPACT_COLUMN_WIDTH: 220.0,   // in the unit "px"
  COMPACT_VERTICAL_GAP: 4.0,   // in the unit "px"
  COMPACT_HORIZONTAL_GAP: 4.0,   // in the unit "px"
  
  
  initializeOtherConstants: function() {
    this.ITEM_PICTURE_WIDTH = 200.0;   // in the unit "px"
    this.NORMAL_ITEM_PADDING = 16.0;   // in the unit "px"
    this.COMPACT_ITEM_PADDING = 8.0;   // in the unit "px"
  },
  
  
  el: "#article-cover-cascade",
    
  mainTemplate: JST["template/article/cover_cascade/main"],
  itemTemplate: JST["template/article/cover_cascade/cover"],
  
  
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
    cache.pageLoadTimeSinceEpoch = $.now();   // in the unit "millisecond"
  },
  
  
  resetDisplayModeParameterHelper: function(maxWidth) {
    var cache = this.cache;
    if (cache.compactMode) {
      cache.itemPadding = this.COMPACT_ITEM_PADDING;
      cache.itemPictureScale = (cache.itemWidth - cache.itemPadding * 2.0) / this.ITEM_PICTURE_WIDTH;
    } else {
      cache.itemPadding = this.NORMAL_ITEM_PADDING;
      cache.itemPictureScale = 1.0;
    }
  },
  
  
  createItemData: function(fetchedItem) {
    var cache = this.cache;
    var itemPictureScale = cache.itemPictureScale;
    var originalItemPictureHeight = fetchedItem.get("cover_picture_height");
    
    var itemData = {
      id: fetchedItem.get("id"),
      title: fetchedItem.get("title"),
      author: fetchedItem.get("author"),
      userId: fetchedItem.get("user_id"),
      category: fetchedItem.get("category_name"),
      categoryId: fetchedItem.get("category_id"),
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
