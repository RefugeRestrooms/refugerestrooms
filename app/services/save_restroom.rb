class SaveRestroom
  def initialize(restroom, check_spam = true)
    @restroom = restroom
    @check_spam = check_spam
  end

  def call
    if @check_spam && @restroom.spam?
      @restroom.errors.add(:spam, 'This restroom is spam')
    else
      Restroom.transaction do
        @restroom.save
        if @restroom.approved?
          @restroom.update(edit_id: @restroom.id)
        end
      end
    end
    @restroom
  end
end
