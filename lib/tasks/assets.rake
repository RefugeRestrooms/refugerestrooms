namespace :assets do
  desc "Compile assets"
    task precompile: [:environment] do
      Rake::Task["webpacker:compile"].invoke
  end
end
