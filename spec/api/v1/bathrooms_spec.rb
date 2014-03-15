require 'spec_helper'

describe 'Bathrooms API' do
  it 'sends a list of bathrooms' do
     FactoryGirl.create_list(:bathroom, 15)
  end
  it 'filters a list of bathrooms by unisex type'
  it 'filters a list of bathrooms by ADA availability'

  it 'full-text searches a list of bathrooms'
  it 'filters a full-text searched list of bathrooms by unisex type'
  it 'filters a full-text searched list of bathrooms by ADA availability'
end
