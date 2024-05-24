// Generates ASP.NET Mvc View
//const chalk = require('chalk');
const fs = require('fs');

const config = {
  index: '../wwwroot/index.html',
  output: '../Views/App/Index.cshtml'
}

if (fs.existsSync(config.index)) {
  try {
    // Read Angular CLI generated index
    let content = fs.readFileSync(config.index, 'utf-8');

    // Replace @ with @@ in the .cshtml file to avoid error
    content = content.replace(/@/g, '@@');

    // Write the content of the previously read file into an Mvc view
    fs.writeFileSync(config.output, content);

    console.log(`Project : Web => Generated ${config.output}`);
  } catch (e) {
    console.log(`Project : Web => Cannot be generated: ${e}`);
  }
} else {
  console.log(`Project : Web => Cannot find index file.`);
}
