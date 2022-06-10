require 'spec_helper'

RSpec.describe LocaleService do
  before { allow(I18n).to receive(:default_locale).and_return('fr') }

  describe '.call' do
    subject(:service) { described_class.call(param_locale, http_locale) }

    let(:param_locale) { nil }
    let(:http_locale) { nil }

    context 'when @param_locale is valid' do
      let(:param_locale) { 'pt-BR' }

      it 'responds with @locale' do
        expect(service).to eq('pt-BR')
      end
    end

    context 'when @param_locale is nil' do
      let(:http_locale) { 'es' }

      it 'responds with @http_locale' do
        expect(service).to eq('es')
      end
    end

    context 'when @param_locale is blank' do
      let(:param_locale) { ' ' }
      let(:http_locale) { 'en' }

      it 'responds with @http_locale' do
        expect(service).to eq('en')
      end
    end

    context 'when both @param_locale and @http_locale is nil' do
      it 'responds with I18n.default_locale' do
        expect(service).to eq('fr')
      end
    end
  end
end
