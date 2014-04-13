class Contact < MailForm::Base
  attribute :name,      :validate => true
  attribute :email,     :validate => /\A([\w\.%\+\-]+)@([\w\-]+\.)+([\w]{2,})\z/i
  attribute :bathroom_id, :allow_blank => true
  validate :bathroom_must_exist
  attribute :message
  attribute :nickname,  :captcha  => true

  def bathroom_must_exist
    if bathroom_id.present?
      if Bathroom.where(:id => bathroom_id).blank?
        errors.add(:base, "Must be valid bathroom ID")
      end
    end
  end
  # Declare the e-mail headers. It accepts anything the mail method
  # in ActionMailer accepts.
  def headers
    {
      :subject => "My Contact Form #{bathroom_id}",
      :to => "refugerestrooms@gmail.com",
      :from => %("#{name}" <#{email}>)
    }
  end
end
