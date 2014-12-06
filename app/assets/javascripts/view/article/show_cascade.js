// define a cascade view for article covers
View.Article.ShowCascade = View.Cascade.Base.extend({
  CASCADE_CONTENT_CONTAINER_ID: "article-cover-cascade-content",
  
  ITEM_COUNT_PER_FETCH: 10,
  ITEM_COUNT_PER_DISPLAY_BATCH: 1,

  BATCH_EAGER_DISPLAY_ABOVE_VIEWPORT: 0,
  BATCH_EAGER_DISPLAY_BELOW_VIEWPORT: 0,
  
  AUTO_FETCH_WHEN_SCROLL_TO_BOTTOM: false,
  
  ADJUST_CASCADE_WHEN_VIEWPORT_WIDTH_CHANGE: false,
  
  MAX_COLUMN_COUNT: 1,
  ENABLE_COMPACT_MODE: false,
  
  NORMAL_COLUMN_WIDTH: 200.0,   // in the unit "px"
  NORMAL_VERTICAL_GAP: 0,   // in the unit "px"
  NORMAL_HORIZONTAL_GAP: 8.0,   // in the unit "px"
 
  
  initializeOtherConstants: function() {
    this.ITEM_PICTURE_WIDTH = 200.0;   // in the unit "px"
  },
  
  
  el: "#article-show-recommend",
    
  mainTemplate: JST["template/article/show_cascade/main"],
  itemTemplate: JST["template/article/show_cascade/cover"],
  
  
  initializeHelper: function(options) {
    this.articleShowContainer = options.articleShowContainer;
  },
  
  
  getPageCacheKey: function() {
    return window.location.href + "-recommendation";
  },
  
  
  fetchFunction: function(fetchSequenceNumber, articlesPerFetch, fetchOptions, callbacks) {
    var articles = new Collection.Article.All({
      fetchSequenceNumber: fetchSequenceNumber,
      articlesPerFetch: articlesPerFetch,
      pageLoadTime: fetchOptions.pageLoadTime
    });
    articles.fetch(callbacks);
  },
  
  
  generateFetchOptions: function() {
    return {pageLoadTime: this.cache.pageLoadTimeSinceEpoch};
  },
  
  
  resetCacheHelper: function() {
    this.cache.pageLoadTimeSinceEpoch = $.now();   // in the unit "millisecond"
  },
  
  
  createItemData: function(fetchedItem) {
    var itemData = {
      id: fetchedItem.get("id"),
      title: fetchedItem.get("title"),
      picUrl: fetchedItem.get("cover_picture_url"),
      picHeight: fetchedItem.get("cover_picture_height"),
      picWidth: this.ITEM_PICTURE_WIDTH,
      width: this.cache.itemWidth
    };
    
    return itemData;
  },
  
  
  beAbleToScrollDown: function() {
    return this.cache.cascadeHeight > this.articleShowContainer.height();
  },
});
