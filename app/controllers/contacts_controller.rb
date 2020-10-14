class ContactsController < ApplicationController
  def new
    @contact = Contact.new(restroom_id: params['restroom_id'], restroom_name: params['restroom_name'])
  end

  def create
    @contact = Contact.new(params[:contact])
    unless @contact.valid?
      flash.now[:error] = I18n.t('contacts.submitted.cannot-send')
      render :new
      return
    end

    # Verify recaptcha code
    recaptcha_response = params['g-recaptcha-response']
    unless Recaptcha::Check.call(recaptcha_response)
      flash.now[:error] = I18n.t('helpers.reCAPTCHA.failed')
      render :new
      return
    end

    @contact.request = request
    @contact.deliver
    flash.now[:error] = nil
    flash.now[:notice] = I18n.t('contacts.submitted.thank-you-exclamation')
  end
end
