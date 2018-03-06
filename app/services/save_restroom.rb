class SaveRestroom
  def initialize(restroom)
    @restroom = restroom
  end

  def call
    p @restroom
    if @restroom.spam?
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
