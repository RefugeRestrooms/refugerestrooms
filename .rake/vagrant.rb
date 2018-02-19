namespace :vagrant do
  task :shell, [:command] do |_t, args|
    fail "Usage rake vagrant:shell[command]" unless args[:command]

    vagrant_path = 'PATH=/home/vagrant/.rbenv/shims:$PATH'

    # We need to reset RUBYLIB in order to use gems in
    # the context of the VM.
    #
    # Please see: https://github.com/mitchellh/vagrant/issues/6158#issuecomment-135796049
    # for more info.
    sh "unset RUBYLIB; vagrant ssh -c 'cd /vagrant/ && #{vagrant_path} bundle exec #{args[:command]}'"
  end
end
