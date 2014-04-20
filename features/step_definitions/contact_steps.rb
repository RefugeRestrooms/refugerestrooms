Given(/^I click to edit from restroom Mission Creek Cafe$/) do
  visit '/restrooms/1'
  click_link 'Contact us about this post!'
end

Then(/^I should see Mission Creek Cafe in the header$/) do
  expect(page).to have_content('Mission Creek Cafe')
end

Given(/^I click to contact from restroom Mission Creek Cafe$/) do
  visit '/restrooms/1'
  click_link 'Contact'
end

Then(/^I should not see Mission Creek Cafe in the header$/) do
  expect(page).to have_no_content('Mission Creek Cafe')
end
