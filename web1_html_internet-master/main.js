var http = require('http');
var url = require('url');
var topic = require('./lib/topic');
var author = require('./lib/author');

var app = http.createServer(function(request,response){ 
  // Insert(Create), Select(Read), Update, Delete 서버를 만드는 함수
  // request, response 는 callback
  var _url = request.url;
  var queryData = url.parse(_url, true).query;
  var pathname = url.parse(_url, true).pathname;

/*
topic url, function 시작
*/

// topic Select(Read)
    if(pathname === '/'){
      // Select(Read - all)
      if(queryData.id === undefined){
        topic.home(request, response);
      } 
      // Select(Read - detail)
      else {
        topic.page(request, response);
      }
    }

// topic Insert(Create) 입력폼
    else if(pathname === '/create') {
      topic.create(request, response);
    }
// topic Insert(Create) 입력폼 처리 후 리다이렉트
    else if(pathname === '/create_process') {
      topic.create_process(request, response);
    }

// topic Update 입력폼
    else if(pathname === '/update') {
      topic.update(request, response);
    }
// topic Update 입력폼 처리 후 리다이렉트
    else if(pathname === '/update_process') {
      topic.update_process(request, response);
    }

// topic Delete 처리 후 리다이렉트
    else if(pathname === '/delete_process') {
      topic.delete_process(request, response);
    }

/*
topic url, function 종료
author url, function 시작
*/

// author Select(Read - all)
    else if(pathname === '/author') {
      author.home(request, response);
    }

// author Insert(Create) 입력폼 처리 후 리다이렉트
else if(pathname === '/author/create_process') {
  author.create_process(request, response);
}

// author Update 입력
else if(pathname === '/author/update') {
  author.update(request, response);
}

// author Update 입력폼 처리 후 리다이렉트
else if(pathname === '/author/update_process') {
  author.update_process(request, response);
}

// author Delete 처리 후 리다이렉트
else if(pathname === '/author/delete_process') {
  author.delete_process(request, response);
}

/*
author url, function 종료
*/

// topic Insert(Create), Select(Read), Update, Delete 이외의 url로 접근했을 때
    else {
      response.writeHead(404);
      response.end('Not Found');
    }


});
app.listen(3000);
