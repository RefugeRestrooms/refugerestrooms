module BathroomsHelper
  def find_closing_time_for_day(name)
    time = Time.new
    day_of_week = time.wday + 1
    venue_hours = Rails.cache.read(name)
    if !venue_hours["timeframes"].empty?
    days_for_time = venue_hours["timeframes"]
    days_for_time.each do |x|
    if x["days"].include? day_of_week 
    opening_and_closing_times =  x["open"] 
    closing_time = opening_and_closing_times["end"]  
    end
    end
    end
  end

  def find_opening_time_for_day(name)
    time = Time.new
    day_of_week = time.wday + 1
    venue_hours = Rails.cache.read(name)
    if !venue_hours["timeframes"].empty?
    days_for_time = venue_hours["timeframes"]
    days_for_time.each do |x|
    if x["days"].include? day_of_week 
    opening_and_closing_times =  x["open"] 
    opening_time = opening_and_closing_times["start"]  
    end
    end
    end
  end
end