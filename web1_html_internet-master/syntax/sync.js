var fs = require('fs');

/*
// readFileSync 동기 : 순서대로
console.log('A');
var result = fs.readFileSync('syntax/sample.txt', 'utf8');
console.log(result);
console.log('C');
*/

// readFile 비동기 : 순서 기다리지 말고 다른거 먼저
console.log('A');
fs.readFile('syntax/sample.txt', 'utf8', function(err, result){
  console.log(result);
});
console.log('C');
