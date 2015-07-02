class Category < ActiveRecord::Base
  has_attached_file :cover_picture, :styles => {:medium => "280x210^"},
    :convert_options => {:medium => "-gravity center -extent 280x210"},
    :default_url => "/images/:style/missing.png",
    :path => ":rails_root/public/system/:class/:attachment/:id_partition/:style/:id.:extension",
    :url => "/system/:class/:attachment/:id_partition/:style/:id.:extension",
    :use_timestamp => false
    
  validates_attachment_content_type :cover_picture, :content_type => /\Aimage\/.*\Z/
end
