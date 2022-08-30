// topic 모듈은 topic table, author table의 CRUD 함수들을 모아놓은 곳

var sanitizeHtml = require('sanitize-html');

// Select(Read - all): home
var db = require('./db');
var template = require('./template.js');

// Select(Read - datail): page
var url = require('url');

// Insert(Create): create_process
var qs = require('querystring');

// topic Select(Read)
// Select(Read - all)
exports.home = function(request, response) { // request, response 객체를 인자로 받음
    // db 는 DB클라이언트(나)와 DB서버를 연결시킬 수 있는 매개체
    // DB서버로 SQL문 Select(Read) 날려야 함 
    db.query(`SELECT * FROM topic`, function(error, topics){ // db.query()로 SQL문 날리면 SQL문에 해당하는 request를 DB 서버에서 보내줌
        // topic table 싹다 가져와서 topics에 대입
        var title = 'Welcome';
        var description = 'Hello, Node.js';
        var list = template.list(topics); // list함수로 topics 다 리스트화시키고 이를 변수 list에 대입
        var html = template.HTML( // HTML함수로 글의 틀을 만들어주는데 그 속에는 
          title, // 1. title 넣고
          list, // 2. 아까 만든 topics 리스트화시킨거 넣고
          `<a href="/create">create</a>`, // 3. control 넣고 이를 변수 html에 대입 
          `<h2>${title}</h2>${description}`  // 4. body 넣고(body에 title, list 넣는다)
          );
        response.writeHead(200); // 헤더에 200 상태코드
        response.end(html); // 웹 클라이언트에게 변수 html를 보내고 응답을 끝내서 로딩을 멈춤
      });
}

// topic Select(Read)
// Select(Read - detail)
exports.page = function(request, response) { // request, response 객체를 인자로 받음
    var _url = request.url; // request객체의 url를 변수 _url에 대입
    // 질문. request는 객체라는 것은 알겠는데 url은 무엇이라고 말해야 할까?
    var queryData = url.parse(_url, true).query; // parse함수가 변수 _url의 쿼리(스트링)부분을 추출해서 객체 {id:'정수'} 형태로 변수 queryData에 대입
    // 질문. url 는 데이터가 url 형태로 DB 클라이언트(나)에게 넘어오기 때문에 qs 가 쓰인거?
    // db 는 DB클라이언트(나)와 DB서버를 연결시킬 수 있는 매개체
    // DB서버로 SQL문 Select(Read) 날려야 함
    db.query(`SELECT * FROM topic`, function(error, topics){ // db.query()로 SQL문 날리면 SQL문에 해당하는 request를 DB 서버에서 보내줌
        // topic table 싹다 가져와서 topics에 대입
        // 질문. 그냥 애초부터 db.query(`SELECT * FROM topic LEFT JOIN author ON topic.author_id = author.id WHERE topic.id=?`) 하면 안되나? 왜 굳이 쓸데없는 SQL문을 날리지?
        db.query(`SELECT * FROM topic LEFT JOIN author ON topic.author_id = author.id WHERE topic.id=?`, // db.query()로 SQL문 날리면 SQL문에 해당하는 request를 DB 서버에서 보내줌
            // topic table 과 topic author 합치고 싹다 가져와서 topic에 대입
            [queryData.id], // queryData = {id='정수'}. 기존 데이터의 id를 아니깐 그 id에 해당하는 topic table의 열을 가져와서
            function(error2, topic){ // 이[{id=정수},{title="문자열"},{description="텍스트"},{author="문자열"}]를 topic에 저장
                // 연관질문. topic = [{id=정수},{title="문자열"},{description="텍스트"},{author="문자열"}]
                // 애는 왜 배열 속 객체 형태로 데이터가 오는거지?
                var title = topic[0].title; // 배열[] 속 객체{key:value}로 오기 때문에 인덱싱해서 title 속성에 접근해서 변수 title에 대입
                var description = topic[0].description; // 배열[] 속 객체{key:value}로 오기 때문에 인덱싱해서 description 속성에 접근해서 변수 description에 대입
                var list = template.list(topics); // list함수로 topics 다 리스트화시키고
                var html = template.HTML( // HTML함수로 글의 틀을 만들어주는데 그 속에는
                    title, // 1. 특정한 detail topic 넣고 
                    list, // 2. 아까 만든 topics 리스트화시킨거 넣고
                    // 3. control(create링크/update링크/delete폼) 넣는다.
                    // delete는 무조건 post다
                    `
                    <a href="/create">create</a>
                    <a href="/update?id=${queryData.id}">update</a>
                    <form action="delete_process" method="post">
                        <input type="hidden" name="id" value="${queryData.id}">
                        <input type="submit" value="delete">
                    </form>
                    `,
                    // 4. body(title, description, name)넣고
                    // topic table 이랑 author table 합쳐서 topic[0].name 가져올 수 있음
                    // 질문. input tag 의 name 속성에 적힌 값이 웹 서버에 전달되는 값?
                    // 맞다면 전달되는 값의 형태는 어떻게 생겼지?
                    `
                    <h2>${sanitizeHtml(title)}</h2> 
                    <p>${sanitizeHtml(description)}</p>
                    <p>by ${sanitizeHtml(topic[0].name)}</p>
                    `,
                    `
                    <a href="/create">create</a>
                    <a href="/update?id=${queryData.id}">update</a>
                    <form action="delete_process" method="post">
                        <input type="hidden" name="id" value="${queryData.id}">
                        <input type="submit" value="delete">
                    </form>
                    `
                );
                response.writeHead(200); // 헤더에 200 상태코드
                response.end(html); // 웹 클라이언트에게 변수 html를 보내고 응답을 끝내서 로딩을 멈춤
        });
    });
}

// topic Insert(Create) 입력폼
exports.create = function(request, response) {
    // db 는 DB클라이언트(나)와 DB서버를 연결시킬 수 있는 매개체
    // Insert(Create) 할 때 편의상 무엇이 만들어져 있는지 확인하면서 Insert할 수 있게 하기 위해 DB서버로 SQL문 Select(Read) 날려야 함
    db.query(`SELECT * FROM topic`, function(error, topics){ // db.query()로 SQL문 날리면 SQL문에 해당하는 request를 DB 서버에서 보내줌
        // topic table 싹다 가져와서 topics에 대입
        db.query(`SELECT * FROM author`, function(error2, authors){ // db.query()로 SQL문 날리면 SQL문에 해당하는 request를 DB 서버에서 보내줌
            // author table 싹다 가져와서 author에 대입
            var title = 'Create';
            var list = template.list(topics); // list함수로 topics 다 리스트화시키고
            var html = template.HTML( // HTML함수로 글의 틀을 만들어주는데 그 속에는
                sanitizeHtml(title), // 1. title 넣고
                list, // 2. 아까 만든 topics 리스트화시킨거 넣고
                // 3. control(create) 넣고
                // 질문. 애는 왜 control 자리가 아니라 body자리에 박혀있지? 왜 안움직여!!
                `<a href="/create">create</a>`,
                // 4. body(form) 넣고
                // 질문. input tag 의 name 속성에 적힌 값이 웹 서버에 전달되는 값?
                // 맞다면 전달되는 값의 형태는 어떻게 생겼지?
                `
                <form action="/create_process" method="post">
                    <p>
                        <input type="text" name="title" placeholder="title">
                    </p>
                    <p>
                        <textarea name="description" placeholder="description"></textarea>
                    </p>
                    <p>
                        ${template.authorSelect(authors)}
                    </p>
                    <p>
                        <input type="submit">
                    </p>
                </form>
                `
            );
            response.writeHead(200); // 헤더에 200 상태코드
            response.end(html); // 웹 클라이언트에게 변수 html를 보내고 응답을 끝내서 로딩을 멈춤
        });
    });
}

// topic Insert(Create) 입력폼 처리 후 리다이렉트 (create_process함수는 create에서 수정한 데이터를 실제로 create해준다)
exports.create_process = function(request, response) { 
    var body = '';
      request.on('data', function(data){ // data event를 받을 때마다 콜백함수 실행
        body += data;
        // 질문. data = title=문자열&description=텍스트&author=정수
        // 쿼리스트링 형태로 data가 들어오는데 왜 author_id가 아니라 author이지?
        // 분명 topic table에는 author_id=정수 으로 설정되어 있는데?
        // 해답. authorSelect() 는 name="author" 로 웹서버로 전달되기 때문임
      })
      request.on('end', function(){ // end event를 받을 때마다 콜백함수 실행
        var post = qs.parse(body); // parse함수가 body의 쿼리스트링부분을 추출해서 post에 대입
        // 질문. qs 는 데이터가 qs 형태로 DB 클라이언트(나)에게 넘어오기 때문에 qs 가 쓰인거?
        // db 는 DB클라이언트(나)와 DB서버를 연결시킬 수 있는 매개체
        // DB서버로 SQL문 Select(Read) 날려야 함
        // 연관질문. post = {title:'문자열', description:'텍스트', author:'정수'}
        // 애는 왜 객체 형태로 데이터가 오는거지?
        db.query(`INSERT INTO topic (title, description, created, author_id) VALUES(?, ?, NOW(), ?)`, // db.query()로 SQL문 날리면 SQL문에 해당하는 request를 DB 서버에서 보내줌
        // topic table 의 title, description, author_id 에는 각각 qs로 넘어왔던 post객체의 title, description, author 넣어준다
            [post.title, post.description, post.author],
            function(error, result){  // 넣어준 결과값을 result에 대입
                // 질문. result가 임의로 정한게 아니라 약속인가? 콘솔 찍어보니깐 내가 모르는 속성들이 찍히는데?
                response.writeHead(302, {Location: `/?id=${result.insertId}`}); // 헤더에 302 상태코드. 일시적 url 리다이렉트
                response.end(); // 웹 클라이언트에게 변수 html를 보내고 응답을 끝내서 로딩을 멈춤
            }
        )
    });
}

// topic Update 입력폼 
// update함수는 요청이 들어온 url을 통해 쿼리(스트링)을 추출하여 기존의 데이터를 나타내고 수정된 데이터를 /update_process url에 보낸다
// 그 수정된 데이터를 update_process 함수가 실제로 수정해서 보여준다
exports.update = function(request, response) { // request, response 객체를 인자로 받음
    db.query(`SELECT * FROM topic`, function(error, topics){ // db.query()로 SQL문 날리면 SQL문에 해당하는 request를 DB 서버에서 보내줌
        // topic table 싹다 가져와서 topics에 대입
        var _url = request.url; // request객체의 url를 변수 _url에 대입
        // 질문. request는 객체라는 것은 알겠는데 url은 무엇이라고 말해야 할까?
        var queryData = url.parse(_url, true).query; // parse함수가 변수 _url의 쿼리(스트링)부분을 추출해서 객체 {key:value, ...} 형태로 변수 queryData에 대입
        // 질문. url 는 데이터가 url 형태로 DB 클라이언트(나)에게 넘어오기 때문에 qs 가 쓰인거?
        // db 는 DB클라이언트(나)와 DB서버를 연결시킬 수 있는 매개체
        // DB서버로 SQL문 Select(Read) 날려야 함
        db.query(`SELECT * FROM topic WHERE id=?`, // db.query()로 SQL문 날리면 SQL문에 해당하는 request를 DB 서버에서 보내줌
            // queryData = {id='정수'}쿼리에 해당하는 id에 해당하는 topic table만을 가져와서 topic에 대입
            [queryData.id], // 쿼리에 해당하는 id에 해당하는 topic table 열만을 가져와서 topic에 대입
            function(error2, topic){ 
                // topic = {id=정수},{title="문자열"},{description="텍스트"},{author="문자열"}
                // 연관질문. 애는 왜 객체형태로 데이터가 오는거지?
                db.query(`SELECT * FROM author`, // author table 싹다 가져와서 authors에 대입
                function(error3, authors){ 
                    var list = template.list(topics); // list함수로 topics 다 리스트화시키고
                    var html = template.HTML( // HTML함수로 글의 틀을 만들어주는데 그 속에는 
                        sanitizeHtml(topic[0].title), // 1. 기존 데이터 즉, [{id=정수},{title="문자열"},{description="텍스트"},{author_id="문자열"}]를 인덱싱으로 배열에서 꺼내서 title 빼서 넣고
                        list, // 2. 아까 만든 topics 리스트화시킨거 넣고
                        // 3. body(form) 넣고
                        // 이 때, 기존의 데이터의 id가 무엇이었는지 hidden 속성을 사용해서 /update_process url에 넘겨줘야 한다!!!!
                        // title, description, author_id 를 보여줘서 기존 데이터가 무엇이었는지 사용자가 보면서 update 할 수 있도록 한다
                        // 질문. input type="hidden" 가 잘 공감이 안됨. hidden가 아니더라도 기존 데이터를 가져와서 접근했다고 생각했는데 hidden 삭제하면 오류남.
                        // 질문. topic[0].id는 말 그대로 id 뿐인데 /update_process에 보내더라도 이걸 어디에 써먹는거지? topic[0]를 통째로 보내야하는 거 아닌가?
                        ` 
                        <form action="/update_process" method="post">
                            <p>
                                <input type="hidden" name="id" value="${topic[0].id}">
                            </p>
                            <p>
                                <input type="text" name="title" placeholder="title" value="${sanitizeHtml(topic[0].title)}">
                            </p>
                            <p>
                                <textarea name="description" placeholder="description">${sanitizeHtml(topic[0].description)}</textarea>
                            </p>
                            <p>
                                ${template.authorSelect(authors, topic[0].author_id)}
                            </p>
                            <p>
                                <input type="submit">
                            </p>
                        </form>
                        `,
                        `<a href="/create">create</a> <a href="/update?id=${topic[0].id}">update</a>`);
                        // 4. control 넣는다
                // topic[0].author_id 는 현재 Read 하는 글의 author 즉, topic.author_id
                // authors 는 모든 author
                // authorSelect()는 이 둘을 비교하여 Update시 기존 author을 판별할 수 있도록 해줌
                response.writeHead(200);
                response.end(html);
            });
        });
    });
}

// topic Update 입력폼 처리 후 리다이렉트 (update_process함수는 update에서 수정한 데이터를 실제로 update해준다)
exports.update_process = function(request, response) {
    var body = '';
    request.on('data', function(data){ // data event를 받을 때마다 콜백함수 실행
        // 질문. data = title=문자열&description=텍스트&author=정수
        // 쿼리스트링 형태로 data가 들어오는데 왜 author_id가 아니라 author이지?
        // 분명 topic table에는 author_id=정수 으로 설정되어 있는데?
        // 해답. authorSelect() 는 name="author" 로 웹서버로 전달되기 때문임
        body += data; // body에 data 계속 누적
    })
    request.on('end', function(){ // end event를 받을 때마다 콜백함수 실행
        var post = qs.parse(body); // parse함수가 변수 body의 쿼리(스트링)부분을 추출해서 객체 {key:value, ...} 형태로 변수 queryData에 대입
        db.query(`UPDATE topic SET title=?, description=?, author_id=? WHERE id=?`, 
            [post.title, post.description, post.author, post.id], 
            function(error, result){
                response.writeHead(302, {Location: `/?id=${post.id}`});
                response.end();
        })
    });
}

// topic Delete 처리 후 리다이렉트
exports.delete_process = function(request, response) {
    var body = '';
      request.on('data', function(data){ // data event를 받을 때마다 callback
        body += data;
      })
      request.on('end', function(){ // end event를 받을 때마다 callback
        var post = qs.parse(body); // querystring이 body를 해석
        db.query(`DELETE FROM topic WHERE id=?`, [post.id], function(error, result){
          if(error){
            throw error;
          }
          response.writeHead(302, {Location: `/`});
          response.end();
        });
      });
}