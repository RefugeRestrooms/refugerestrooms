class SaveRestroom
  def initialize(restroom)
    @restroom = restroom
  end

  def call
    if @restroom.spam?
      @restroom.errors.add(:spam, 'This restroom is spam')
    else
      Restroom.transaction do
        @restroom.save
        @restroom.update(edit_id: @restroom.id) if @restroom.approved?
      end
    end
    @restroom
  end
end
