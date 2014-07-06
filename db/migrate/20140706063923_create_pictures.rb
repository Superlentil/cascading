class CreatePictures < ActiveRecord::Migration
  def change
    create_table :pictures do |t|
      t.attachment :src
      t.references :article, index: true

      t.timestamps
    end
  end
end
