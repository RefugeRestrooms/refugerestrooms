class Contact < MailForm::Base
  attribute :name, validate: true
  attribute :email, validate: URI::MailTo::EMAIL_REGEXP
  attribute :restroom_id, allow_blank: true
  attribute :restroom_name, allow_blank: true
  attribute :message
  attribute :nickname, captcha: true

  validate :restroom_must_exist

  def restroom_must_exist
    return if restroom_id.blank?
    return if Restroom.exists?(id: restroom_id, name: restroom_name)

    errors.add(:base, "Must be valid restroom ID and name")
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
