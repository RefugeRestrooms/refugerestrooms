When(/^I show the map$/) do
  find('.mapToggle').click
end

Then(/^I should see a restroom on the map$/) do
  expect(page).to have_css('#mapArea.loaded')
  expect(page).to have_css('#mapArea .numberCircleText')
end
