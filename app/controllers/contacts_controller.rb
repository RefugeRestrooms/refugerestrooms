class ContactsController < ApplicationController
  def new
    @contact = Contact.new(restroom_id: params['restroom_id'], restroom_name: params['restroom_name'])
  end

  def create
    @contact = Contact.new(params[:contact])
    @contact.request = request
      if @contact.deliver
        flash.now[:error] = nil
        flash.now[:notice] = I18n.t('contacts.submitted.thank-you-exclamation')
      else
        flash.now[:error] = I18n.t('contacts.submitted.cannot-send')
        render :new
      end
  end
end
