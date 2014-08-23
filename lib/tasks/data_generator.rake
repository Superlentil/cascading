namespace :data_generator do
  desc "Generate data for development."
  
  ##
  # Use this task to add tons of articles into the database.
  # It's great for testing cascading endless display. 
  #
  # Example Command: rake data_generator:article[10000,true]
  task :article, [:amount, :useSamplePictures] => [:environment] do |task, args|
    amount = args.amount
    if amount.nil?
      amount = 1000
    else
      amount = amount.to_i
    end
    
    useSamplePictures = args.useSamplePictures
    if useSamplePictures.nil?
      useSamplePictures = false
    else
      useSamplePictures = useSamplePictures == "true" ? true : false
    end
    
    if useSamplePictures
      allPictureNames = Dir.entries(Rails.root.join("resource", "pictures"))
      
      allPictureNames.each do |picName|
        if picName != "." && picName != ".."
          file = File.open(Rails.root.join("resource", "pictures", picName))
          Picture.create({src: file})
          file.close
        end
      end
    end
    
    pictures = Picture.all.to_a
    lastIndex = pictures.length - 1
    randomNumberSeed = Time.now.getutc.to_i
    randInt = Random.new(randomNumberSeed)
    
    picHeight = []
    pictures.each do |pic|
      picPath = pic.src.path(:thumb)
      geometry = Paperclip::Geometry.from_file(picPath)
      picHeight.push(geometry.height.to_i)
    end
    
    for index in 1..amount
      randPicIndex = randInt.rand(0..lastIndex)
      pic = pictures[randPicIndex]
      picPath = pic.src.path(:thumb)
      geometry = Paperclip::Geometry.from_file(picPath)
      Article.create({cover_picture_url: pic.src.url(:thumb), 
        cover_picture_id: pic.id, 
        cover_picture_height: picHeight[randPicIndex],
        title: "This is article " + index.to_s + "!",
        author: "Author_" + index.to_s,
        category: "Category_" + index.to_s,
        status: GlobalConstant::ArticleStatus::PUBLIC_PUBLISHED
      })
    end
    
  end

end
