class ArticlesController < ApplicationController
  include LoginSessionsHelper
  
  
  respond_to :json
  
  
  def index
    @pageLoadTime = getPageLoadTime(params[:page_load_time])
    @articleCovers = fetchArticles(params[:fetch_sequence_number], params[:articles_per_fetch], @pageLoadTime, {})
  end
  
  
  def draftByUser
    @articleDrafts = Article.where(user_id: params[:user_id], status: GlobalConstant::Article::Status::DRAFT)
      .select("id, cover_picture_url, title, created_at, content")
      .order(id: :desc)
  end
  
  
  def inCategory
    @pageLoadTime = getPageLoadTime(params[:page_load_time])
    queryConditions = {category_id: params[:category_id].to_i}
    @articleCovers = fetchArticles(params[:fetch_sequence_number], params[:articles_per_fetch], @pageLoadTime, queryConditions)
  end
  
  
  def byUser
    @pageLoadTime = getPageLoadTime(params[:page_load_time])
    queryConditions = {user_id: params[:user_id].to_i}
    @articleCovers = fetchArticles(params[:fetch_sequence_number], params[:articles_per_fetch], @pageLoadTime, queryConditions)
  end
  
  
  def byUserAndCategory
    @pageLoadTime = getPageLoadTime(params[:page_load_time])
    queryConditions = {user_id: params[:user_id].to_i, category_id: params[:category_id].to_i}
    @articleCovers = fetchArticles(params[:fetch_sequence_number], params[:articles_per_fetch], @pageLoadTime, queryConditions)
  end
  
  
  def search
    adjustedFetchSequenceNumber = params[:fetch_sequence_number].to_i + 1
    articlesPerFetch = params[:articles_per_fetch].to_i
    keyword = params[:keyword]
    pageLoadTime = getPageLoadTime(params[:page_load_time])
    
    search = Article.search(:select => [
      :id,
      :cover_picture_url,
      :cover_picture_id,
      :cover_picture_height,
      :title,
      :author,
      :user_id,
      :category_name,
      :category_id
    ]) do
      fulltext keyword do
        boost_fields :title => 10.0
        boost_fields :author => 5.0
        boost_fields :category_name => 5.0
      end
      
      with :status, GlobalConstant::Article::Status::PUBLIC_PUBLISHED
      with(:publish_time).less_than pageLoadTime
      order_by :id, :desc

      paginate :page => adjustedFetchSequenceNumber, :per_page => articlesPerFetch
    end
    
    @pageLoadTime = pageLoadTime
    @articleCovers = search.results
  end
  
  
  def recommend
    fetchSequenceNumber = params[:fetch_sequence_number].to_i
    articlesPerFetch = params[:articles_per_fetch].to_i
    articleId = params[:article_id]
    categoryName = params[:category]
    random = params[:random].to_f
    
    if @@recommendCache[categoryName].nil? || @@recommendCache[categoryName][:expireTime] < Time.now.to_i
      generateRecommendCacheForCategory(categoryName)
    end
    
    recommends = @@recommendCache[categoryName][:articles]
    lastIndex = recommends.length - 1
    start = ((lastIndex * random).floor + fetchSequenceNumber * articlesPerFetch) % lastIndex
    
    @recommendArticles = []
    articlesPerFetch.times do
      if start >= lastIndex
        start = 0
      end
      if recommends[start].id == articleId
        @recommendArticles << recommends[lastIndex]
      else
        @recommendArticles << recommends[start]
      end
      start += 1
    end
  end
  

  def show
    @article = Article.find(params[:id])
    if @article.status == GlobalConstant::Article::Status::PUBLIC_PUBLISHED || correctLoggedInUser?(@article.user_id)
      respond_with @article
    end
    return
  end


  def create
    inputParams = articleParams
    if correctLoggedInUser?(inputParams[:user_id])
      @article = Article.new(inputParams)
      @article.save
      respond_with @article
      Article.where("id < ? AND user_id = ? AND status = ?", @article.id, inputParams[:user_id].to_i, GlobalConstant::Article::Status::INITIAL_TEMPORARILY_CREATED).destroy_all
    end
    return
  end


  def update
    @article = Article.find(params[:id])
    inputParams = articleParams
    if correctLoggedInUser?(@article.user_id)
      ActiveRecord::Base.transaction do
        if inputParams[:status] && inputParams[:status].to_i == GlobalConstant::Article::Status::PUBLIC_PUBLISHED
          if inputParams[:cover_picture_id].to_i < 0
            assignCoverPicture(inputParams)
          end
          coverPicturePath = Picture.find(inputParams[:cover_picture_id]).src.path(:thumb)
          geometry = Paperclip::Geometry.from_file(coverPicturePath)
          inputParams[:cover_picture_height] = geometry.height.to_i
          deleteNotUsedPictures(inputParams)
          if @article.publish_time.nil?
            inputParams[:publish_time] = Time.now
          end
          @article.update(inputParams)   # "update" will modify inputParams, so put this at the end
        else
          @article.update(inputParams)
        end
      end
      respond_with @article
    end
    return
  end


  def destroy
    @article = Article.find(params[:id])
    if correctLoggedInUser?(@article.user_id)
      @article.destroy
      respond_with @article
    end
    return
  end

 
private
  INVALID_ARTICLE_COVER_PICTURE_ID = -1
  
  
  # cache for recommend articles
  # @@recommendCache{:categoryName => {:expireTime, :articles}}
  MAX_RECOMMEND_COUNT_EACH_ENTRY = 1000
  RECOMMEND_CACHE_TIME_IN_SECOND = 86400   # 24 hours
  @@recommendCache = {}
  
  
  def generateRecommendCacheForCategory(categoryName)
    newCache = {}
    newCache[:expireTime] = Time.now.to_i + RECOMMEND_CACHE_TIME_IN_SECOND
    recommendArticles = []
    
    categoryArticles = Article.where(category_name: categoryName).where(status: GlobalConstant::Article::Status::PUBLIC_PUBLISHED)
      .select("id, cover_picture_url, cover_picture_id, cover_picture_height, title, author, user_id, category_name, category_id")
      .limit((MAX_RECOMMEND_COUNT_EACH_ENTRY / 2).floor).order(like: :desc, views: :desc, publish_time: :desc)
      
    categoryArticlesCount = categoryArticles.length
       
    generalArticles = Article.where("category_name <> ?", categoryName).where(status: GlobalConstant::Article::Status::PUBLIC_PUBLISHED)
      .select("id, cover_picture_url, cover_picture_id, cover_picture_height, title, author, user_id, category_name, category_id")
      .limit(MAX_RECOMMEND_COUNT_EACH_ENTRY - categoryArticlesCount).order(like: :desc, views: :desc, publish_time: :desc)
      
    generalArticlesCount = generalArticles.length
    
    if categoryArticlesCount == 0
      generalArticles.each do |article|
        recommendArticles << article
      end
    elsif generalArticlesCount == 0
      categoryArticles.each do |article|
        recommendArticles << article
      end
    else 
      if generalArticlesCount < categoryArticlesCount
        more = categoryArticles
        less = generalArticles
        moreCount = categoryArticlesCount
        lessCount = generalArticlesCount
      else
        more = generalArticles
        less = categoryArticles
        moreCount = generalArticlesCount
        lessCount = categoryArticlesCount
      end
      interval = (moreCount.to_f / lessCount.to_f).round
      index = 0
      less.each do |article|  
        recommendArticles << article
        interval.times do
          if index < moreCount
            recommendArticles << more[index]
            index += 1
          end
        end
      end
      while index < moreCount
        recommendArticles << more[index]
        index += 1
      end
    end
    
    newCache[:articles] = recommendArticles
    @@recommendCache[categoryName] = newCache
  end


  def articleParams
    params.require(:article).permit(
      :id,
      :cover_picture_id,
      :cover_picture_url,
      :cover_picture_height,
      :cover_picture_imported,
      :title,
      :author,
      :content,
      :category_name,
      :category_id,
      :views,
      :like,
      :status,
      :publish_time,
      :user_id,
      :created_at,
      :updated_at
    )
  end
  
  
  def getPageLoadTime(pageLoadTime)
    time = pageLoadTime.to_i
    if time > 0
      time = Time.at(time)
    else
      time = Time.now
    end
    return time
  end
  
  
  def fetchArticles(fetchSequenceNumber, articlesPerFetch, pageLoadTime, queryConditions)
    countPerFetch = articlesPerFetch.to_i
    queryConditions[:status] = GlobalConstant::Article::Status::PUBLIC_PUBLISHED;
    
    return Article.where("publish_time < ?", pageLoadTime).where(queryConditions)
      .select("id, cover_picture_url, cover_picture_id, cover_picture_height, title, author, user_id, category_name, category_id")
      .limit(countPerFetch).offset(fetchSequenceNumber.to_i * countPerFetch).order(id: :desc)
  end
  
  
  def articlePictureIds(articleContent, articleCoverPictureId = INVALID_ARTICLE_COVER_PICTURE_ID)
    pictureIds = [].to_set
    if !articleCoverPictureId.nil? && articleCoverPictureId != INVALID_ARTICLE_COVER_PICTURE_ID
      pictureIds.add(articleCoverPictureId)
    end
    articleContentJson = JSON.parse(articleContent)
    articleContentJson.each do |paragraph|
      if paragraph["type"] == "picture"
        pictureIds.add(paragraph["src"]["id"])
      end
    end
    return pictureIds.to_a
  end
  
  
  def deleteNotUsedPictures(inputParams)
    pictureIds = articlePictureIds(inputParams[:content], inputParams[:cover_picture_id])
    if pictureIds.empty?
      notUsedPictures = Picture.where("article_id = ?", inputParams[:id])
    else
      notUsedPictures = Picture.where("article_id = ? and id not in (?)", inputParams[:id], pictureIds)
    end
    notUsedPictures.destroy_all
  end
  
  
  # if the article has pictures, randomly assign one as cover picture
  # else if there are articles that have the same category with this article, randomly assign a picture from those articles as this article's cover picture
  # else randomly assign a picture from other articles as this article's cover picture
  def assignCoverPicture(inputParams)
    pictureIds = articlePictureIds(inputParams[:content])
    if pictureIds.length == 0
      articleIds = Article.where.not(:id => inputParams[:id]).where(:category_name => inputParams[:category_name]).limit(10000).pluck(:id)
      if articleIds.length == 0
        articleIds = Article.where.not(:id => inputParams[:id]).limit(10000).pluck(:id)
      end
      if articleIds.length > 0
        article = Article.select("cover_picture_id, content").find(articleIds.sample)
        pictureIds = articlePictureIds(article.content, article.cover_picture_id)
        if pictureIds.length > 0
          samplePicture = Picture.find(pictureIds.sample)
          coverPicture = Picture.new
          coverPicture.src = samplePicture.src
          coverPicture.article_id = inputParams[:id]
          if coverPicture.save
            inputParams[:cover_picture_id] = coverPicture.id
            inputParams[:cover_picture_url] = coverPicture.src.url(:thumb)
            inputParams[:cover_picture_imported] = true
          end
        end
      end
    else
      coverPicture = Picture.find(pictureIds.sample)
      inputParams[:cover_picture_id] = coverPicture.id
      inputParams[:cover_picture_url] = coverPicture.src.url(:thumb)
      inputParams[:cover_picture_imported] = false
    end
  end
  
end
