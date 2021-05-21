let $name = $("#userName");
let $pass = $("#userPass");
$("#formWrapper").submit((e) => {
	e.preventDefault();
	let name = $name.val();
	let password = $pass.val();
	$.ajax({
		type:"post",
		url:"/setup",
		contentType:"text/json;charset=utf-8",
		data:JSON.stringify({ name, password })
	}).then(() => {
		alert("注册成功");
		location.href = "/login.html";
	}, () => {});
	console.log(name, password);
});