// template 모듈은 topic 또는 author 글의 틀을 만들거나 글의 틀 속에 내용을 만들 때 필요한 함수들을 모아놓은 곳

var sanitizeHtml = require('sanitize-html');


module.exports = {
  /** + 글의 틀을 만드는 함수 */
  HTML: function(title, list, body, control) {
    return `
    <!doctype html>
    <html>
      <head>
        <h1>WEB2 - ${title}</h1>
        <meta charset="utf-8">
      </head>
      <body>
        <h1><a href="/">WEB2</a></h1>
        <a href="/author">author</a>
        ${list}
        ${control}
        ${body}
      </body>
    </html>
    `;
  },
  /** + template.HTML()으로 띄워준 글의 틀 안에 리스트를 넣는 함수 */
  list: function(topics) {
    var list = '<ul>';
    var i = 0;
    while(i < topics.length){
      list = list + `<li><a href="/?id=${topics[i].id}">${sanitizeHtml(topics[i].title)}</a></li>`;
      i += 1;
    }
    list = list + '</ul>';
    return list;
  },
  /** + Insert(Create)할 때, template.HTML()으로 띄워준 글의 틀 안에 모든 author.id 중에서 한 명을 선택할 수 있게 하는 함수  
   * + Update할 때, 만약 모든 author.id를 뒤져서 topic.author_id와 같은 author.id를 찾는다면
   * 찾아낸 author.id에 selected 추가(option 태그 value 속성) 
  */
  authorSelect: function(authors, author_id){
    var tag = "";
    var i = 0;
    while(i < authors.length){
      var selected = '';
      if(author_id === authors[i].id){
        selected = ' selected';
      }
      tag += `<option value="${authors[i].id}"${selected}>${sanitizeHtml(authors[i].name)}</option>`
      i ++;
    }
    return `
      <select name="author">
        ${tag}
      </select>
    `;
  },
  /** + 모든 author들을 표로 나타내주는 함수 */
  authorTable: function(authors){
    var tag = '<table>';
    var i = 0;
    while(i < authors.length) {
      tag += `
        <tr>
          <td>${sanitizeHtml(authors[i].name)}</td>
          <td>${sanitizeHtml(authors[i].profile)}</td>
          <td><a href="/author/update?id=${authors[i].id}">update</a></td>
          <td>
            <form action="/author/delete_process" method="post">
              <input type="hidden" name="id" value="${authors[i].id}">
              <input type="submit" value="delete">
            </form>
          </td>
        </tr>
        `;
      i ++;
    }
    tag += '</table>';
    return tag;
  }
}

