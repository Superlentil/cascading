class PicturesController < ApplicationController
  respond_to :json
  
  
  def index
    @picture = Picture.new
    @pictures = Picture.all
  end


  def show
  end


  def create
    @picture = Picture.create(pictureParams)
    respond_with @picture
  end


  def update
  end


  def destroy
    @picture = Picture.find(params[:id])
    @picture.destroy
    respond_with @picture
  end

  
  
private
  def pictureParams
    params.require(:picture).permit(:src)
  end
end
