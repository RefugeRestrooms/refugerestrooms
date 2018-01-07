Given(/^a restroom exists in Winnipeg$/) do
  FactoryBot.create(:restroom, {name: 'Winnipeg restroom', street: '91 Albert St.', city: 'Winnipeg', state: 'MB', country: 'Canada'}.merge(locations[:Winnipeg]))
end

Then(/^I should( not)? see a restroom$/) do |negation|
  expect(page).send(negation ? :not_to : :to, have_css('#list .listItem'))
end

Then(/^I should see an existing restroom nearby$/) do
  page.has_css?(".nearby-container .listItem", :visible => true)
end

Then(/^I should not see an existing restroom nearby$/) do
  page.has_css?(".nearby-container .none", :visible => true)
end
