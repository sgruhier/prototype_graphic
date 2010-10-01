# mostly borrowed from the scriptaculous Rakefile

require 'rake'
require 'config/deploy' if File.exists?(File.dirname(__FILE__) + '/config/deploy.rb')

PKG_NAME        = 'prototype-graphic'
PKG_NICKNAME    = 'pgf'
PKG_BUILD       = ENV['PKG_BUILD'] ? '.' + ENV['PKG_BUILD'] : ''
PKG_TIMESTAMP   = Time.new.to_s
PKG_VERSION     = '0.1' + PKG_BUILD
PKG_FILE_NAME   = "#{PKG_NAME}-#{PKG_VERSION}"
PKG_DESTINATION = ENV["PKG_DESTINATION"] || "dist"   

RAILS_RAILTIES   = (ENV["RAILS_ROOT"] || '../rails-trunk') + '/railties/html/javascripts'
RAILS_ACTIONVIEW = (ENV["RAILS_ROOT"] || '../rails-trunk') + '/actionpack/lib/action_view/helpers/javascripts'

PKG_DOCUMENTATION_DIR = "doc"
NATURAL_DOC           = "../naturaldocs/NaturalDocs"

task :clean do
  rm_rf PKG_DESTINATION
end

BASE_SRC_FILES = FileList[
  "src/utils.js",
  "src/base/graphic.js",
  "src/base/matrix.js",
  "src/renderer/abstract.js",
  "src/shape/shape.js",
  "src/shape/rect.js",
  "src/shape/ellipse.js",
  "src/shape/circle.js",
  "src/shape/polyline.js",
  "src/shape/polygon.js",
  "src/shape/line.js",
  "src/shape/group.js",
  "src/shape/text.js",
  "src/shape/image.js",
  "src/base/event_notifier.js",
  "src/tools/tool.js",
  "src/tools/tool_manager.js"
]

RENDERER_SRC_FILES = FileList[
  "src/renderer/canvas.js",
  "src/renderer/svg.js",
  "src/renderer/vml.js",
]

desc "Create HTML doc using NaturalDocs"
task :doc do
  system "cd #{PKG_DOCUMENTATION_DIR}; #{NATURAL_DOC} -i ../src -o HTML . -p project/ -cs 'UTF-8' -s 'main pgc'"
end

desc "Create a uniq JS file in #{PKG_DESTINATION}"
task :distrib do
  system "rm -rf #{PKG_DESTINATION}/*js;mkdir -p #{PKG_DESTINATION}"
  BASE_SRC_FILES.each do |file|
    system "cat #{file} >> " +  File.join(PKG_DESTINATION, PKG_NICKNAME + "-core.js")
  end
  system "bin/jsmin.rb < " + File.join(PKG_DESTINATION, PKG_NICKNAME + "-core.js") + " > " + File.join(PKG_DESTINATION, PKG_NICKNAME + "-core-min.js")

  RENDERER_SRC_FILES.each do |file|
    system "cat #{file} >> " +  File.join(PKG_DESTINATION, PKG_NICKNAME + "-renderer.js")
  end
  system "bin/jsmin.rb < " + File.join(PKG_DESTINATION, PKG_NICKNAME + "-renderer.js") + " > " + File.join(PKG_DESTINATION, PKG_NICKNAME + "-renderer-min.js")
end

require 'test/assets/javascripttest'
desc "Runs all the JavaScript unit tests and collects the results"
JavaScriptTestTask.new(:unittest) do |t|
  t.mount("/lib")
  t.mount("/src")
  t.mount("/test")
  
  t.run("/test/unit/matrix_test.html")
  t.run("/test/unit/shape_test.html")
  t.run("/test/unit/rectangle_test.html")
  t.run("/test/unit/ellipse_test.html")
  t.run("/test/unit/circle_test.html")
  t.run("/test/unit/group_test.html")
  t.run("/test/unit/notifier_test.html")
  
  # t.browser(:safari)
  t.browser(:firefox)
  # t.browser(:ie)
  # t.browser(:konqueror)
end