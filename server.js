var http = require("http");
var fs = require("fs");
var url = require("url");
var port = process.argv[2] || "8888";

var server = http.createServer(function(request, response) {
	var parsedUrl = url.parse(request.url, true);
	var pathWithQuery = request.url; 
	var queryString = "";
	if (pathWithQuery.indexOf("?") >= 0) { queryString = pathWithQuery.substring(pathWithQuery.indexOf("?")); }
	var path = parsedUrl.pathname;
	var query = parsedUrl.query;
	var method = request.method;

	/******** 从这里开始看，上面不要看 ************/

	console.log("有发送请求，路径（带查询参数）为：" + pathWithQuery);
	if (path === "/logout") {
		let cookie = request.headers["cookie"];
		let session = JSON.parse(fs.readFileSync("db/session.json").toString());
		let sessionId;
		try {
			sessionId = cookie.match(/(?<=session_id\s*=)\d*\.\d*/g)[0];
		} catch (error) { }
		console.log(session[sessionId]);
		if (session[sessionId]) {
			for (let key in session) {
				if (key === sessionId) {
					
					delete session[key];
					fs.writeFileSync("db/session.json", JSON.stringify(session));
					//console.log(session);
				}
			}
		} else {
            
		}
		response.end();
	} else if (path === "/home.html") {
		let cookie = request.headers["cookie"];
		let session = JSON.parse(fs.readFileSync("db/session.json").toString());
		let sessionId;
		try {
			sessionId = cookie.match(/(?<=session_id\s*=)\d*\.\d*/g)[0];
		} catch (error) { }
        
		console.log(session[sessionId]);
		if (session[sessionId]) {
			let usersArray = JSON.parse(fs.readFileSync("db/users.json").toString());
            
			let user = usersArray.filter((user) => {
				return user.id === session[sessionId]["user_id"];
			});
			//console.log(session[sessionId]["user_id"]);
			let string = fs.readFileSync("public/home.html").toString();
			string = string.replace("{{userState}}", "已登录").replace("{{username}}", user[0].name);
			response.write(string);
			
		} else {
			let string = fs.readFileSync("public/home.html").toString();
			string = string.replace("{{userState}}", "未登录").replace("{{username}}", "您");
			response.write(string);
		}
		response.end();
	} else if (path === "/login" && method === "POST") {
		response.setHeader("Content-Type", "text/html;charset=utf-8");
		let usersArray = JSON.parse(fs.readFileSync("db/users.json").toString());
		//console.log(usersArray);
		let array = [];
		request.on("data", (chunk) => {
			array.push(chunk);
		});
		request.on("end", () => {
			let string = Buffer.concat(array).toString();
			let arr = JSON.parse(string);
			let user = usersArray.find((user) => {
				return user.name === arr.name && user.password === arr.password;
			});
			if (user === undefined) {
				response.statusCode = 400;
				response.end("{errorCode:4001}");
			} else {
				response.statusCode = 200;
				let random = Math.random();
				let session = JSON.parse(fs.readFileSync("db/session.json").toString());
				session[random] = { user_id:user.id };
				fs.writeFileSync("db/session.json", JSON.stringify(session));
				response.setHeader("Set-Cookie", `session_id=${random};HttpOnly`);
				response.end();
			}
			
		});
	} else if (path === "/setup" && method === "POST") {
		response.setHeader("Content-Type", "text/html;charset=utf-8");
		let usersArray = JSON.parse(fs.readFileSync("db/users.json").toString());
		//console.log(usersArray);
		let array = [];
		request.on("data", (chunk) => {
			array.push(chunk);
		});
		request.on("end", () => {
			let string = Buffer.concat(array).toString();
			let arr = JSON.parse(string);
			usersArray.push({
				id:usersArray.length + 1,
				name:arr.name,
				password:arr.password
			});
			fs.writeFileSync("db/users.json", JSON.stringify(usersArray));
			//console.log(usersArray);
			response.end();
		});
		
	} else {
    
		response.statusCode = 200;
		path = (path === "/") ? "/index.html" : path;
		console.log(path);
		let setHead = /(?<=\.)(\w*)/.exec(path)[0];

		let hashMap = {
			html:"text/html",
			css:"text/css",
			js:"text/javascript",
			png:"image/png",
			jpg:"image/jpg"
		};
		response.setHeader("Content-Type", `${hashMap[setHead] || "text/html"};charset=utf-8`);
		let string;
    
		try {
			string = fs.readFileSync(`public${path}`);
	
		} catch (error) {
			string = "路径不正确";
			response.statusCode = 404;
		}

		//const page1 = fs.readFileSync("db/page1.json").toString();
		//const array = JSON.parse(page1);
		//const result = array.map(item => `<li>${item.id}</li>`).join("");
		//string = string.replace("{{page1}}", `<ul id="xxx">${result}</ul>`);
		response.write(string);
		response.end();
	}
	/******** 代码结束，下面不要看 ************/
});

server.listen(port);
console.log("监听 " + port + " 成功\n打开 http://localhost:" + port);