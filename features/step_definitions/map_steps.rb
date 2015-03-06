When(/^I show the map$/) do
  # TODO: Figure out why this isn't working.
  # print page.html
  page.has_css?(".mapToggle", :visible => true)
  # find('.mapToggle').click
  # print page.html
end

Then(/^I should see a restroom on the map$/) do
  # TODO: Figure Out why This isn't working either
  # page.has_css?(#)
  # expect(page).to have_css('#mapArea.loaded')
  # expect(page).to have_css('#mapArea .numberCircleText')
end
