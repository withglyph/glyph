source "https://rubygems.org"

gem "cocoapods", "~> 1.15"
gem "fastlane", "~> 2.0"

plugins_path = File.join(File.dirname(__FILE__), 'apps/mobile/fastlane', 'Pluginfile')
eval_gemfile(plugins_path) if File.exist?(plugins_path)
