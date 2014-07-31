// define the view "Index.Main"
Views.Articles.Index.Main = Backbone.View.extend({
  initialize: function() {
    _.bindAll(this, 'handleScroll');
    $(window).on("scroll", this.handleScroll);
    
    this.resetCascadeContainer();
    this.articlesPerBatch = 7;
    
    this.allSubviews = [];
  },
  
  
  resetCascadeContainer: function() {
    this.hPosition = [0.0, 0.0, 0.0, 0.0];
    this.vPosition = [0, 240, 480, 720];
    this.minHorizontalIndex = 0.0;

    this.batch = 0;
    this.readyToLoad = true;
    this.moreToLoad = true;
  },
  
  
  el: "div#main_container",
  
  
  template: JST["templates/articles/index/main"],
  
  
  render: function() {
    this.$el.html(this.template());
    this.loadArticles();
    
    return this;
  },
  
  
  getMinHorizontalIndex: function() {
    this.minHorizontalIndex = 0.0;
    var min = this.hPosition[0];
    for (var index = 1; index < 4; ++index) {
      if (min > this.hPosition[index]) {
        min = this.hPosition[index];
        this.minHorizontalIndex = index;
      }
    }
  },
  
  
  insertNewCoordinate: function(hCoordinate, vCoordinate) {
    this.hPosition[this.minHorizontalIndex] = hCoordinate;
    this.vPosition[this.minHorizontalIndex] = vCoordinate;
  },
  
  
  loadArticles: function() {
    if (this.moreToLoad) {
      var that = this;
      
      var cascadeContainer = $("#cascade_container");
      var articles = new Collections.Articles.Articles();
      articles.fetchBatch(that.batch, that.articlesPerBatch, {
        success: function(fetchedResults) {
          fetchedArticles = fetchedResults.models;
          _.each(fetchedArticles, function(article) {
            var viewArticleCover = new Views.Articles.Index.Cover({article: article});
            that.allSubviews.push(viewArticleCover);   // prevent view memory leak
            that.getMinHorizontalIndex();
            var hCoordinate = that.hPosition[that.minHorizontalIndex];
            var vCoordinate = that.vPosition[that.minHorizontalIndex];
            cascadeContainer.append(viewArticleCover.render(hCoordinate, vCoordinate).$el);
            var coverHeight = viewArticleCover.$el.children("div.article_information").height() + article.get("cover_picture_height") + 20.0;
            var newHorizontalCoordinate = 5.0 + hCoordinate + coverHeight;
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
    if (thisWindow.scrollTop() + thisWindow.height() + 500 > $(document).height()) {
      if (this.readyToLoad && this.moreToLoad) {
        this.readyToLoad = false;
        this.loadArticles();
      }
    }
  },
  
  
  events: {
    "click #click_to_load": "loadArticles"
  },
  
  
  remove: function() {
    var subview;
    while (this.allSubviews.length > 0) {
      subview = this.allSubviews.pop();
      if (subview) {
        subview.remove();
      }
    }
    
    $(window).off("scroll");
    
    Backbone.View.prototype.remove.call(this);
  }
});
