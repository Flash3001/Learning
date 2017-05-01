 'use strict';
 
(function() {
    const manager = getManager();

    const input = document.getElementById("input");
    const user = document.getElementById("user");
    const submit = document.getElementById("submit");

    var container = undefined;

    // send events
    const fromClickStream = Rx.Observable
        .fromEvent(submit, 'click');

    const fromEnterStream = Rx.Observable
        .fromEvent(input, "keypress")
        .filter(key => key.code == "Enter");

    // source streams
    const submitStream = Rx.Observable
        .merge(fromClickStream, fromEnterStream)
        .map(e => {
            return  { 
                time: new Date().getTime(),
                msg:  input.value,
                user: user.value,
                source: "local"
            };
        })
        .do(clearFocusInput)
        .publish();

    const receiveStream =  manager.receiveStream
        .map(data => {
             data.source = "server"; 
             return data; 
        })
        .publish();

    const sourceStream = Rx.Observable.merge(submitStream, receiveStream);

    const windowStream = sourceStream
        .map(x => x.user)
        .distinctUntilChanged()
        .subscribe(newContainer);

    // append to html
    sourceStream.subscribe(appendMessage);

    // send to server
    submitStream.subscribe(manager.sendMessage);

    // ... ?
    submitStream.connect();
    receiveStream.connect();

    // HTML handlers
    function newContainer() {
        var p = document.createElement("p");
        var div = document.createElement("div");

        container = {
            msgs: [],
            div: div,
            text: document.createElement("span"),
            user: document.createElement("span")
        }

        p.appendChild(container.text);
        p.appendChild(container.user);

        div.appendChild(p);

        document.getElementById("msgs").appendChild(div);
    }

    function appendMessage(data) {
        container.msgs.push(data.msg);

        container.text.innerText = container.msgs.join("\n");
        container.user.innerText = data.user;       
        container.div.className = data.source;

        var msgs = document.getElementById("msgs");
        msgs.scrollTop = msgs.scrollHeight;
    }

    // helpers
    function clearFocusInput() {       
        input.value = "";
        input.focus();
    }

    // start up
    setTimeout(function() {
        var namePopup = document.getElementById("namePopup");
        var footer = document.getElementById("footer");

        namePopup.classList.add("active");
        
        document.getElementById("start")
                .addEventListener("click", () => {
                    namePopup.classList.remove("active");
                    footer.classList.add("active");
                });
    }, 0);
}());