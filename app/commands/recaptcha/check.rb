module Recaptcha
  class Check
    RECAPTCHA_URI = 'https://www.google.com/recaptcha/api/siteverify'.freeze

    def self.call(token, secret = ENV['RECAPTCHA_SECRET_KEY'])
      new(token, secret).perform
    end

    def initialize(token, secret)
      @token = token
      @secret = secret
    end

    def perform
      request = Net::HTTP::Post.new(uri)
      request.set_form_data(secret: @secret, response: @token)

      response = Net::HTTP.start(uri.hostname, uri.port, use_ssl: true, read_timeout: 3) do |req|
        req.request(request)
      end

      JSON.parse(response.body).dig('success')
    rescue Net::ReadTimeout, Net::OpenTimeout
      false
    end

    def uri
      @uri ||= URI(RECAPTCHA_URI)
    end
  end
end
