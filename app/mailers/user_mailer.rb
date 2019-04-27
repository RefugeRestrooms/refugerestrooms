class UserMailer < ApplicationMailer
  def approve_new_user_email(user)
    @user = user
    mail(to: 'refugerestrooms@gmail.com', subject: 'New user requires approval')
  end
end
