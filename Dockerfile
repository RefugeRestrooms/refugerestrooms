FROM ruby:2.3.7
RUN apt-get update -qq && apt-get install -y build-essential libpq-dev nodejs
ENV PHANTOM_JS=2.1.1
RUN  apt-get update && \
  apt-get install build-essential chrpath libssl-dev libxft-dev -y && \
  apt-get install libfreetype6 libfreetype6-dev -y && \
  apt-get install libfontconfig1 libfontconfig1-dev -y && \
  cd ~ && \
  export PHANTOM_JS="phantomjs-2.1.1-linux-x86_64" && \
  wget https://github.com/Medium/phantomjs/releases/download/v2.1.1/$PHANTOM_JS.tar.bz2 && \
  tar xvjf $PHANTOM_JS.tar.bz2 && \
  mv $PHANTOM_JS /usr/local/share && \
  ln -sf /usr/local/share/$PHANTOM_JS/bin/phantomjs /usr/local/bin
RUN mkdir /refugerestrooms
WORKDIR /refugerestrooms
COPY Gemfile /refugerestrooms/Gemfile
COPY Gemfile.lock /refugerestrooms/Gemfile.lock
RUN bundle install
COPY . /refugerestrooms
