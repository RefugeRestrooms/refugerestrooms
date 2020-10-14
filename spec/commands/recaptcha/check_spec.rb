require 'spec_helper'

RSpec.describe Recaptcha::Check, type: :command do
  subject { described_class.call(token, secret) }

  let(:token) { 'token' }
  let(:secret) { 'secret' }
  let(:response_body) { { success: true } }
  let(:response_status) { 200 }
  let(:full_response) do
    {
      status: response_status,
      body: response_body.to_json,
      headers: { 'Content-Type' => 'application/json' }
    }
  end

  before { stub_request(:post, described_class::RECAPTCHA_URI).to_return(full_response) }

  context 'with valid params' do
    it { is_expected.to be_truthy }

    it 'requests with secret and token' do
      subject

      assert_requested(:post, described_class::RECAPTCHA_URI, times: 1) do |req| 
        req.body == 'secret=secret&response=token'
      end
    end
  end

  context 'with invalid params' do
    let(:response_body) { { success: false } }

    it 'responds with success: false in body' do
      expect(subject).to be_falsy
    end
  end
end
