Given(/^a restroom exists in Winnipeg$/) do
  FactoryGirl.create(:bathroom, {name: 'Winnipeg restroom', street: '91 Albert St.', city: 'Winnipeg', state: 'MB', country: 'Canada'}.merge(locations[:Winnipeg]))
end

Then(/^I should( not)? see a restroom$/) do |negation|
  expect(page).send(negation ? :not_to : :to, have_css('#results #list .listItem'))
end
