When(/^I search for "(.*?)"$/) do |search|
  fill_in 'search', with: search
  find('.submit-search-button').click
end

When(/^I search from (.*?)$/) do |location|
  mock_location location
  find('.current-location-button').click
end
