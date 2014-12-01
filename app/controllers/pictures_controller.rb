class PicturesController < ApplicationController
  respond_to :json
  
  
  def create
    ActiveRecord::Base.transaction do
      @picture = Picture.create(pictureParams)
      @mediumHeight = "auto"
      if @picture
        mediumPath = @picture.src.path(:medium)
        @mediumHeight = Paperclip::Geometry.from_file(mediumPath).height.to_s + "px"
      end
    end
    respond_with @picture
  end


  def update
  end


  def destroy
    @picture = Picture.find(params[:id])
    @picture.destroy
  end

  
  
private
  def pictureParams
    params.require(:picture).permit(:src, :article_id)
  end
end
