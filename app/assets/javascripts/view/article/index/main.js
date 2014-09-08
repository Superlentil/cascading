// define the view "Index.Main"
View.Article.Index.Main = Backbone.View.extend({
  initialize: function() {
    _.bindAll(this, "handleScroll");
    
    $(window).on("scroll", this.handleScroll);
    
    this.articlesPerBatch = 50;
    
    this.batch = 0;
    this.readyToLoad = true;
    this.moreToLoad = true;
  },
  
  
  resetCascade: function(maxWidth) {
    var divToMeasureScrollBarWidth = $("<div style='height: 9999px'></div>");
    this.$el.append(divToMeasureScrollBarWidth);
    this.maxWidth = maxWidth || this.$el.width();
    divToMeasureScrollBarWidth.detach();
    divToMeasureScrollBarWidth.remove();
    
    this.columnWidth = GlobalConstant.Cascade.COLUMN_WIDTH_IN_PX;
    if (this.maxWidth < GlobalConstant.Cascade.MIN_WIDE_MODE_WIDTH_IN_PX) {
      this.columnCount = 2;
      this.gap = 4.0;
      this.coverPadding = 8.0;
      this.columnWidth = this.maxWidth / 2.0;
      this.coverWidth = this.columnWidth - this.gap;
      this.actualWidth = this.maxWidth - this.gap;
      this.coverPictureScale = (this.coverWidth - this.coverPadding * 2) / GlobalConstant.Cascade.COVER_PICTURE_WIDTH_IN_PX;
    } else {
      this.columnCount = Math.floor(this.maxWidth / this.columnWidth);
      if (this.columnCount > 5) {
        this.columnCount = 5;
      }
      this.gap = 8.0;
      this.coverPadding = 16.0;
      this.coverWidth = this.columnWidth - this.gap;
      this.actualWidth = this.columnCount * this.columnWidth - this.gap;
      this.coverPictureScale = 1.0;
    }
    
    this.hPosition = [];
    this.vPosition = [];
    for (var index = 0; index < this.columnCount; ++index) {
      this.hPosition.push(0.0);
      this.vPosition.push(this.columnWidth * index);
    }
    this.minHorizontalIndex = 0.0;
  },
  
  
  el: "#layout-content",
  
  
  mainTemplate: JST["template/article/index/main"],
  coverTemplate: JST["template/article/index/cover"],
  
  
  render: function() {
    var that = this;
    
    that.$el.html(that.mainTemplate());

    that.resetCascade();

    $("#article-index-cascade-container").css("width", that.actualWidth + "px");
    
    that.loadArticles();
       
    return that;
  },
  
  
  getMinHorizontalIndex: function() {
    this.minHorizontalIndex = 0.0;
    var min = this.hPosition[0];
    for (var index = 1; index < this.columnCount; ++index) {
      if (min > this.hPosition[index]) {
        min = this.hPosition[index];
        this.minHorizontalIndex = index;
      }
    }
  },
  
  
  getCascadeContainerHeight: function() {
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
      
      var cascadeContainer = $("#article-index-cascade-container");
      var articles = new Collection.Article.Article();
      
      articles.fetchBatch(that.batch, that.articlesPerBatch, {
        success: function(fetchedResults) {
          fetchedArticles = fetchedResults.models;
          
          _.each(fetchedArticles, function(article) {          
            that.getMinHorizontalIndex();
            var hCoordinate = that.hPosition[that.minHorizontalIndex];
            var vCoordinate = that.vPosition[that.minHorizontalIndex];
            
            var originalCoverPictureHeight = article.get("cover_picture_height");
            var articleCover = $(that.coverTemplate({
              article: article,
              hCoordinate: hCoordinate,
              vCoordinate: vCoordinate,
              width: that.coverWidth,
              padding: that.coverPadding,
              originalCoverPictureHeight: originalCoverPictureHeight,
              coverPictureHeight: Math.floor(originalCoverPictureHeight * that.coverPictureScale)
            }));
            cascadeContainer.append(articleCover);
            
            var newHorizontalCoordinate = that.gap + hCoordinate + articleCover.outerHeight();
            that.insertNewCoordinate(newHorizontalCoordinate, vCoordinate);
            
            if (newHorizontalCoordinate > cascadeContainer.height()) {
              cascadeContainer.css({"height": newHorizontalCoordinate + "px"});
            }
          });
                    
          ++that.batch;
          that.readyToLoad = true;
          if (fetchedArticles.length < that.articlesPerBatch) {
            that.moreToLoad = false;
          }
        }
      });
    }
  },
   
  
  handleScroll: function(event) {
    var thisWindow = $(window);
    var scrollTopPosition = thisWindow.scrollTop();
    var documentHeight = $(document).height();
    
    this.scrollPercentage = scrollTopPosition / documentHeight;
    
    if (scrollTopPosition + thisWindow.height() + 500 > documentHeight) {
      if (this.readyToLoad && this.moreToLoad) {
        this.readyToLoad = false;
        this.loadArticles();
      }
    }
  },
  
  
  events: {
    "click #click_to_load": "loadArticles"
  },
  
  
  onResize: function(event) {
    var maxWidth = this.$el.width();
    
    var newColumnCount = Math.floor(maxWidth / GlobalConstant.Cascade.COLUMN_WIDTH_IN_PX);
    
    if (newColumnCount != this.columnCount || this.maxWidth < GlobalConstant.Cascade.MIN_WIDE_MODE_WIDTH_IN_PX) {
      var that = this;
         
      var oldCascadeContainer = $("#article-index-cascade-container");
      oldCascadeContainer.detach();
      that.resetCascade(maxWidth);
      
      var newCascadeContainer = $("<div id='article-index-cascade-container' style='width: " + this.actualWidth + "px;'></div>");
      that.$el.prepend(newCascadeContainer);
      
      oldCascadeContainer.children().each(function(index, articleCover) {
        that.getMinHorizontalIndex();
        var hCoordinate = that.hPosition[that.minHorizontalIndex];
        var vCoordinate = that.vPosition[that.minHorizontalIndex];
        
        var jqueryArticleCover = $(articleCover);
        jqueryArticleCover.css({"top": hCoordinate + "px", "left": vCoordinate + "px", "width": that.coverWidth + "px", "padding": that.coverPadding + "px"});
        var coverPictureHeight = Math.floor(parseFloat(jqueryArticleCover.data("originalCoverPictureHeight")) * that.coverPictureScale);
        jqueryArticleCover.children(".article-index-cover-img-link").children(".article-index-cover-img").css("height", coverPictureHeight);
        newCascadeContainer.append(jqueryArticleCover);

        var newHorizontalCoordinate = that.gap + hCoordinate + jqueryArticleCover.outerHeight();
        that.insertNewCoordinate(newHorizontalCoordinate, vCoordinate);
        
        if (newHorizontalCoordinate > newCascadeContainer.height()) {
          newCascadeContainer.css({"height": newHorizontalCoordinate + "px"});
        }
      });
      
      $(window).scrollTop($(document).height() * that.scrollPercentage);      
      oldCascadeContainer.remove();
    }
  },
  
  
  remove: function() {   
    $(window).off("scroll");
    
    Backbone.View.prototype.remove.call(this);
  }
});
