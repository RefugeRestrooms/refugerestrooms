def locations
  {Winnipeg: {latitude: 49.8975494, longitude: -97.140118}}
end

Given(/^a restroom exists in Winnipeg$/) do
  FactoryGirl.create(:bathroom, {name: 'Winnipeg restroom', street: '91 Albert St.', city: 'Winnipeg', state: 'MB', country: 'Canada'}.merge(locations[:Winnipeg]))
end

Then(/^I should see a restroom$/) do
  expect(page).to have_css('#results #list .listItem')
end
