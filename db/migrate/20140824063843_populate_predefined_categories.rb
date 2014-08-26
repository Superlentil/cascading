class PopulatePredefinedCategories < ActiveRecord::Migration
  def up
    Category.create({name: "Car", group: GlobalConstant::ArticleCategoryType::PREDEFINED})
    Category.create({name: "Jewelry", group: GlobalConstant::ArticleCategoryType::PREDEFINED})
    Category.create({name: "Tattoo", group: GlobalConstant::ArticleCategoryType::PREDEFINED})
  end
  
  
  def down
    Category.where(name: "Car").destroy_all
    Category.where(name: "Jewelry").destroy_all
    Category.where(name: "Tattoo").destroy_all
  end
end
