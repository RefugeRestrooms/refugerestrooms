Given(/^I click to edit from restroom Mission Creek Cafe$/) do
  restroom = Restroom.find_by name: "Mission Creek Cafe"
  visit restroom_path restroom
  click_link 'Contact us about this post!'
end

Then(/^I should see Mission Creek Cafe in the header$/) do
  expect(page).to have_content('Mission Creek Cafe')
end

Given(/^I click to contact from restroom Mission Creek Cafe$/) do
  restroom = Restroom.find_by name: "Mission Creek Cafe"
  visit restroom_path restroom
  click_link 'Contact'
end

Then(/^I should not see Mission Creek Cafe in the header$/) do
  expect(page).to have_no_content('Mission Creek Cafe')
end
