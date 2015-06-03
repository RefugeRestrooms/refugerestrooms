vagrant_path = 'PATH=/home/vagrant/.rbenv/shims:$PATH'

namespace :vagrant do
  task :shell, [:command] do |_t, args|
    fail "Usage rake vagrant:shell[command]" unless args[:command]
    sh "vagrant ssh -c 'cd /vagrant/ &&"\
       "#{vagrant_path} bundle exec #{args[:command]}'"
  end
end
