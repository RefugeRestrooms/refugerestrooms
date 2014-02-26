namespace :db do
  desc "Fix wrongly-encoded accented characters (use db:fix_accents[dry_run] to preview changes)"
  task :fix_accents, [:dry_run] => [:environment] do |t, args|
    args.with_defaults(dry_run: false)

    transformations = {
      "Ž" => "é",
      "™" => "ô",
      "&Atilde;&uml;" => "è",
      "&Atilde;&copy;" => "é",
      "&iuml;&iquest;&frac12;Restroom&iuml;&iquest;&frac12;" => "'Restroom'",
      "&iuml;&iquest;&frac12; " => "é ",
      "ÌÊ" => "à",
      "Ì«" => "ô",
      "Ì©" => "é",
      "Ì¬s" => "’s",
      "Ì¬" => "è",
      "Ì¨" => "î",
      "Ìø" => "ï",
      "ÌÛ" => "À",
      "\u008F" => "è",
      "&Atilde;&iexcl;" => "á",
      "&amp;" => "&",
      "&Atilde;&sect;" => "ç"
    }

    if args.dry_run
      puts "Dry running fix_accents"
    else
      puts "Running fix_accents"
    end

    puts ""

    fields = [:name, :street, :city, :directions, :comment]

    fields.each do |field|
      where_clause = transformations.keys.map{|original| "#{field} like '%#{original}%'"}.join(" OR ")

      puts field, "="*field.length,""

      Bathroom.where(where_clause).each do |bathroom|
        transformations.each do |original, transformed|
          bathroom.send("#{field}=", bathroom.send(field).gsub(original, transformed))
        end

        puts bathroom.id, "", bathroom.send("#{field}_was"), "", bathroom.send(field), "\n\n"

        bathroom.save unless args.dry_run
      end
    end
  end
end
