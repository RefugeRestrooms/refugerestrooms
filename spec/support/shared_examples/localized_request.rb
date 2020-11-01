shared_examples_for 'localized request' do |action|
  it 'calls I18n.with_locale in requests' do
    allow(I18n).to receive(:with_locale)

    get action

    expect(I18n).to have_received(:with_locale).with(:en)
  end
end
