var o = {
  v1: 'v1',
  v2: 'v2',
  f1: function(){
    console.log(this.v1); // 자기 객체 참조
  },
  f2: function(){
    console.log(this.v2); // 자기 객체 참조
  }
}

o.f1(); // v1
o.f2(); // v2
