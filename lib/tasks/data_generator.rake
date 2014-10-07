namespace :data_generator do
  desc "Generate data for development."
  
  ##
  # Use this task to add tons of articles into the database.
  # It's great for testing cascading endless display. 
  #
  # Example Command: rake data_generator:article[10000,15,20]
  task :article, [:amount, :minCountOfUser, :minCountOfCategory] => [:environment] do |task, args|
    # initialize input parameters
    amount = args.amount
    if amount.nil?
      amount = 100
    else
      amount = amount.to_i
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
    
    
    # initialize a random number generator
    randomNumberSeed = Time.now.getutc.to_i
    randInt = Random.new(randomNumberSeed)
    
    
    # get all sample pictures
    allPictureNames = Dir.entries(Rails.root.join("resource", "pictures"))
    allPicturePaths = []
    
    allPictureNames.each do |picName|
      if picName != "." && picName != ".."
        allPicturePaths.push(Rails.root.join("resource", "pictures", picName))
      end
    end
    
    allPicturePathsLastIndex = allPicturePaths.length - 1
    
    
    # get sample users ready
    userCount = User.count
    if minCountOfUser > User.count
      for count in (userCount + 1)..minCountOfUser
        file = File.open(allPicturePaths[randInt.rand(0..allPicturePathsLastIndex)])
        User.create({
          email: "example_user_" + count.to_s + "@example.com",
          password: "example_user_" + count.to_s + "_password",
          nickname: "example_user_" + count.to_s,
          avatar: file
        })
        file.close
      end
    end
    
    
    # get sample categories ready
    categoryCount = Category.count
    if minCountOfCategory > categoryCount
      for count in (categoryCount + 1)..minCountOfCategory
        Category.create({
          name: "example_category_" + count.to_s,
          group: GlobalConstant::ArticleCategoryType::PREDEFINED,
          description: "example_category_" + count.to_s + "_description"
        })
      end
    end

    
    # generate articles
    users = User.all.to_a
    categories = Category.all.to_a

    usersLastIndex = users.length - 1
    categoriesLastIndex = categories.length - 1
    
    for index in 1..amount
      randUserIndex = randInt.rand(0..usersLastIndex)
      randCategoryIndex = randInt.rand(0..categoriesLastIndex)
      randUser = users[randUserIndex]
      randCategory = categories[randCategoryIndex]
      
      article = Article.create({title: "This is article " + index.to_s + "!",
        author: randUser.nickname,
        user_id: randUser.id,
        category_name: randCategory.name,
        category_id: randCategory.id,
      })
      
      articleId = article.id
      articleContent = generateArticleContent(randInt, allPicturePaths, articleId)
      
      importCoverPicture = randInt.rand(0..1)
      if importCoverPicture == 0
        articlePictures = Picture.where(article_id: articleId).to_a
        articlePicturesLastIndex = articlePictures.length - 1
        if articlePicturesLastIndex < 0
          importCoverPicture = 1
        end
      end
      
      if importCoverPicture == 1
        file = File.open(allPicturePaths[randInt.rand(0..allPicturePathsLastIndex)])
        coverPicture = Picture.create({src: file, article_id: articleId})
        file.close
        article.imported_cover_picture = true
      else
        coverPicture = articlePictures[randInt.rand(0..articlePicturesLastIndex)]
      end
      
      article.cover_picture_url = coverPicture.src.url(:thumb)
      article.cover_picture_id = coverPicture.id
      article.cover_picture_height = Paperclip::Geometry.from_file(coverPicture.src.path(:thumb)).height.to_i
      article.status = GlobalConstant::ArticleStatus::PUBLIC_PUBLISHED
      article.content = articleContent
      
      article.save
    end
  end
  
  
  def generateText(randomIntegerGenerator)
    chars = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k",
         "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w",
         "x", "y", "z", " ", " ", " ", " ", " ", " "]
    
    charsLastIndex = chars.length - 1
    textLength = randomIntegerGenerator.rand(1..1000)
    text = ""
    (1..textLength).each do
      text += chars[randomIntegerGenerator.rand(0..charsLastIndex)]
    end
    return text
  end
  
  
  def generateArticleContent(randomIntegerGenerator, allPicturePaths, articleId)
    contentTypes = [0, 1, 2]   # "0" means "done". "1" means "text". "2" means "picture".
    
    contentTypesLastIndex = contentTypes.length - 1
    allPicturePathsLastIndex = allPicturePaths.length - 1
    articleContent = "[";
    
    nextContentType = contentTypes[randomIntegerGenerator.rand(0..contentTypesLastIndex)]
    while nextContentType != 0
      if nextContentType == 1
        articleContent += "{\"type\":\"text\",\"src\":\"#{generateText(randomIntegerGenerator)}\"},"
      elsif nextContentType == 2
        file = File.open(allPicturePaths[randomIntegerGenerator.rand(0..allPicturePathsLastIndex)])
        pic = Picture.create({src: file, article_id: articleId})
        file.close
        articleContent += "{\"type\":\"picture\",\"src\":{\"id\":#{pic.id},\"url\":\"#{pic.src.url(:medium)}\"}},"
      end
      nextContentType = contentTypes[randomIntegerGenerator.rand(0..contentTypesLastIndex)]
    end
    
    if articleContent[articleContent.length - 1] == ","
      articleContent[articleContent.length - 1] = "]"
    else
      articleContent += "]"
    end
    
    return articleContent
  end
end
