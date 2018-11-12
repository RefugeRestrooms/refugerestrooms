namespace :db do
  desc "Reverse geocode each restroom's address (use db:reverse_geocode[dry_run] to preview changes)"
  task :reverse_geocode, [:dry_run] => [:environment] do |t, args|
    args.with_defaults(dry_run: false)

    if args.dry_run
      puts "Dry running reverse_geocode"
    else
      puts "Running reverse_geocode"
    end

    puts

    Restroom.all.each do |restroom|

      previous = restroom.full_address
      restroom.reverse_geocode

      if previous != restroom.full_address
        puts "ID: #{restroom.id}\t#{previous}\n"
        puts "\t\t\\==> #{restroom.full_address}\n\n"
        restroom.save unless args.dry_run
      end
    end
  end
end
