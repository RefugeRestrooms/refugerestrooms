require 'spec_helper'

describe 'the contact process', type: :feature do
  it 'should show a restroom when contact is from edit restroom form' do
    restroom = create(:restroom, name: "Mission Creek Cafe")

    visit restroom_path restroom
    click_link 'Contact us about this post!'

    expect(page).to have_content('Mission Creek Cafe')
  end

  it 'should show a generic contact when contact is not from restroom form' do
    restroom = create(:restroom, name: "Mission Creek Cafe")

    visit restroom_path restroom
    click_link 'Contact'

    expect(page).to_not have_content('Mission Creek Cafe')
  end
end
