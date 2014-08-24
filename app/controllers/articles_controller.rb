class ArticlesController < ApplicationController
  include LoginSessionsHelper
  
  
  respond_to :json
  
  
  def index
    batch = params[:batch].to_i
    articlesPerBatch = params[:articles_per_batch].to_i
    
    @articles = Article.where(status: GlobalConstant::ArticleStatus::PUBLIC_PUBLISHED)
      .select("id, cover_picture_url, cover_picture_id, cover_picture_height, title, author, category_name")
      .limit(articlesPerBatch).offset(batch * articlesPerBatch).order(id: :desc)
    respond_with @articles
    return
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
    end
    return
  end


  def update
    @article = Article.find(params[:id])
    inputParams = articleParams
    if correctLoggedInUser?(@article.user_id)
      ActiveRecord::Base.transaction do
        if inputParams[:status] && inputParams[:status].to_i != GlobalConstant::ArticleStatus::DRAFT
          if inputParams[:cover_picture_id].to_i < 0
            assignCoverPicture(inputParams)
          end
          coverPicturePath = Picture.find(inputParams[:cover_picture_id]).src.path(:thumb)
          geometry = Paperclip::Geometry.from_file(coverPicturePath)
          inputParams[:cover_picture_height] = geometry.height.to_i
          @article.update(inputParams)
          deleteNotUsedPictures(inputParams)
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
    params.require(:article).permit(:id, :cover_picture_id, :cover_picture_url, :cover_picture_height, :title, :author, :content, :category_name, :views, :like, :status, :user_id, :created_at, :updated_at)
  end
  
  
  def articlePictureIds(articleContent, articleCoverPictureId = INVALID_ARTICLE_COVER_PICTURE_ID)
    pictureIds = [].to_set
    if !articleCoverPictureId.nil? && articleCoverPictureId != INVALID_ARTICLE_COVER_PICTURE_ID
      pictureIds.add(articleCoverPictureId)
    end
    articleContent = ActiveSupport::JSON.decode(articleContent)
    articleContent.each do |paragraph|
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
          end
        end
      end
    else
      coverPicture = Picture.find(pictureIds.sample)
      inputParams[:cover_picture_id] = coverPicture.id
      inputParams[:cover_picture_url] = coverPicture.src.url(:thumb)
    end
  end
  
end
