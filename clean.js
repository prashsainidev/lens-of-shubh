/* eslint-disable */
const fs = require('fs');
const path = require('path');

const targets = [
  path.join(__dirname, '.next'),
  path.join(__dirname, 'node_modules', '.cache')
];

function deleteFolderRecursive(directoryPath) {
  if (fs.existsSync(directoryPath)) {
    fs.readdirSync(directoryPath).forEach((file) => {
      const curPath = path.join(directoryPath, file);
      if (fs.lstatSync(curPath).isDirectory()) {
        // recurse
        deleteFolderRecursive(curPath);
      } else {
        // delete file
        try {
          fs.unlinkSync(curPath);
        } catch (err) {
          console.warn(`[Warning] Could not delete file ${curPath}: ${err.message}`);
        }
      }
    });
    try {
      fs.rmdirSync(directoryPath);
      console.log(`[Cleaned] Successfully deleted directory: ${directoryPath}`);
    } catch (err) {
      console.warn(`[Warning] Could not remove directory ${directoryPath}: ${err.message}`);
    }
  } else {
    console.log(`[Info] Directory does not exist (already clean): ${directoryPath}`);
  }
}

console.log('--- LENS OF SHUBH PROJECT CLEANUP STARTING ---');
targets.forEach((target) => {
  deleteFolderRecursive(target);
});
console.log('--- LENS OF SHUBH PROJECT CLEANUP COMPLETED ---');
