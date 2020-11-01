Given(/^I am on the restroom page for id 1$/) do
  FactoryBot.create(
    :restroom,
    id: 1,
    name: 'Winnipeg restroom',
    street: '91 Albert St.',
    city: 'Winnipeg',
    state: 'MB',
    country: 'Canada'.merge(locations[:Winnipeg])
  )
  visit '/restrooms/1'
end

Then(/^I should see the edit link$/) do
  expect(page).to have_content("Propose an edit to this listing.")
end

Given(/^I visit the edit page for 'Winnepeg restroom'$/) do
  FactoryBot.create(
    :restroom,
    id: 1,
    name: 'Winnipeg restroom',
    street: '91 Albert St.',
    city: 'Winnipeg',
    state: 'MB',
    country: 'Canada'.merge(locations[:Winnipeg])
  )
  visit '/restrooms/new?edit_id=1&restroom_id=1'
end

Then(/^I should see the restroom address$/) do
  expect(page).to have_content("684 East hastings")
end

Given(/^I submit an edit to 'Winnepeg Restroom'$/) do
  FactoryBot.create(
    :restroom,
    id: 1,
    name: 'Winnipeg restroom',
    street: '91 Albert St.',
    city: 'Winnipeg',
    state: 'MB',
    country: 'Canada'.merge(locations[:Winnipeg])
  )
  visit '/restrooms/new?edit_id=1&restroom_id=1'
  fill_in 'restroom[name]', with: 'Not Winnepeg restroom'
  click_button "Save Restroom"
end

Then(/^I should see that the edit has been submitted$/) do
  expect(page).to have_content("Your edit has been submitted. We will review it and update the listing")
end
