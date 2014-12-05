// define a cascade view for article covers
View.Article.ShowCascade = View.Cascade.Base.extend({
  CASCADE_CONTENT_CONTAINER_ID: "article-cover-cascade-content",
  
  COUNT_PER_BATCH: 1,
  BATCH_LOAD_WHEN_SCROLL_TO_BOTTOM: 0,
  
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
  
  
  fetchFunction: function(batchToLoad, articlesPerBatch, fetchOptions, callbacks) {
    var articles = new Collection.Article.All({
      batch: batchToLoad,
      articlesPerBatch: articlesPerBatch,
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
