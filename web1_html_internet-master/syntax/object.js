var members = ['a', 'b', 'c'];
console.log(members[1]); // b
var i = 0;
while(i < members.length){
  console.log('array >>>', members[i]);
  i += 1;
}

var roles = {
  'kim':'student',
  'choi':'musician',
  'park':'programmer'
}
console.log(roles.kim); // student
for(var key in roles){
  console.log('object key >>>', name, 'object value >>>', roles[key]);
}
