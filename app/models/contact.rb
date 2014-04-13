class Contact < MailForm::Base
  attribute :name,      :validate => true
  attribute :email,     :validate => /\A([\w\.%\+\-]+)@([\w\-]+\.)+([\w]{2,})\z/i
  attribute :restroom_id, :allow_blank => true
  validate :restroom_must_exist
  attribute :message
  attribute :nickname,  :captcha  => true

  def restroom_must_exist
    if restroom_id.present?
      if Restroom.where(:id => restroom_id).blank?
        errors.add(:base, "Must be valid restroom ID")
      end
    end
  end
  # Declare the e-mail headers. It accepts anything the mail method
  # in ActionMailer accepts.
  def headers
    {
      :subject => "My Contact Form #{restroom_id}",
      :to => "refugerestrooms@gmail.com",
      :from => %("#{name}" <#{email}>)
    }
  end
end
