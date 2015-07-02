class Picture < ActiveRecord::Base
  belongs_to :article
  
  
  has_attached_file :src, :styles => {:medium => "600>", :thumb => "200"},
    :convert_options => {:thumb => "-quality 75", :medium => "-quality 100"},
    :default_url => "/images/:style/missing.png",
    :path => ":rails_root/public/system/:class/:attachment/:id_partition/:style/:id.:extension",
    :url => "/system/:class/:attachment/:id_partition/:style/:id.:extension",
    :use_timestamp => false
    
  validates_attachment_content_type :src, :content_type => /\Aimage\/.*\Z/
end
