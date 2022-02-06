const express = require('express');
const app = express();
const port = 3000;
const fs = require('fs');
const template = require('./lib/template.js');
const path = require('path');
const sanitizeHtml = require('sanitize-html');
const qs = require('querystring');

app.get('/', (request, response) => {
  fs.readdir('./data', function(error, filelist){
  const title = 'Welcome';
  const description = 'Hello, Node.js';
  const list = template.list(filelist);
  const html = template.HTML(title, list,
    `<h2>${title}</h2>${description}`,
    `<a href="/create">create</a>`
  )
  response.send(html);
  })
})

app.get('/page/:pageId', (request, response) => {
  fs.readdir('./data', function(error, filelist){
    const filteredId = path.parse(request.params.pageId).base;
    fs.readFile(`data/${filteredId}`, 'utf8', function(err, description){
      const title = request.params.pageId;
      const sanitizedTitle = sanitizeHtml(title);
      const sanitizedDescription = sanitizeHtml(description, {
        allowedTags:['h1']
      })
      const list = template.list(filelist);
      const html = template.HTML(sanitizedTitle, list,
        `<h2>${sanitizedTitle}</h2>${sanitizedDescription}`,
        ` <a href="/create">create</a>
          <a href="/update?id=${sanitizedTitle}">update</a>
          <form action="delete_process" method="post">
            <input type="hidden" name="id" value="${sanitizedTitle}">
            <input type="submit" value="delete">
          </form>`
      )
      response.send(html);
    })
  })
})

app.get('/create', (request, response) => {
  fs.readdir('./data', function(error, filelist){
    const title = 'WEB - create';
    const list = template.list(filelist);
    const html = template.HTML(title, list,
      `
      <form action="/create_process" method="post">
        <p><input type="text" name="title" placeholder="title"></p>
        <p>
          <textarea name="description" placeholder="description"></textarea>
        </p>
        <p>
          <input type="submit">
        </p>
      </form>
      `,
      '')
    response.send(html);
  })
})

app.post('/create_process', (request, response) => {
  let body = '';
  request.on('data', (data) => {
      body = body + data;
  })
  request.on('end', () => {
      const post = qs.parse(body);
      const title = post.title;
      const description = post.description;
      fs.writeFile(`data/${title}`, description, 'utf8', err => {
        response.writeHead(302, {Location: `/${title}`});
        response.end()
        // response.redirect(302, `/page/${title}`); express의 redirect 메소드로도 response 코드 구현 가능
      })
  })
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

// const http = require('http');
// const url = require('url');

// const app = http.createServer(function(request,response){
//     const _url = request.url;
//     const queryData = url.parse(_url, true).query;
//     const pathname = url.parse(_url, true).pathname;
//     if(pathname === '/'){
//       } else {
//       }
//     } else if(pathname === '/create'){
//     } else if(pathname === '/create_process'){
//     } else if(pathname === '/update'){
//       fs.readdir('./data', function(error, filelist){
//         const filteredId = path.parse(queryData.id).base;
//         fs.readFile(`data/${filteredId}`, 'utf8', function(err, description){
//           const title = queryData.id;
//           const list = template.list(filelist);
//           const html = template.HTML(title, list,
//             `
//             <form action="/update_process" method="post">
//               <input type="hidden" name="id" value="${title}">
//               <p><input type="text" name="title" placeholder="title" value="${title}"></p>
//               <p>
//                 <textarea name="description" placeholder="description">${description}</textarea>
//               </p>
//               <p>
//                 <input type="submit">
//               </p>
//             </form>
//             `,
//             `<a href="/create">create</a> <a href="/update?id=${title}">update</a>`
//           );
//           response.writeHead(200);
//           response.end(html);
//         });
//       });
//     } else if(pathname === '/update_process'){
//       let body = '';
//       request.on('data', function(data){
//           body = body + data;
//       });
//       request.on('end', function(){
//           const post = qs.parse(body);
//           const id = post.id;
//           const title = post.title;
//           const description = post.description;
//           fs.rename(`data/${id}`, `data/${title}`, function(error){
//             fs.writeFile(`data/${title}`, description, 'utf8', function(err){
//               response.writeHead(302, {Location: `/?id=${title}`});
//               response.end();
//             })
//           });
//       });
//     } else if(pathname === '/delete_process'){
//       let body = '';
//       request.on('data', function(data){
//           body = body + data;
//       });
//       request.on('end', function(){
//           const post = qs.parse(body);
//           const id = post.id;
//           const filteredId = path.parse(id).base;
//           fs.unlink(`data/${filteredId}`, function(error){
//             response.writeHead(302, {Location: `/`});
//             response.end();
//           })
//       });
//     } else {
//       response.writeHead(404);
//       response.end('Not found');
//     }
// });
// app.listen(3000);
