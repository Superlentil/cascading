class ArticlesController < ApplicationController
  include LoginSessionsHelper
  
  
  respond_to :json
  
  
  def index
    respond_with fetchArticles(params[:fetch_sequence_number], params[:articles_per_fetch], params[:page_load_time], {})
    return
  end
  
  
  def draftByUser
    @articleDrafts = Article.where(user_id: params[:user_id], status: GlobalConstant::ArticleStatus::DRAFT)
      .select("id, cover_picture_url, title, created_at, content")
      .order(id: :desc)
  end
  
  
  def inCategory
    queryConditions = {category_id: params[:category_id].to_i}
    
    respond_with fetchArticles(params[:fetch_sequence_number], params[:articles_per_fetch], params[:page_load_time], queryConditions)
  end
  
  
  def byUser
    queryConditions = {user_id: params[:user_id].to_i}
    
    respond_with fetchArticles(params[:fetch_sequence_number], params[:articles_per_fetch], params[:page_load_time], queryConditions)
  end
  
  
  def byUserAndCategory
    queryConditions = {user_id: params[:user_id].to_i, category_id: params[:category_id].to_i}
    
    respond_with fetchArticles(params[:fetch_sequence_number], params[:articles_per_fetch], params[:page_load_time], queryConditions)
  end
  
  
  def search
    adjustedFetchSequenceNumber = params[:fetch_sequence_number].to_i + 1
    articlesPerFetch = params[:articles_per_fetch].to_i
    keyword = params[:keyword]  
    
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
      
      with :status, GlobalConstant::ArticleStatus::PUBLIC_PUBLISHED
      with(:publish_time).less_than Time.at(params[:page_load_time].to_i / 1000.0)
      order_by :id, :desc

      paginate :page => adjustedFetchSequenceNumber, :per_page => articlesPerFetch
    end
    
    respond_with search.results
  end
  

  def show
    @article = Article.find(params[:id])
    if @article.status == GlobalConstant::ArticleStatus::PUBLIC_PUBLISHED || correctLoggedInUser?(@article.user_id)
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
      Article.where("id < ? AND user_id = ? AND status = ?", @article.id, inputParams[:user_id].to_i, GlobalConstant::ArticleStatus::INITIAL_TEMPORARILY_CREATED).destroy_all
    end
    return
  end


  def update
    @article = Article.find(params[:id])
    inputParams = articleParams
    if correctLoggedInUser?(@article.user_id)
      ActiveRecord::Base.transaction do
        if inputParams[:status] && inputParams[:status].to_i == GlobalConstant::ArticleStatus::PUBLIC_PUBLISHED
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
  
  
  def fetchArticles(fetchSequenceNumber, articlesPerFetch, pageLoadTime, queryConditions)
    countPerFetch = articlesPerFetch.to_i
    queryConditions[:status] = GlobalConstant::ArticleStatus::PUBLIC_PUBLISHED;
    return Article.where("publish_time < ?", Time.at(pageLoadTime.to_i / 1000.0)).where(queryConditions)
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
