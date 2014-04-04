When(/^I search for "(.*?)"$/) do |search|
  fill_in 'search', with: search
  find('.searchButton').click
end
