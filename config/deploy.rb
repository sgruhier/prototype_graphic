desc "Deploy PGF website"
task :deploy_website do 
  system "cd website; scp -r -P 3105 * ddbox:/var/opt/railsapp/prototype-graphic/"
  system "scp -r -P 3105 doc ddbox:/var/opt/railsapp/prototype-graphic/"
end