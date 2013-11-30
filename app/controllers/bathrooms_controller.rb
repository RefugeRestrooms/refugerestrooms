class BathroomsController < ApplicationController


def index
  @bathrooms = Bathroom.all

end

def new
  @post = Post.new
end

def create
  @post = Post.new(post_params)

  if @post.save
    flash[:notice] = "You're Bathroom listing was sucessfully created!"
    redirect to @post
end


end
