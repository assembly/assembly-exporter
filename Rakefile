require 'rake'

task :compile do
  File.open('AssemblyExporter.jsx','w') do |f|
    File.open('README.md').readlines.each do |l|
      f.puts "// #{l}"
    end
    f.puts File.open('src/underscore.js').read
    f.puts File.open('src/ae.js').read
  end
end
