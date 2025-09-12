const sqlite3 = require('sqlite3').verbose(); // verbose provides more detailed stack trace
const db = new sqlite3.Database('db_1200iRealSongs');
const url = require('url')
const fs = require('fs')
const headerFilePath = __dirname + '/views/user.hbs'
const footerFilePath = __dirname + '/views/footer.hbs'
exports.authenticate = function(request, response, next) {
    let auth = request.headers.authorization;

    if (!auth) {
        response.setHeader('WWW-Authenticate', 'Basic realm="need to login"');
        response.writeHead(401, { 'Content-Type': 'text/html' });
        
        response.end();
    } else {
        var tmp = auth.split(' ');
        var buf = Buffer.from(tmp[1], 'base64');
        var plain_auth = buf.toString();
        var credentials = plain_auth.split(':');
        var username = credentials[0];
        var password = credentials[1];
        //console.log("User: ", username)
        //console.log("Password: ", password)

        var authorized = false;

        db.all("SELECT userid, password, role FROM users", function(err, rows) {
            if (err) {
                console.error('Error querying database:', err);
                response.writeHead(500, { 'Content-Type': 'text/html' });
                response.end('Internal Server Error');
                return;
            }

            for (var i = 0; i < rows.length; i++) {
                if (rows[i].userid == username && rows[i].password == password) {
                    authorized = true;
                    request.user_role = rows[i].role;
                    break;
                }
            }

            if (!authorized) {
                response.setHeader('WWW-Authenticate', 'Basic realm="need to login"');
                response.writeHead(401, { 'Content-Type': 'text/html' });
                
                response.end();
            } else {
                next();
            }
        });
    }
};
function send_users(request, response, rows) {

  
    fs.readFile(headerFilePath, function(err, data) {
      if (err) {
        handleError(response, err);
        return;
      }
      response.writeHead(200, {
        'Content-Type': 'text/html'
      })
      response.write(data)
  
      //INSERT DATA
      for (let row of rows) {
        console.log(row)
        response.write(`<p>user: ${row.userid} password: ${row.password}</p>`)
      }
  
      fs.readFile(footerFilePath, function(err, data) {
        if (err) {
          handleError(response, err);
          return;
        }
        response.write(data)
        response.end()
      })
    })
}
exports.users = function(request, response) {
    // /send_users
    console.log('USER ROLE: ' + request.user_role)
  
  
    if(request.user_role !== 'admin'){
      response.writeHead(200, {
        'Content-Type': 'text/html'
      })
      response.write('<h2>ERROR: Admin Privileges Required To See Users</h2>')
      response.end()
      return
    }
    db.all("SELECT userid, password FROM users", function(err, rows) {
      send_users(request, response, rows)
    })
  
}