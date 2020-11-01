require 'net/http'
require 'uri'
require 'json'

module RecaptchaHelper
  def self.valid_token?(token)
    json_body = verify(token)

    if json_body['success']
      true
    else
      false
    end
  end

  def self.verify(token)
    # Get secret from env
    secret = ENV['RECAPTCHA_SECRET_KEY']

    uri = URI('https://www.google.com/recaptcha/api/siteverify')
    request = Net::HTTP::Post.new(uri)
    request.set_form_data('secret' => secret, 'response' => token)
    response = Net::HTTP.start(uri.hostname, uri.port, use_ssl: true) do |https|
      https.request(request)
    end

    JSON.parse(response.body)
  end
end
