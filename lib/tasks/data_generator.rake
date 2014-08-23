namespace :data_generator do
  desc "Generate data for development."
  
  
  task :article, [:amount] => [:environment] do |task, args|
    allPictureNames = Dir.entries(Rails.root.join("resource", "pictures"))
    
    allPictureNames.each do |picName|
      if picName != "." && picName != ".."
        file = File.open(Rails.root.join("resource", "pictures", picName))
        picture = Picture.new
        picture.src = file
        file.close
        picture.save
      end
    end
  end

end
