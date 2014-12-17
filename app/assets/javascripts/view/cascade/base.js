// define the base cascade view API
View.Cascade.Base = Backbone.View.extend({
  // -----------------------------------------------------------------
  // BEGIN: constants or functions that can be overrided by subclass
  // -----------------------------------------------------------------
  
  // --- common constants ---
  CACHE_LIFETIME: 3600000,   // in the unit "milliseconds"
  
  CASCADE_CONTENT_CONTAINER_CLASS_NAME: "cascade-content",   // for customized style or more freedom of control
  
  // make sure: ITEM_COUNT_PER_FETCH >= ITEM_COUNT_PER_DISPLAY_BATCH
  ITEM_COUNT_PER_FETCH: 30,
  ITEM_COUNT_PER_DISPLAY_BATCH: 30,   // use "batch" in below code to simplify for "display batch"

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
  
  // --- other specific constants for this kind of cascading design, override them for different cascading designs ---
  initializeOtherConstants: function() {},

  
  el: null,   // must be overrided
    
  mainTemplate: null,   // must be overrided
  itemTemplate: null,   // must be overrided
  
  
  // --- specific functions for this kind of cascading design, override them for different cascading designs ---
  initializeHelper: function(options) {},
  
  
  getPageCacheKey: function() {
    return window.location.href;
  },
  
  
  fetchFunction: function(fetchSequenceNumber, itemCountPerFetch, fetchOptions, callbacks) {},   // must be overrided
  
  
  generateFetchOptions: function() {
    return null;
  },
  
  
  fetchDataSuccessHelperBeforeAllActions: function(fetchedData) {
  },
  
  
  fetchDataSuccessHelperAfterAllActions: function(fetchedData) {
  },
  
  
  fetchDataErrorHelper: function() {
  },
  
  
  resetCacheHelper: function() {},
  
  
  resetDisplayModeParameterHelper: function(maxWidth) {},
  
  
  createItemData: function(fetchedItem) {
    var itemData = {};
    return itemData;
  },
  
  
  updateItemDataInCacheAfterDisplayModeChange: function(itemIndex) {},
  
  
  beAbleToScrollDown: function() {
    var thisWindow = GlobalVariable.Browser.Window;
    return (this.cache.cascadeHeight > thisWindow.scrollTop() + thisWindow.height());
  },
  
  
  getCascadeContainerWidth: function() {
    if (this.beAbleToScrollDown()) {
      return this.$el.width();
    } else {
      return this.$el.width() - GlobalVariable.Browser.ScrollBarWidthInPx;
    }
  },
  
  
  addScrollListener: function() {
    GlobalVariable.Browser.Window.on("scroll", this.onScroll);
  },
  
  
  removeScrollListener: function() {
    GlobalVariable.Browser.Window.off("scroll");
  },
  
  
  events: {
    "click #m-cascade-compact-mode": "changeCoverDisplayMode",
    "click #m-cascade-normal-mode": "changeCoverDisplayMode"
  },
  
  
  onWidthChange: function() {
    if (this.ADJUST_CASCADE_WHEN_VIEWPORT_WIDTH_CHANGE) {
      this.widthChangeHandler();
    }
  },
  
  
  renderHelper: function() { 
  },
  
  
  removeHelper: function() {
  },
  // -----------------------------------------------------------------
  // END: parameters or functions that can be overrided by subclasses
  // -----------------------------------------------------------------
  
  
  initialize: function(options) {
    this.initializeOtherConstants();
    
    _.bindAll(this, "onScroll");
    _.bindAll(this, "fetchData");
    
    this.readyToFetch = true;
    this.readyForWidthChange = false;

    // Global Page Cache
    this.renderWithCache = false;
    var pageCacheKey = this.getPageCacheKey();
    var pageCache = GlobalVariable.PageCache[pageCacheKey];
    if (pageCache && !this.cacheExpired(pageCache)) {
      this.cache = pageCache;
      this.renderWithCache = true;
    } else {
      this.cache = {};
      GlobalVariable.PageCache[pageCacheKey] = this.cache;
      this.resetCache();
    }
    
    this.initializeHelper(options);
  },
  
  
  cacheExpired: function(cache) {
    return ($.now() - cache.lastCacheTime > this.CACHE_LIFETIME);
  },
  
  
  resetCache: function() {
    var cache = this.cache;
    
    cache.lastCacheTime = $.now();
    cache.moreToFetch = true;
    
    cache.compactMode = false;
    
    cache.scrollTop = 0;
    cache.scrollPercentage = 0;
    
    cache.cascadeHeight = 0;
    cache.cascadeWidth = 0;
    
    cache.columnCount = 0;
    cache.columnWidth = 0;
    cache.verticalGap = 0;
    cache.horizontalGap = 0;
    cache.columnHeight = [];
    cache.columnLeftPosition = [];
        
    cache.nextUnprocessedBatch = 0;
    cache.batchContainer = [];
    cache.batchTopPosition = [];
    cache.batchProcessed = [];
    
    cache.firstVisibleBatch = 0;
    cache.lastVisibleBatch = 0;
    
    cache.itemWidth = 0;   
    cache.itemData = [];
    
    this.resetCacheHelper();
  },

  
  resetItemPositionGenerator: function() {
    var cache = this.cache;
    
    cache.cascadeWidth = cache.columnCount * cache.columnWidth - cache.verticalGap;
    cache.columnHeight = [];
    cache.columnLeftPosition = [];
    for (var index = 0; index < cache.columnCount; ++index) {
      cache.columnHeight.push(0.0);
      cache.columnLeftPosition.push(cache.columnWidth * index);
    }
    cache.cascadeHeight = 0.0;
  },
     
  
  resetCascadeContainer: function() {
    this.removeScrollListener();
    
    var oldCascadeContainer = this.cascadeContainer;
    if (oldCascadeContainer) {
      oldCascadeContainer.remove();
    }
    
    var newCascadeContainer = $("<div class='" + this.CASCADE_CONTENT_CONTAINER_CLASS_NAME + "' style='width: " + this.cache.cascadeWidth + "px;'></div>");
    this.$el.append(newCascadeContainer);
    this.cascadeContainer = newCascadeContainer;
    
    this.addScrollListener();
  },
  
  
  getColumnCount: function(maxWidth, columnWidth, verticalGap, needMoreCompact) {
    var columnCount = Math.floor((maxWidth + verticalGap) / columnWidth);
    if (needMoreCompact) {
      if (maxWidth > columnWidth) {   // filter out the case that the screen width is smaller than a column
        ++columnCount;
      }
    }
    if (columnCount < 1) {
      columnCount = 1;
    }
    if (columnCount > this.MAX_COLUMN_COUNT) {
      columnCount = this.MAX_COLUMN_COUNT;
    }
    return columnCount;
  },
  
  
  resetDisplayMode: function(maxWidth) {  
    var compactMode = false;
    if (this.ENABLE_COMPACT_MODE && maxWidth < this.MAX_AUTO_COMPACT_MODE_WIDTH) {
      compactMode = true;
    }
    columnCount = this.getColumnCount(maxWidth, this.NORMAL_COLUMN_WIDTH, this.NORMAL_VERTICAL_GAP, compactMode);   
    this.cache.columnCount = columnCount;
    this.cache.compactMode = compactMode;
  },
  
  
  resetDisplayModeParameter: function(maxWidth) {
    var cache = this.cache;
  
    var columnWidth = this.NORMAL_COLUMN_WIDTH;
  
    if (cache.compactMode) {
      cache.verticalGap = this.COMPACT_VERTICAL_GAP;
      cache.horizontalGap = this.COMPACT_HORIZONTAL_GAP;
      var calculatedColumnWidth = (maxWidth + cache.verticalGap) / cache.columnCount;
      var maxCompactColumnWidth = this.COMPACT_COLUMN_WIDTH;
      if (calculatedColumnWidth < maxCompactColumnWidth) {
        columnWidth = calculatedColumnWidth;
      } else {
        columnWidth = maxCompactColumnWidth;
      }
    } else {
      cache.verticalGap = this.NORMAL_VERTICAL_GAP;
      cache.horizontalGap = this.NORMAL_HORIZONTAL_GAP;
    }
    
    cache.columnWidth = columnWidth;
    cache.itemWidth = cache.columnWidth - cache.verticalGap;
    
    this.resetDisplayModeParameterHelper(maxWidth);
  },

  
  render: function() {
    var cache = this.cache;
    
    this.$el.html(this.mainTemplate());
    
    var thisBrowser = GlobalVariable.Browser;
    thisBrowser.Window.scrollTop(0);
    
    var maxWidth = this.getCascadeContainerWidth();
    
    if (this.renderWithCache) {
      var newColumnCount = this.getColumnCount(maxWidth, this.NORMAL_COLUMN_WIDTH, this.NORMAL_VERTICAL_GAP, cache.compactMode);
      this.resetCascadeContainer();
      
      if (newColumnCount === cache.columnCount) {
        var batchCount = cache.batchContainer.length;
        for (var index = 0; index < batchCount; ++index) {
          cache.batchContainer[index] = null;
        }
        this.cascadeContainer.css("height", cache.cascadeHeight + "px");
        this.jumpToLastScrollPosition();
      } else {
        this.readyForWidthChange = true;
        this.onWidthChange();
      }
    } else {
      this.resetDisplayMode(maxWidth);
      this.resetDisplayModeParameter(maxWidth);
      this.resetItemPositionGenerator();
      this.resetCascadeContainer();
      this.fetchData();
    }
    
    this.readyForWidthChange = true;
    
    this.renderHelper();
       
    return this;
  },
  
   
  getShortestColumnIndex: function() {
    var cache = this.cache;
    
    var shortestColumnIndex = 0;
    var shortestHeight = cache.columnHeight[0];
    for (var index = 1; index < cache.columnCount; ++index) {
      if (shortestHeight > cache.columnHeight[index]) {
        shortestHeight = cache.columnHeight[index];
        shortestColumnIndex = index;
      }
    }
    return shortestColumnIndex;
  },
  
  
  getCurrentCascadeHeight: function() {
    var cache = this.cache;
    
    var currentCascadeHeight = cache.columnHeight[0];
    for (var index = 1; index < cache.columnCount; ++index) {
      if (currentCascadeHeight < cache.columnHeight[index]) {
        currentCascadeHeight = cache.columnHeight[index];
      }
    }
    return currentCascadeHeight;
  },
  
  
  updateItemPositionGenerator: function(columnIndex, newColumnHeight) {
    this.cache.columnHeight[columnIndex] = newColumnHeight;
  },
  
  
  getFetchSequenceNumber: function() {
    return Math.floor(this.cache.itemData.length / this.ITEM_COUNT_PER_FETCH);
  },
  
  
  fetchData: function() {
    if (this.cache.moreToFetch) {
      this.readyToFetch = false;   // only one load process allowed
      clearTimeout(this.fetchDataTimeout);
      
      var that = this;
      var cache = that.cache;
      var itemCountPerFetch = that.ITEM_COUNT_PER_FETCH;
      
      that.fetchFunction(that.getFetchSequenceNumber(), itemCountPerFetch, that.generateFetchOptions(), {
        success: function(fetchedData) {
          that.fetchDataSuccessHelperBeforeAllActions(fetchedData);
          
          var allFetchedItems = fetchedData.models;
          cache.moreToFetch = allFetchedItems.length === itemCountPerFetch;   // if the current time is a full fetch, there may be more data to fetch
    
          if (allFetchedItems.length > 0) {
            var cacheItemData = cache.itemData;
             
            _.each(allFetchedItems, function(fetchedItem) {
              cacheItemData.push(that.createItemData(fetchedItem));
            });
            
            if (that.cascadeContainer.is(":visible")) {
              var needMoreFetch = false;
              
              while (that.hasWellFetchedButUnprocessedBatch() && !that.beAbleToScrollDown()) {
                that.processNextUnprocessedBatch();
              }
              
              if (that.beAbleToScrollDown()) {
                var lastVisibleBatch = cache.lastVisibleBatch;
                var lastOnboardBatch = lastVisibleBatch + that.BATCH_EAGER_DISPLAY_BELOW_VIEWPORT;
                for (var index = lastVisibleBatch; index <= lastOnboardBatch; ++index) {
                  if (!cache.batchContainer[index]) {
                    if (that.hasWellFetchedButUnprocessedBatch()) {
                      that.processNextUnprocessedBatch();
                    } else {
                      needMoreFetch = true;
                      break;
                    }
                  }
                }
              } else {
                needMoreFetch = true;
              }
  
              that.readyToFetch = true;
              if (needMoreFetch) {
                that.fetchData();
              }
            } else {
              that.readyToFetch = true;
            }
          } else {
            cache.moreToFetch = false;
          }
          
          that.fetchDataSuccessHelperAfterAllActions(fetchedData);
        },
        
        error: function() {
          // TODO: put some error handling logic here
          that.readyToFetch = true;
          that.fetchDataErrorHelper();
        }
      });
    }
  },
  
  
  // if there is no more data to fetch, the last not full batch is also considered as a well fetched batch
  hasWellFetchedButUnprocessedBatch: function() {
    var cache = this.cache;
    var itemDataCount = cache.itemData.length;
    var nextUnprocessedBatch = cache.nextUnprocessedBatch;
    var countPerBatch = this.ITEM_COUNT_PER_DISPLAY_BATCH;
    
    if ((nextUnprocessedBatch + 1) * countPerBatch <= itemDataCount) {
      return true;
    } else {
      if (!cache.moreToFetch && nextUnprocessedBatch * countPerBatch < itemDataCount) {
        return true;
      } else {
        return false;
      }
    }
  },
  
  
  processNextUnprocessedBatch: function() {
    var cache = this.cache;
    var heightOffset = cache.cascadeHeight;
    cache.batchTopPosition.push(heightOffset);
    cache.batchContainer.push(null);
    cache.batchProcessed.push(false);
    var processingBatch = cache.nextUnprocessedBatch;
    ++cache.nextUnprocessedBatch;
    this.attachBatch(processingBatch, true);
  },
  
  
  changeCoverDisplayMode: function(event) {
    event.preventDefault();
    
    if (this.cascadeContainer && this.cascadeContainer.is(":visible")) {
      var cache = this.cache;
      
      var countPerFetch = this.ITEM_COUNT_PER_FETCH;
      var countPerBatch = this.ITEM_COUNT_PER_DISPLAY_BATCH;
      var reusableBatchCount = Math.floor(Math.floor(cache.itemData.length / countPerFetch) * countPerFetch / countPerBatch);
      
      if (this.cacheExpired(cache)) {
        this.resetCache();
        reusableBatchCount = 0;
      }
      
      var compactMode = $(event.currentTarget).data("displayMode") === "compact";
      var maxWidth = this.getCascadeContainerWidth();
      cache.columnCount = this.getColumnCount(maxWidth, this.NORMAL_COLUMN_WIDTH, this.NORMAL_VERTICAL_GAP, compactMode);
      cache.compactMode = compactMode;
      
      this.resetDisplayModeParameter(maxWidth);
      this.resetItemPositionGenerator();
      this.resetCascadeContainer();
      this.readyToFetch = true;
      cache.moreToFetch = true;
      
      var batch = 0;
      var batchDisplayedBelowViewport = 0;
      
      while (batch < reusableBatchCount) {
        var heightOffset = cache.cascadeHeight;
        cache.batchContainer[batch] = null;
        cache.batchTopPosition[batch] = heightOffset;
        
        var firstItemIndexInThisBatch = batch * countPerBatch;
        var firstItemIndexInNextBatch = this.getFirstItemIndexInNextBatch(firstItemIndexInThisBatch);
        
        for (var index = firstItemIndexInThisBatch; index < firstItemIndexInNextBatch; ++index) {           
          this.updateItemDataInCacheAfterDisplayModeChange(index);
        }
        
        this.attachBatch(batch, true);
        
        if (this.beAbleToScrollDown()) {
          if (batchDisplayedBelowViewport < this.BATCH_EAGER_DISPLAY_BELOW_VIEWPORT) {
            ++batchDisplayedBelowViewport;
          } else {
            break;
          }
        }
        
        ++batch;
      }
      
      var reusedBatchCount = reusableBatchCount;
      if (batch < reusedBatchCount) {
        reusedBatchCount = batch + 1;
      }
      cache.nextUnprocessedBatch = reusedBatchCount;
      cache.batchTopPosition = cache.batchTopPosition.slice(0, reusedBatchCount);
      cache.batchContainer = cache.batchContainer.slice(0, reusedBatchCount);
      var reusedFetchCount = Math.floor(reusedBatchCount * countPerBatch / countPerFetch);
      if ((reusedBatchCount * countPerBatch) % countPerFetch > 0) {
        ++reusedFetchCount;
      }
      var reusedItemDataCount = reusedFetchCount * countPerFetch;
      cache.itemData = cache.itemData.slice(0, reusedItemDataCount);
      for (var index = reusedBatchCount * countPerBatch; index < reusedItemDataCount; ++index) {           
        this.updateItemDataInCacheAfterDisplayModeChange(index);
      }
  
      console.log(cache.nextUnprocessedBatch + "   " + reusedFetchCount * countPerFetch);
  
      this.onScroll();
    }
  },
   
 
  attachBatch: function(batchIndex, isInitialAttach) {
    var cache = this.cache;
    
    if (0 <= batchIndex && batchIndex < cache.nextUnprocessedBatch) {   // safer    
      if ((!cache.batchContainer[batchIndex] && cache.batchProcessed[batchIndex]) || isInitialAttach) {       
        var countPerBatch = this.ITEM_COUNT_PER_DISPLAY_BATCH;
        var firstItemIndexInThisBatch = batchIndex * countPerBatch;
        var firstItemIndexInNextBatch = this.getFirstItemIndexInNextBatch(firstItemIndexInThisBatch);
  
        var cascadeContainer = this.cascadeContainer;
        var batchTopPosition = cache.batchTopPosition[batchIndex];
        var batchContainer = $("<div style='position: absolute; left: 0; top: " + batchTopPosition + "px;'></div>");
        cascadeContainer.append(batchContainer);
        cache.batchContainer[batchIndex] = batchContainer;
        
        if (isInitialAttach) {
          for (var index = firstItemIndexInThisBatch; index < firstItemIndexInNextBatch; ++index) {
            var shortestColumnIndex = this.getShortestColumnIndex();
            var top = cache.columnHeight[shortestColumnIndex];
            var left = cache.columnLeftPosition[shortestColumnIndex];
            
            var itemData = cache.itemData[index];
            itemData.top = top - batchTopPosition;
            itemData.left = left;
            
            var item = $(this.itemTemplate(itemData));
            batchContainer.append(item);
            var itemHeight = item.outerHeight(true);
            itemData.height = itemHeight;
            
            var newColumnHeight = cache.horizontalGap + top + itemHeight;
            this.updateItemPositionGenerator(shortestColumnIndex, newColumnHeight);          
          }
          
          var cascadeHeight = this.getCurrentCascadeHeight();
          cascadeContainer.css("height", cascadeHeight + "px");   // This will keep cascade container the same height even when old batch container is detached.
          cache.cascadeHeight = cascadeHeight;
          cache.scrollPercentage = GlobalVariable.Browser.Window.scrollTop() / GlobalVariable.Browser.Document.height();
          
          cache.batchProcessed[batchIndex] = true;
        } else {
          for (var index = firstItemIndexInThisBatch; index < firstItemIndexInNextBatch; ++index) {
            var item = $(this.itemTemplate(cache.itemData[index]));
            batchContainer.append(item);
          }
        }
      }
    }
  },
  
  
  widthChangeHandler: function() {
    var cache = this.cache;
    
    if (this.readyForWidthChange && this.cascadeContainer.is(":visible")) {   
      var maxWidth = this.getCascadeContainerWidth();
      var newColumnCount = this.getColumnCount(maxWidth, cache.columnWidth, cache.verticalGap, false);
      
      if (newColumnCount !== cache.columnCount) {
        var nextUnprocessedBatch = cache.nextUnprocessedBatch;
        
        cache.columnCount = newColumnCount;
        this.resetItemPositionGenerator();
        this.resetCascadeContainer();

        var countPerBatch = this.ITEM_COUNT_PER_DISPLAY_BATCH;
        var batchIndex = 0;
        var itemDataCount = Math.min(cache.itemData.length, nextUnprocessedBatch * countPerBatch);
        for (var firstItemIndexInThisBatch = 0; firstItemIndexInThisBatch < itemDataCount; firstItemIndexInThisBatch += countPerBatch) {
          var firstItemIndexInNextBatch = this.getFirstItemIndexInNextBatch(firstItemIndexInThisBatch);
          
          var heightOffset = cache.cascadeHeight;
          cache.batchContainer[batchIndex] = null;
          cache.batchTopPosition[batchIndex] = heightOffset;
          
          for (var index = firstItemIndexInThisBatch; index < firstItemIndexInNextBatch; ++index) {
            var shortestColumnIndex = this.getShortestColumnIndex();
            var top = cache.columnHeight[shortestColumnIndex];
            var itemData = cache.itemData[index];
            itemData.top = top - heightOffset;
            itemData.left = cache.columnLeftPosition[shortestColumnIndex];
            var newColumnHeight = top + cache.horizontalGap + itemData.height;
            this.updateItemPositionGenerator(shortestColumnIndex, newColumnHeight);
          }
                  
          cache.cascadeHeight = this.getCurrentCascadeHeight();
          ++batchIndex;
        };
        
        this.cascadeContainer.css("height", cache.cascadeHeight + "px");
        
        this.jumpToLastScrollPosition();
      }
    }
  },
  
  
  getFirstItemIndexInNextBatch: function(firstItemIndexInThisBatch) {
    var itemDataCount = this.cache.itemData.length;
    var firstItemIndexInNextBatch = firstItemIndexInThisBatch + this.ITEM_COUNT_PER_DISPLAY_BATCH;
    if (firstItemIndexInNextBatch > itemDataCount) {
      firstItemIndexInNextBatch = itemDataCount;
    }
    return firstItemIndexInNextBatch;
  },
  
  
  jumpToLastScrollPosition: function() {
    var cache = this.cache;
    
    cache.firstVisibleBatch = -1;
    cache.lastVisibleBatch = -1;
    
    var jumpToScrollTop = GlobalVariable.Browser.Document.height() * cache.scrollPercentage;
    cache.scrollTop = jumpToScrollTop;
    GlobalVariable.Browser.Window.scrollTop(jumpToScrollTop);
    this.onScroll();
  },
  
  
  onScroll: function(event) {
    if (this.cascadeContainer.is(":visible")) {
      var cache = this.cache;
      
      var thisWindow = GlobalVariable.Browser.Window;
      var scrollTopPosition = thisWindow.scrollTop();
      var oldScrollTopPosition = cache.scrollTop;
      cache.scrollPercentage = scrollTopPosition / GlobalVariable.Browser.Document.height();
      cache.scrollTop = scrollTopPosition;
      
      var firstVisibleBatch = 0;
      var lastVisibleBatch = 0;
      var lastBatch = cache.batchContainer.length - 1;
      
      if (lastBatch >= 0) {
        if (scrollTopPosition >= cache.batchTopPosition[lastBatch]) {
          firstVisibleBatch = lastBatch;
          lastVisibleBatch = lastBatch;
        } else {
          for (var ii = lastBatch; ii > 0; --ii) {
            if (scrollTopPosition < cache.batchTopPosition[ii] && scrollTopPosition >= cache.batchTopPosition[ii - 1]) {
              firstVisibleBatch = ii - 1;
              lastVisibleBatch = firstVisibleBatch;
              
              var scrollBottmPosition = scrollTopPosition + thisWindow.height();
              if (scrollBottmPosition >= cache.batchTopPosition[lastBatch]) {
                lastVisibleBatch = lastBatch;
              } else {
                for (var jj = firstVisibleBatch + 1; jj <= lastBatch; ++jj) {
                  if (scrollBottmPosition < cache.batchTopPosition[jj]) {
                    lastVisibleBatch = jj - 1;
                    break;
                  }
                }
              }
              
              break;
            }
          }
        }
      }
  
      var batchEagerDisplayBelowViewport = this.BATCH_EAGER_DISPLAY_BELOW_VIEWPORT;
      var stillBeAbleToScrollDownAfterThisScroll = this.beAbleToScrollDown();
      
      if (firstVisibleBatch !== cache.firstVisibleBatch
        || lastVisibleBatch !== cache.lastVisibleBatch
        || (batchEagerDisplayBelowViewport == 0 && !stillBeAbleToScrollDownAfterThisScroll)
      ) {
        cache.firstVisibleBatch = firstVisibleBatch;
        cache.lastVisibleBatch = lastVisibleBatch;
        
        for(var index = firstVisibleBatch; index <= lastVisibleBatch; ++index) {
          this.attachBatch(index, false);
        }
  
        var firstOnBoardBatch = firstVisibleBatch - this.BATCH_EAGER_DISPLAY_ABOVE_VIEWPORT;
        for (var index = firstOnBoardBatch; index < firstVisibleBatch; ++index) {
          this.attachBatch(index, false);
        }
  
        var autoFetchWhenScrollToBottom = this.AUTO_FETCH_WHEN_SCROLL_TO_BOTTOM;
        var lastOnBoardBatch = lastVisibleBatch + batchEagerDisplayBelowViewport;
        
        if (batchEagerDisplayBelowViewport > 0) {
          for (var index = lastVisibleBatch + 1; index <= lastOnBoardBatch; ++index) {
            if (index > lastBatch) {
              if (this.hasWellFetchedButUnprocessedBatch()) {
                this.processNextUnprocessedBatch();
              } else {
                if (autoFetchWhenScrollToBottom && this.readyToFetch && cache.moreToFetch) {
                  // prevent loading the same contents more than once
                  clearTimeout(this.fetchDataTimeout);
                  this.fetchDataTimeout = setTimeout(this.fetchData, 300);
                }
                break;
              }
            } else {
              this.attachBatch(index, false);
            }
          }
          
          if (lastBatch < lastOnBoardBatch) {
            lastBatch = lastOnBoardBatch;
          }
        } else {
          if (!stillBeAbleToScrollDownAfterThisScroll) {
            if (this.hasWellFetchedButUnprocessedBatch()) {
              this.processNextUnprocessedBatch();
            } else if (autoFetchWhenScrollToBottom && this.readyToFetch && cache.moreToFetch) {
              // prevent loading the same contents more than once
              clearTimeout(this.fetchDataTimeout);
              this.fetchDataTimeout = setTimeout(this.fetchData, 300);
            }
          } 
        }
        
        // detach batches that should not be on board.
        if (scrollTopPosition !== oldScrollTopPosition) {
          var firstBatchNeedToBeRemoved = 0;
          var lastBatchNeedToBeRemoved = lastBatch;
          if (scrollTopPosition > oldScrollTopPosition) {   // scroll down
            lastBatchNeedToBeRemoved = firstOnBoardBatch - 1;
          } else if (scrollTopPosition < oldScrollTopPosition) {   // scroll up
            firstBatchNeedToBeRemoved = lastOnBoardBatch + 1;
          }
          for (var index = firstBatchNeedToBeRemoved; index <= lastBatchNeedToBeRemoved; ++index) {
            var batchContainer = cache.batchContainer[index];
            if (batchContainer) {
              batchContainer.remove();
              cache.batchContainer[index] = null;
            }
          }
        }
        
        // this is very important to prevent too fast scrolling
        if (autoFetchWhenScrollToBottom && !this.beAbleToScrollDown()) {
          this.onScroll();
        }
      }
    }
  },
  
  
  remove: function() {
    this.removeHelper();
    
    this.removeScrollListener();
    
    this.cascadeContainer = null;
    
    Backbone.View.prototype.remove.call(this);
  }
});
