// define the base cascade view API
View.Cascade.Base = Backbone.View.extend({
  // -----------------------------------------------------------------
  // BEGIN: constants or functions that can be overrided by subclass
  // -----------------------------------------------------------------
  
  // --- common constants ---
  CACHE_LIFETIME: 3600000,   // in the unit "milliseconds"
  
  COUNT_PER_BATCH: 30,
  EAGER_LOAD_BATCH: 1,
  
  MAX_COLUMN_COUNT: 5,
  ENABLE_COMPACT_MODE: true,
  MAX_AUTO_COMPACT_MODE_WIDTH: 720.0,   // if compact mode is enabled and the cascading area width is smaller than this value, then the initial display mode will be automatically set to compact.
  
  NORMAL_COLUMN_WIDTH: 240.0,   // in the unit "px"
  NORMAL_VERTICAL_GAP: 8.0,   // in the unit "px"
  NORMAL_HORIZONTAL_GAP: 8.0,   // in the unit "px"
  
  COMPACT_COLUMN_WIDTH: 220.0,   // in the unit "px"
  COMPACT_VERTICAL_GAP: 4.0,   // in the unit "px"
  COMPACT_HORIZONTAL_GAP: 4.0,   // in the unit "px"
    
  el: null,   // must be overrided
    
  mainTemplate: null,   // must be overrided
  itemTemplate: null,   // must be overrided
  
  
  // --- other specific constants for this kind of cascading design, override them for different cascading designs ---
  initializeOtherConstants: function() {},
  
  
  // --- specific functions for this kind of cascading design, override them for different cascading designs ---
  fetchFunction: function(loadingBatch, countPerBatch, options) {},   // must be overrided
  
  
  initializationFromConstructorOptions: function(options) {},
  
  
  resetCacheHelper: function() {},
  
  
  resetDisplayModeParameterHelper: function(maxWidth) {},
  
  
  // This function needs to return a boolean value about the store status.
  // If there is nothing that can be stored into the cache, return "false". Otherwise, return "true".
  // Do not store "item" top position, left position, and height into cache. They will be ignored and automatically recalculated during cascading.
  storeFetchedDataIntoCache: function(fetchedData) {
    if (fetchedData) {
      // storing ...
      return true;   // stored
    } else {
      return false;   // not stored
    }
  },
  
  
  updateItemDataInCacheAfterDisplayModeChange: function(itemIndex) {},
  
  
  isEnoughForScroll: function() {
    var thisWindow = GlobalVariable.Browser.Window;
    return (this.cache.cascadeHeight > thisWindow.scrollTop() + thisWindow.height());
  },
  
  
  getCascadeContainerWidth: function() {
    if (this.isEnoughForScroll()) {
      return this.$el.width();
    } else {
      return this.$el.width() - GlobalVariable.Browser.ScrollBarWidthInPx;
    }
  },
  // -----------------------------------------------------------------
  // END: parameters or functions that can be overrided by subclass
  // -----------------------------------------------------------------
  
  
  initialize: function(options) {
    this.initializeOtherConstants();
    
    _.bindAll(this, "onScroll");
    _.bindAll(this, "loadData");

    this.initializationFromConstructorOptions(options);
    
    this.readyToLoad = true;
    this.moreToLoad = true;    
    this.readyForWidthChange = false;

    // Global Page Cache
    this.renderWithCache = false;
    var pageCacheKey = window.location.href;
    var pageCache = GlobalVariable.PageCache[pageCacheKey];
    if (pageCache && !this.cacheExpired(pageCache)) {
      this.cache = pageCache;
      this.renderWithCache = true;
    } else {
      this.cache = {};
      GlobalVariable.PageCache[pageCacheKey] = this.cache;
      this.resetCache();
    }
  },
  
  
  cacheExpired: function(cache) {
    return ($.now() - cache.lastCacheTime > this.CACHE_LIFETIME);
  },
  
  
  resetCache: function() {
    var cache = this.cache;
    
    cache.lastCacheTime = $.now();
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
        
    cache.nextBatchToLoad = 0;
    cache.batchContainer = [];
    cache.batchTopPosition = [];
    cache.batchProcessed = [];
    
    cache.firstVisibleBatch = -1;
    cache.lastVisibleBatch = -1;
    
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
    GlobalVariable.Browser.Window.off("scroll", this.onScroll);
    
    var oldCascadeContainer = this.cascadeContainer;
    if (oldCascadeContainer) {
      oldCascadeContainer.remove();
    }
    
    var newCascadeContainer = $("<div id='cascade-content' style='width: " + this.cache.cascadeWidth + "px;'></div>");
    this.$el.append(newCascadeContainer);
    this.cascadeContainer = newCascadeContainer;
    
    GlobalVariable.Browser.Window.on("scroll", this.onScroll);
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
      this.loadData();
    }
    
    this.readyForWidthChange = true;
       
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
  
  
  loadData: function() {
    if (this.moreToLoad) {
      this.readyToLoad = false;   // only one load process allowed
      
      var that = this;
      var cache = this.cache;

      var loadingBatch = cache.nextBatchToLoad;
      var countPerBatch = this.COUNT_PER_BATCH;
      
      this.fetchFunction(loadingBatch, countPerBatch, {
        success: function(fetchedData) {
          if (storeFetchedDataIntoCache(fetchedData)) {
            var heightOffset = cache.cascadeHeight;
            cache.batchTopPosition.push(heightOffset);
            cache.batchContainer.push(null);
            cache.batchProcessed.push(false);
            
            ++cache.nextBatchToLoad;
            cache.lastCacheTime = $.now();
            
            that.attachBatch(loadingBatch, true);
            
            if (items.length < countPerBatch) {
              that.moreToLoad = false;
            }
          } else {
            that.moreToLoad = false;
          }
          
          that.readyToLoad = true;
          if (that.moreToLoad && !that.isEnoughForScroll()) {
            that.loadData();
          }
        },
        
        error: function() {
          // TODO: put some error handling logic here
          that.readyToLoad = true;
        }
      });
    }
  },
  
  
  events: {
    "click #cascade-compact-mode": "changeCoverDisplayMode",
    "click #cascade-normal-mode": "changeCoverDisplayMode"
  },
  
  
  changeCoverDisplayMode: function(event) {
    event.preventDefault();
    
    var cache = this.cache;
    
    var reusableBatchCount = cache.nextBatchToLoad;
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
    this.readyToLoad = true;
    this.moreToLoad = true;
    
    var countPerBatch = this.COUNT_PER_BATCH;
    var batch = 0;
    var eagerLoadedBatchCount = 0;
    
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
      ++batch;
      
      if (this.isEnoughForScroll()) {
        if (eagerLoadedBatchCount < this.EAGER_LOAD_BATCH) {
          ++eagerLoadedBatchCount;
        } else {
          break;
        }
      }
    }
    
    var reusedBatchCount = reusableBatchCount;
    if (batch < reusedBatchCount) {
      reusedBatchCount = batch;
    }
    cache.nextBatchToLoad = reusedBatchCount;
    cache.batchTopPosition = cache.batchTopPosition.slice(0, reusedBatchCount);
    cache.batchContainer = cache.batchContainer.slice(0, reusedBatchCount);
    var itemDataCount = cache.itemData.length;
    var reusedItemDataCount = reusedBatchCount * countPerBatch;
    if (reusedItemDataCount > itemDataCount) {
      reusedItemDataCount = itemDataCount;
    }
    cache.itemData = cache.itemData.slice(0, reusedItemDataCount);
       
    if (eagerLoadedBatchCount < this.EAGER_LOAD_BATCH || !this.isEnoughForScroll()) {
      this.loadData();
    }
  },
   
 
  attachBatch: function(batchIndex, isInitialAttach) {
    var cache = this.cache;
    
    if (0 <= batchIndex && batchIndex < cache.nextBatchToLoad) {   // safer
      if ((!cache.batchContainer[batchIndex] && cache.batchProcessed[batchIndex]) || isInitialAttach) {
        var countPerBatch = this.COUNT_PER_BATCH;
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
  
  
  onWidthChange: function() {
    var cache = this.cache;
    
    if (this.readyForWidthChange) {   
      var maxWidth = this.getCascadeContainerWidth();
      var newColumnCount = this.getColumnCount(maxWidth, cache.columnWidth, cache.verticalGap, false);
      
      if (newColumnCount !== cache.columnCount) {
        cache.columnCount = newColumnCount;
        this.resetItemPositionGenerator();
        this.resetCascadeContainer();

        var countPerBatch = this.COUNT_PER_BATCH;
        var batchIndex = 0;
        for (var firstItemIndexInThisBatch = 0; firstItemIndexInThisBatch < itemDataLength; firstItemIndexInThisBatch += countPerBatch) {
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
    var itemDataCount = cache.itemData.length;
    var firstItemIndexInNextBatch = firstItemIndexInThisBatch + countPerBatch;
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
    if (jumpToScrollTop == 0) {
      this.onScroll();
    }
  },
  
  
  onScroll: function(event) {
    var cache = this.cache;
    
    var thisWindow = GlobalVariable.Browser.Window;
    var scrollTopPosition = thisWindow.scrollTop();
    var oldScrollTopPosition = cache.scrollTop;
    cache.scrollPercentage = scrollTopPosition / GlobalVariable.Browser.Document.height();
    cache.scrollTop = scrollTopPosition;
    
    var firstVisibleBatch = 0;
    var lastVisibleBatch = 0;
    var lastBatch = cache.nextBatchToLoad - 1;
    
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
    
    if (lastVisibleBatch + this.EAGER_LOAD_BATCH > lastBatch) {   // Possible Bug: may triggered but not loaded.
      if (this.readyToLoad && this.moreToLoad) {
        // prevent loading the same contents more than once
        clearTimeout(this.loadItemTimeout);
        this.loadItemTimeout = setTimeout(this.loadData, 10);
      }
      lastBatch = cache.nextBatchToLoad - 1;
    }
    
    if (firstVisibleBatch !== cache.firstVisibleBatch || lastVisibleBatch !== cache.lastVisibleBatch) {
      cache.firstVisibleBatch = firstVisibleBatch;
      cache.lastVisibleBatch = lastVisibleBatch;
      
      for(var index = firstVisibleBatch; index <= lastVisibleBatch; ++index) {
        this.attachBatch(index, false);
      }

      var firstOnBoardBatch = firstVisibleBatch - 1;
      if (firstOnBoardBatch < 0) {firstOnBoardBatch = 0;}
      this.attachBatch(firstOnBoardBatch, false);

      var lastOnBoardBatch = lastVisibleBatch + 1;
      if (lastOnBoardBatch > lastBatch) {lastOnBoardBatch = lastBatch;}
      this.attachBatch(lastOnBoardBatch, false);
      
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
    }
  },
  
  
  remove: function() {
    GlobalVariable.Browser.Window.off("scroll");
    
    this.cascadeContainer = null;
    
    Backbone.View.prototype.remove.call(this);
  }
});
