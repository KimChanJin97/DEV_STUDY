// author 모듈은 author table의 CRUD 함수들을 모아놓은 곳

var sanitizeHtml = require('sanitize-html');


// Select(Read - all): home
var db = require('./db');
var template = require('./template.js');

// Insert(Create): create_process
var qs = require('querystring');

// Update: update
var url = require('url');

// author Select(Read - all)
exports.home = function(request, response) {
    db.query(`SELECT * FROM topic`, function(error, topics){
        db.query(`SELECT * FROM author`, function(error2, authors){
            var title = 'author';
            var list = template.list(topics);
            var html = template.HTML(
            title,
            list,
            `
            ${template.authorTable(authors)}
            <style>
                table{
                    border-collapse: collapse;
                }
                td{
                    border: 1px solid black;
                }
            </style>
            <form action="/author/create_process" method="post">
                <p>
                    <input type="text" name="name" placeholder="name">
                </p>
                <p>
                    <textarea name="profile" placeholder="profile"></textarea>
                </p>
                <p>
                    <input type="submit" value="create">
                </p>
            </form>
            `,
            ``
            );
            response.writeHead(200);
            response.end(html);
        });
      });
}

// author Insert(Create) 입력폼 처리 후 리다이렉트
exports.create_process = function(request, response) {
    var body = '';
      request.on('data', function(data){ // data event를 받을 때마다 callback
        body += data;
      })
      request.on('end', function(){ // end event를 받을 때마다 callback
        var post = qs.parse(body); // querystring이 body를 해석
        db.query(`INSERT INTO author (name, profile) VALUES(?, ?)`, // SQL CREATE 날리기
          [post.name, post.profile],
          function(error, result){
            if(error){
              throw error;
            }
            response.writeHead(302, {Location: `/author`}); // Insert(Create)이후 리다이렉트
            response.end();
          }
        )
      });
}

// author Update 입력폼 
// update함수는 요청이 들어온 url을 통해 쿼리(스트링)을 추출하여 기존의 데이터를 나타내고 수정된 데이터를 /update_process url에 보낸다
// 그 수정된 데이터를 update_process 함수가 실제로 수정해서 보여준다
exports.update = function(request, response) { // request, response 객체를 인자로 받음
    db.query(`SELECT * FROM topic`, function(error, topics){ // topic table 싹다 가져와서 topics에 대입
        db.query(`SELECT * FROM author`, function(error2, authors){ // author table 싹다 가져와서 authors에 대입
            var _url = request.url; // request객체의 url를 변수 _url에 대입
            var queryData = url.parse(_url, true).query; // parse함수가 변수 _url의 쿼리(스트링)부분을 추출해서 객체 {key:value, ...} 형태로 변수 queryData에 대입
            db.query(`SELECT * FROM author WHERE id=?`, // 기존 데이터의 id 가져올건데 그 id는
                [queryData.id], // 쿼리 추출해서 대입했던 객체 queryData의 id 야. 그럼 기존 데이터의 id를 아니깐 그 id에 해당하는 author table의 열을 가져와서
                function(error3, author){ // 이[{id=정수},{name="문자열"},{profile="텍스트"}]를 author에 저장
                    var title = 'author';
                    var list = template.list(topics);
                    var html = template.HTML(
                        title,
                        list,
                        `
                        ${template.authorTable(authors)}
                        <style>
                            table{
                                border-collapse: collapse;
                            }
                            td{
                                border: 1px solid black;
                            }
                        </style>
                        <form action="/author/update_process" method="post">
                            <p>
                                <input type="hidden" name="id" value="${queryData.id}">
                            </p>
                            <p>
                                <input type="text" name="name" value="${sanitizeHtml(author[0].name)}" placeholder="name">
                            </p>
                            <p>
                                <textarea name="profile" placeholder="profile">${sanitizeHtml(author[0].profile)}</textarea>
                            </p>
                            <p>
                                <input type="submit" value="update">
                            </p>
                        </form>
                        `,
                        ``
                    );
                    // input 태그의 객체 접근은 태그 내에서 value="${객체.필드}"
                    // textarea 태그의 객체 접근은 태그 밖에서 ${객체.필드}
                response.writeHead(200);
                response.end(html);
            });
        });
      });
}

// author Update 입력폼 처리 후 리다이렉트 (update_process함수는 update함수를 처리)
exports.update_process = function(request, response){
    var body = '';
      request.on('data', function(data){ // data가 들어오면 계속 body에 누적
          body = body + data;
      });
      request.on('end', function(){ // 더 이상 데이터가 들어오지 않는다면 end event 실행 -> end 가 들어오면
          var post = qs.parse(body); // body를 
          db.query(`
            UPDATE author SET name=?, profile=? WHERE id=?`, // SQL UPDATE 날리기
            [post.name, post.profile, post.id], 
            function(error, result){
              if(error){
                throw error;
              }
              response.writeHead(302, {Location: `/author`});
              response.end();
            }
          )
      });
}

// author Delete 처리 후 리다이렉트
exports.delete_process = function(request, response){
    var body = '';
      request.on('data', function(data){
          body = body + data;
      });
      request.on('end', function(){
          var post = qs.parse(body);
          db.query(
            `DELETE FROM topic WHERE author_id=?`, // SQL DELETE 날리기
            [post.id], 
            function(error1, result1){
                if(error1){
                    throw error1;
                }
                db.query(`
                    DELETE FROM author WHERE id=?`,
                    [post.id], 
                    function(error2, result2){
                        if(error2){
                            throw error2;
                        }
                        response.writeHead(302, {Location: `/author`});
                        response.end();
                    }
                )
            }
        );
      });
}