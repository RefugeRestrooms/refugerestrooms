class Contact < MailForm::Base
  attribute :name, validate: true
  attribute :email, validate: /\A([\w\.%\+\-]+)@([\w\-]+\.)+([\w]{2,})\z/i # rubocop:disable Style/RedundantRegexpEscape, Style/RedundantRegexpCharacterClass
  attribute :restroom_id, allow_blank: true
  attribute :restroom_name, allow_blank: true
  validate :restroom_must_exist
  attribute :message
  attribute :nickname, captcha: true

  def restroom_must_exist
    return if restroom_id.blank?
    return if Restroom.exists?(id: restroom_id, name: restroom_name)

    errors.add(:base, "Must be valid restroom ID and Name")
  end

  # Declare the e-mail headers. It accepts anything the mail method
  # in ActionMailer accepts.
  def headers
    {
      subject: "My Contact Form #{restroom_id}",
      to: "refugerestrooms@gmail.com",
      from: %("#{name}" <#{email}>), # :from overriden by google smtp config
      reply_to: %("#{name}" <#{email}>)
    }
  end
end
