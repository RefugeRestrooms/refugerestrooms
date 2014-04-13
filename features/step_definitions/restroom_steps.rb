Given(/^a restroom exists in Winnipeg$/) do
  FactoryGirl.create(:restroom, {name: 'Winnipeg restroom', street: '91 Albert St.', city: 'Winnipeg', state: 'MB', country: 'Canada'}.merge(locations[:Winnipeg]))
end

Then(/^I should( not)? see a restroom$/) do |negation|
  expect(page).send(negation ? :not_to : :to, have_css('#results #list .listItem'))
end

Then(/^I should see an existing restroom nearby$/) do
  expect(page).to have_css('#nearby .listItem')
end

Then(/^I should not see an existing restroom nearby$/) do
  expect(page).to have_css('#nearby .none')
end
