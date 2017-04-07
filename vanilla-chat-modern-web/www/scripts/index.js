 'use strict';
 
 getManager().then(manager => {
    var input = document.getElementById("input");
    var user = document.getElementById("user");
    var submit = document.getElementById("submit");

    manager.receiveMessage = msg => appendMessage(msg);
    submit.addEventListener("click", () => { send(); return false; });

    function appendMessage(data) {
        var p = document.createElement("p");
        var div = document.createElement("div");
        var msgs = document.getElementById("msgs");
        var user = document.createElement("span");

        p.innerText = data.msg;
        user.innerText = data.user;

        p.appendChild(user);
        div.appendChild(p);
        msgs.appendChild(div);

        msgs.scrollTop = msgs.scrollHeight;

        return div;
    }

    function clearFocusInput() {
        input.value = "";
        input.focus();
    }

    function send() {
        var data = { 
            time: new Date().getTime(),
            msg: input.value,
            user: user.value
        };

        appendMessage(data).className = "local";
        manager.sendMessage(data).catch(err => console.log(err));
        
        clearFocusInput();
    }
 });