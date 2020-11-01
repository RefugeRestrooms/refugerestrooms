require 'spec_helper'

describe 'the contact process', type: :feature do
  it 'shows a generic contact when contact is not from restroom form' do
    restroom = create(:restroom, name: "Mission Creek Cafe")

    visit restroom_path restroom
    click_link 'Contact'

    expect(page).not_to have_content('Mission Creek Cafe')
  end
end
