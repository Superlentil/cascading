// define the view "Index.Main"
Articles.Views.Index.Main = Backbone.View.extend({
  initialize: function() {
    _.bindAll(this, 'handleScroll');
    $(window).on("scroll", this.handleScroll);
    
    this.resetCascadeContainer();
  },
  
  
  resetCascadeContainer: function() {
    this.hPosition = [0, 0, 0, 0];
    this.vPosition = [0, 240, 480, 720];
    this.minHorizontalIndex = 0;

    this.batch = 0;
    this.readyToLoad = true;
    this.moreToLoad = true;
  },
  
  
  el: "div#main_container",
  
  
  template: JST["articles/templates/index/main"],
  
  
  render: function() {
    this.$el.html(this.template());
    this.loadArticles();
    
    return this;
  },
  
  
  getMinHorizontalIndex: function() {
    this.minHorizontalIndex = 0;
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
    var that = this;
    
    var cascadeContainer = $("#cascade_container");
    var articles = new Articles.Collections.Articles();
    articles.fetchBatch(that.batch, {
      success: function(fetchedResults) {
        fetchedArticles = fetchedResults.models;
        _.each(fetchedArticles, function(article) {
          var viewArticleCover = new Articles.Views.Index.Cover({article: article});
          that.getMinHorizontalIndex();
          var hCoordinate = that.hPosition[that.minHorizontalIndex];
          var vCoordinate = that.vPosition[that.minHorizontalIndex];
          cascadeContainer.append(viewArticleCover.render(hCoordinate, vCoordinate).$el);
          var coverHeight = viewArticleCover.$el.children("div.article_information").height() + article.get("cover_picture_height") + 20;
          var newHorizontalCoordinate = hCoordinate + coverHeight + 10;
          that.insertNewCoordinate(newHorizontalCoordinate, vCoordinate);
          if (newHorizontalCoordinate > cascadeContainer.height()) {
            cascadeContainer.css({"height": newHorizontalCoordinate + "px"});
          }
        });
        ++that.batch;
        that.readyToLoad = true;
        if (fetchedArticles.length < 2) {
          that.moreToLoad = false;
        }
      }
    });
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
  }
});
