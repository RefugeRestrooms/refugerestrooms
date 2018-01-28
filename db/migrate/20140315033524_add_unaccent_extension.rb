class AddUnaccentExtension < ActiveRecord::Migration[4.2]
  def up
    execute "create extension unaccent"
  end

  def down
    execute "drop extension unaccent"
  end
end
