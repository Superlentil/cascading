class ArticlesController < ApplicationController
  respond_to :json
  
  
  def index
    @articles = Article.all
    respond_with @articles
    return
  end
  

  def show
    @article = Article.find(params[:id])
    respond_with @article
    return
  end


  def create
    @article = Article.new(articleParams)
    @article.save
    respond_with @article
    return
  end


  def update
    @article = Article.find(params[:id])
    ActiveRecord::Base.transaction do
      if articleParams[:published]
        @article.update(articleParams)
        publishPreparation(articleParams)
      else
        @article.update(articleParams)
      end
    end
    respond_with @article
    return
  end


  def destroy
    @article = Article.find(params[:id])
    @article.destroy
    respond_with @article
    return
  end

 
private
  def articleParams
    params.require(:article).permit(:cover_picture_url, :cover_picture_id, :title, :author, :content, :category, :id, :views, :like, :published, :user_id, :created_at, :updated_at)
  end
  
  
  def publishPreparation(articleParams)
    pictureId = []
    articleContent = ActiveSupport::JSON.decode(articleParams[:content])
    articleContent.each do |paragraph|
      if paragraph["type"] == "picture"
        pictureId.push(paragraph["pictureId"])
      end
    end
    if pictureId.empty?
      unusedPictures = Picture.where("article_id = ?", articleParams[:id])
    else
      unusedPictures = Picture.where("article_id = ? and id not in (?)", articleParams[:id], pictureId)
    end
    unusedPictures.destroy_all
  end
end
