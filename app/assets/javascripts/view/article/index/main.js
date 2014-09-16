// define the view "Index.Main"
View.Article.Index.Main = Backbone.View.extend({
  initialize: function() {
    _.bindAll(this, "handleScroll");
        
    this.articlesPerBatch = 30;
    
    this.batch = 0;
    this.eagerLoadBatchCount = 1;
    this.readyToLoad = true;
    this.moreToLoad = true;
    
    this.readyForWidthChange = false;
    this.scrollPercentage = 0;
    this.lastScrollTop = 0;
    
    this.firstVisibleBatch = -1,
    this.lastVisibleBatch = -1,
    
    // Global Page Cache
    this.renderWithCache = false;
    this.pageCacheKey = window.location.href;
    GlobalVariable.PageCache[this.pageCacheKey];
    if (GlobalVariable.PageCache[this.pageCacheKey]) {
      this.cache = GlobalVariable.PageCache[this.pageCacheKey];
      this.batch = this.cache.batch;
      if ($.now() - this.cache.lastCacheTime < 3600000) {
        this.renderWithCache = true;
      } 
    } else {
      this.cache = {
        lastCacheTime: $.now(),
        cascadeContainerHeight: 0,
        scrollPercentage: 0,
        columnCount: 0,
        columnWidth: 0,
        columnHeight: null,
        batch: 0,
        batchPosition: [],
        batchContainer: [],
        articleParams: []
      };
      GlobalVariable.PageCache[this.pageCacheKey] = this.cache;
    }
  },
  
  
  el: "#layout-content",
  
  
  mainTemplate: JST["template/article/index/main"],
  coverTemplate: JST["template/article/index/cover"],
  
  
  getColumnCount: function(maxWidth) {
    var columnCount = Math.floor(maxWidth / GlobalConstant.Cascade.COLUMN_WIDTH_IN_PX);
    if (columnCount < 1) {
      columnCount = 1;
    }
    if (columnCount > 5) {
      columnCount = 5;
    }
    return columnCount;
  },


  resetCascade: function(maxWidth) {
    if (maxWidth) {
      this.maxWidth = maxWidth;
    } else {
      this.maxWidth = this.$el.width() - GlobalVariable.Browser.ScrollBarWidthInPx;
    }
    
    this.columnWidth = GlobalConstant.Cascade.COLUMN_WIDTH_IN_PX;
    if (GlobalVariable.Browser.WidthChangeable || this.maxWidth > GlobalConstant.Cascade.MIN_WIDE_MODE_WIDTH_IN_PX) {
      this.columnCount = this.getColumnCount(this.maxWidth);
      this.gap = 8.0;
      this.coverPadding = 16.0;
      this.coverWidth = this.columnWidth - this.gap;
      this.actualWidth = this.columnCount * this.columnWidth - this.gap;
      this.coverPictureScale = 1.0;
    } else {
      this.columnCount = 2;
      this.gap = 4.0;
      this.coverPadding = 8.0;
      this.columnWidth = this.maxWidth / 2.0;
      this.coverWidth = this.columnWidth - this.gap;
      this.actualWidth = this.maxWidth - this.gap;
      this.coverPictureScale = (this.coverWidth - this.coverPadding * 2) / GlobalConstant.Cascade.COVER_PICTURE_WIDTH_IN_PX;
    }
        
    this.hPosition = [];
    this.vPosition = [];
    for (var index = 0; index < this.columnCount; ++index) {
      this.hPosition.push(0.0);
      this.vPosition.push(this.columnWidth * index);
    }
    this.minHorizontalIndex = 0;
    this.currentCascadeHeight = 0.0;
  },
  
  
  render: function() {
    GlobalVariable.Browser.Window.scrollTop(0);
    this.$el.html(this.mainTemplate());

    this.resetCascade();

    this.cascadeContainer = $("#article-index-cascade-container");
    this.cascadeContainer.css("width", this.actualWidth + "px");
    GlobalVariable.Browser.Window.on("scroll", this.handleScroll);
    
    if (this.renderWithCache) {
      if (this.columnCount === this.cache.columnCount && this.columnWidth === this.cache.columnWidth) {
        var batchCount = this.cache.batchContainer.length;
        for (var index = 0; index < batchCount; ++index) {
          this.cache.batchContainer[index] = false;
        }
        this.cascadeContainer.css("height", this.cache.cascadeContainerHeight + "px");
        this.firstVisibleBatch = -1;
        this.lastVisibleBatch = -1;
        this.hPosition = this.cache.columnHeight;
        this.currentCascadeHeight = this.cache.cascadeContainerHeight;
        
        var oldScrollTop = this.lastScrollTop;
        var newScrollTop = GlobalVariable.Browser.Document.height() * this.cache.scrollPercentage;
        GlobalVariable.Browser.Window.scrollTop(newScrollTop);
        if (newScrollTop === oldScrollTop) {
          this.handleScroll();
        }
        this.lastScrollTop = newScrollTop;
      } else {
        this.readyForWidthChange = true;
        this.columnCount = this.cache.columnCount;
        this.columnWidth = this.cache.columnWidth;
        this.scrollPercentage = this.cache.scrollPercentage;
        this.onWidthChange();
      }
    } else {
      this.cache.columnCount = this.columnCount;
      this.cache.columnWidth = this.columnWidth;
      this.loadArticles();
    }
    
    this.readyForWidthChange = true;
       
    return this;
  },
  
   
  getMinHorizontalIndex: function() {
    this.minHorizontalIndex = 0;
    var min = this.hPosition[0];
    for (var index = 1; index < this.columnCount; ++index) {
      if (min > this.hPosition[index]) {
        min = this.hPosition[index];
        this.minHorizontalIndex = index;
      }
    }
  },
  
  
  getCurrentCascadeHeight: function() {
    var max = this.hPosition[0];
    for (var index = 1; index < this.columnCount; ++index) {
      if (max < this.hPosition[index]) {
        max = this.hPosition[index];
      }
    }
    return max;
  },
  
  
  insertNewCoordinate: function(hCoordinate, vCoordinate) {
    this.hPosition[this.minHorizontalIndex] = hCoordinate;
    this.vPosition[this.minHorizontalIndex] = vCoordinate;
  },
  
  
  loadArticles: function() {
    if (this.moreToLoad) {
      var that = this;
      
      var cascadeContainer = that.cascadeContainer;
      var articles = new Collection.Article.Article();
      
      articles.fetchBatch(that.batch, that.articlesPerBatch, {
        success: function(fetchedResults) {
          fetchedArticles = fetchedResults.models;
          
          if (fetchedArticles.length > 0) {
            var heightOffset = that.currentCascadeHeight;
            var batchContainer = $("<div style='position: absolute; left: 0; top: " + heightOffset + "px;'></div>");
            cascadeContainer.append(batchContainer);
            that.cache.batchPosition.push(heightOffset);
            that.cache.batchContainer.push(batchContainer);
            
            _.each(fetchedArticles, function(article) {          
              that.getMinHorizontalIndex();
              var hCoordinate = that.hPosition[that.minHorizontalIndex];
              var vCoordinate = that.vPosition[that.minHorizontalIndex];
              
              var originalCoverPictureHeight = article.get("cover_picture_height");
              
              var params = {
                articleId: article.get("id"),
                articleTitle: article.get("title"),
                articleAuthor: article.get("author"),
                articleCategory: article.get("category_name"),
                coverPictureUrl: article.get("cover_picture_url"),
                originalCoverPictureHeight: originalCoverPictureHeight,
                coverPictureHeight: Math.floor(originalCoverPictureHeight * that.coverPictureScale),
                hCoordinate: hCoordinate - heightOffset,
                vCoordinate: vCoordinate,
                width: that.coverWidth,
                padding: that.coverPadding
              };
              
              var articleCover = $(that.coverTemplate(params));
              batchContainer.append(articleCover);
              var articleCoverHeight = articleCover.outerHeight();
              params.height = articleCoverHeight;
              that.cache.articleParams.push(params);
              
              var newHorizontalCoordinate = that.gap + hCoordinate + articleCoverHeight;
              that.insertNewCoordinate(newHorizontalCoordinate, vCoordinate);
            });
            
            that.currentCascadeHeight = that.getCurrentCascadeHeight();
                      
            ++that.batch;
            that.cache.batch = that.batch;
            that.cache.lastCacheTime = $.now();
            that.readyToLoad = true;
            if (fetchedArticles.length < that.articlesPerBatch) {
              that.moreToLoad = false;
            }
            
            cascadeContainer.css("height", that.currentCascadeHeight + "px");
            that.cache.cascadeContainerHeight = that.currentCascadeHeight;
            that.cache.columnHeight = that.hPosition;
            that.scrollPercentage = GlobalVariable.Browser.Window.scrollTop() / GlobalVariable.Browser.Document.height();
            that.cache.scrollPercentage = that.scrollPercentage;
          } else {
            that.readyToLoad = true;
            that.moreToLoad = false;
          }
        }
      });
    }
  },
   
  
  onWidthChange: function() {
    if (this.readyForWidthChange) {   
      var maxWidth = this.$el.width();
      var newColumnCount = this.getColumnCount(maxWidth);
      var columnWidth = this.columnWidth;
      
      if (newColumnCount !== this.columnCount || columnWidth < GlobalConstant.Cascade.COLUMN_WIDTH_IN_PX) {
        var that = this;
        
        var oldCascadeContainer = that.cascadeContainer;
        oldCascadeContainer.detach();
        
        that.resetCascade(maxWidth);
        that.cache.columnWidth = that.columnWidth;
        that.cache.columnCount = that.columnCount;
        
        var newCascadeContainer = $("<div id='article-index-cascade-container' style='width: " + this.actualWidth + "px;'></div>");
        that.$el.append(newCascadeContainer);
        that.cascadeContainer = newCascadeContainer;
        
        var articleParamsLength = that.cache.articleParams.length;
        var batchIndex = 0;
        for (var thisBatchStart = 0; thisBatchStart < articleParamsLength; thisBatchStart += that.articlesPerBatch) {
          var nextBatchStart = thisBatchStart + that.articlesPerBatch;
          if (nextBatchStart > articleParamsLength) {
            nextBatchStart = articleParamsLength;
          }
          
          var heightOffset = that.currentCascadeHeight;
          that.cache.batchPosition[batchIndex] = heightOffset;
          that.cache.batchContainer[batchIndex] = false;
          
          if (columnWidth < GlobalConstant.Cascade.COLUMN_WIDTH_IN_PX) {
            var newBatchContainer = $("<div style='position: absolute; left: 0; top: " + heightOffset + "px;'></div>");
            newCascadeContainer.append(newBatchContainer);
            
            for (var index = thisBatchStart; index < nextBatchStart; ++index) {
              that.getMinHorizontalIndex();
              var hCoordinate = that.hPosition[that.minHorizontalIndex];
              var vCoordinate = that.vPosition[that.minHorizontalIndex];
              
              var params = that.cache.articleParams[index];
              params.hCoordinate = hCoordinate - heightOffset;
              params.vCoordinate = vCoordinate;
              params.coverPictureHeight = params.originalCoverPictureHeight;
              params.width = that.coverWidth;
              params.padding = that.coverPadding;
              
              var articleCover = $(that.coverTemplate(params));
              newBatchContainer.append(articleCover);
              var articleCoverHeight = articleCover.outerHeight();
              params.height = articleCoverHeight;
              
              var newHorizontalCoordinate = that.gap + hCoordinate + articleCoverHeight;
              that.insertNewCoordinate(newHorizontalCoordinate, vCoordinate);
            }
            
            newBatchContainer.detach();
            newBatchContainer.remove();
          } else {
            for (var index = thisBatchStart; index < nextBatchStart; ++index) {
              that.getMinHorizontalIndex();
              var hCoordinate = that.hPosition[that.minHorizontalIndex];
              var vCoordinate = that.vPosition[that.minHorizontalIndex];
              var params = that.cache.articleParams[index];
              params.hCoordinate = hCoordinate - heightOffset;
              params.vCoordinate = vCoordinate;
              var newHorizontalCoordinate = that.gap + hCoordinate + params.height;
              that.insertNewCoordinate(newHorizontalCoordinate, vCoordinate);
            }
          }
                  
          that.currentCascadeHeight = that.getCurrentCascadeHeight();
          ++batchIndex;
        };
        
        newCascadeContainer.css("height", that.currentCascadeHeight + "px");
        that.cache.cascadeContainerHeight = that.currentCascadeHeight;
        that.cache.columnHeight = that.hPosition;
        that.firstVisibleBatch = -1;
        that.lastVisibleBatch = -1;

        var oldScrollTop = that.lastScrollTop;
        var newScrollTop = GlobalVariable.Browser.Document.height() * that.scrollPercentage;
        GlobalVariable.Browser.Window.scrollTop(newScrollTop);
        if (newScrollTop === oldScrollTop) {
          that.handleScroll();
        }
        that.lastScrollTop = newScrollTop;
        
        oldCascadeContainer.remove();
      }
    }
  },
  
  
  reattachBatch: function(batchIndex) {
    if (!this.cache.batchContainer[batchIndex]) {
      var cascadeContainer = this.cascadeContainer;
      
      var articleParamsLength = this.cache.articleParams.length;
      var thisBatchStart = batchIndex * this.articlesPerBatch;
      var nextBatchStart = thisBatchStart + this.articlesPerBatch;
      if (nextBatchStart > articleParamsLength) {
        nextBatchStart = articleParamsLength;
      }
        
      var batchContainer = $("<div style='position: absolute; left: 0; top: " + this.cache.batchPosition[batchIndex] + "px;'></div>");
      cascadeContainer.append(batchContainer);
      this.cache.batchContainer[batchIndex] = batchContainer;
        
      for (var index = thisBatchStart; index < nextBatchStart; ++index) {
        var articleCover = $(this.coverTemplate(this.cache.articleParams[index]));
        batchContainer.append(articleCover);
      }
    }
  },
  
  
  handleScroll: function(event) {
    var thisWindow = GlobalVariable.Browser.Window;
    var scrollTopPosition = thisWindow.scrollTop();
    this.scrollPercentage = scrollTopPosition / GlobalVariable.Browser.Document.height();
    this.cache.scrollPercentage = this.scrollPercentage;
    
    var firstVisibleBatch = 0;
    var lastVisibleBatch = 0;
    var lastBatch = this.cache.batchContainer.length - 1;
    
    if (lastBatch >= 0) {
      if (scrollTopPosition >= this.cache.batchPosition[lastBatch]) {
        firstVisibleBatch = lastBatch;
        lastVisibleBatch = lastBatch;
      } else {
        for (var ii = lastBatch; ii > 0; --ii) {
          if (scrollTopPosition < this.cache.batchPosition[ii] && scrollTopPosition >= this.cache.batchPosition[ii - 1]) {
            firstVisibleBatch = ii - 1;
            lastVisibleBatch = firstVisibleBatch;
            
            var scrollBottmPosition = scrollTopPosition + thisWindow.height();
            if (scrollBottmPosition >= this.cache.batchPosition[lastBatch]) {
              lastVisibleBatch = lastBatch;
            } else {
              for (var jj = firstVisibleBatch + 1; jj <= lastBatch; ++index) {
                if (scrollTopPosition < this.cache.batchPosition[jj]) {
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
    
    if (lastVisibleBatch + this.eagerLoadBatchCount > this.batch - 1) {   // Possible Bug: may triggered but not loaded.
      lastOnBoardBatch = this.batch;      
      if (this.readyToLoad && this.moreToLoad) {
        this.readyToLoad = false;
        this.loadArticles();
      }
      lastBatch = this.cache.batchContainer.length - 1;
    }
    
    if (firstVisibleBatch !== this.firstVisibleBatch || lastVisibleBatch !== this.lastVisibleBatch) {
      this.firstVisibleBatch = firstVisibleBatch;
      this.lastVisibleBatch = lastVisibleBatch;
      
      for(var index = firstVisibleBatch; index <= lastVisibleBatch; ++index) {
        this.reattachBatch(index);
      }
      
      var firstOnBoardBatch = firstVisibleBatch - 1;
      if (firstOnBoardBatch < 0) {firstOnBoardBatch = 0;}
      this.reattachBatch(firstOnBoardBatch);

      var lastOnBoardBatch = lastVisibleBatch + 1;
      if (lastOnBoardBatch > lastBatch) {lastOnBoardBatch = lastBatch;}
      this.reattachBatch(lastOnBoardBatch);
      
      // detach batches that should not be on board.
      if (scrollTopPosition > this.lastScrollTop) {   // scroll down
        this.lastScrollTop = scrollTopPosition;
        for (var index = 0; index < firstOnBoardBatch; ++index) {
          var batchContainer = this.cache.batchContainer[index];
          if (batchContainer) {
            batchContainer.detach();
            batchContainer.remove();
            this.cache.batchContainer[index] = false;
          }
        }
      } else if (scrollTopPosition < this.lastScrollTop) {   // scroll up
        this.lastScrollTop = scrollTopPosition;
        for (var index = lastBatch; index > lastOnBoardBatch; --index) {
          var batchContainer = this.cache.batchContainer[index];
          if (batchContainer) {
            batchContainer.detach();
            batchContainer.remove();
            this.cache.batchContainer[index] = false;
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
