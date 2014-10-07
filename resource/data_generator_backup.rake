namespace :data_generator do
  desc "Generate data for development."
  
  ##
  # Use this task to add tons of articles into the database.
  # It's great for testing cascading endless display. 
  #
  # Example Command: rake data_generator:article[10000,true]
  task :article, [:amount, :useSamplePictures, :minCountOfUser, :minCountOfCategory] => [:environment] do |task, args|
    amount = args.amount
    if amount.nil?
      amount = 0
    else
      amount = amount.to_i
    end
    
    useSamplePictures = args.useSamplePictures
    if useSamplePictures.nil?
      useSamplePictures = false
    else
      useSamplePictures = useSamplePictures == "true" ? true : false
    end
    
    minCountOfUser = args.minCountOfUser
    if minCountOfUser.nil?
      minCountOfUser = 10
    else
      minCountOfUser = minCountOfUser.to_i
    end
    
    minCountOfCategory = args.minCountOfCategory
    if minCountOfCategory.nil?
      minCountOfCategory = 10
    else
      minCountOfCategory = minCountOfCategory.to_i
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
    
    
    userCount = User.count
    if minCountOfUser > User.count
      for count in userCount..(minCountOfUser-1)
        User.create({
          email: "example_user_" + count.to_s + "@example.com",
          password: "example_user_" + count.to_s + "_password",
          nickname: "example_user_" + count.to_s
        })
      end
    end
    
    
    categoryCount = Category.count
    if minCountOfCategory > categoryCount
      for count in categoryCount..(minCountOfCategory-1)
        Category.create({
          name: "example_category_" + count.to_s,
          group: GlobalConstant::ArticleCategoryType::PREDEFINED,
          description: "example_category_" + count.to_s + "_description"
        })
      end
    end

    
    if amount > 0
      users = User.all.to_a
      categories = Category.all.to_a
      pictures = Picture.all.to_a
      userLastIndex = users.length - 1
      categoryLastIndex = categories.length - 1
      pictureLastIndex = pictures.length - 1
      randomNumberSeed = Time.now.getutc.to_i
      randInt = Random.new(randomNumberSeed)
      
      picHeight = []
      pictures.each do |pic|
        picPath = pic.src.path(:thumb)
        geometry = Paperclip::Geometry.from_file(picPath)
        picHeight.push(geometry.height.to_i)
      end
      
      for index in 1..amount
        randUserIndex = randInt.rand(0..userLastIndex)
        randCategoryIndex = randInt.rand(0..categoryLastIndex)
        randPicIndex = randInt.rand(0..pictureLastIndex)
        user = users[randUserIndex]
        category = categories[randCategoryIndex]
        pic = pictures[randPicIndex]
        picPath = pic.src.path(:thumb)
        geometry = Paperclip::Geometry.from_file(picPath)
        Article.create({cover_picture_url: pic.src.url(:thumb), 
          cover_picture_id: pic.id, 
          cover_picture_height: picHeight[randPicIndex],
          title: "This is article " + index.to_s + "!",
          author: user.nickname,
          user_id: user.id,
          category_name: category.name,
          category_id: category.id,
          status: GlobalConstant::ArticleStatus::PUBLIC_PUBLISHED
        })
      end
    end
    
  end

end
