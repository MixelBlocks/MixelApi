var loads = true;

window.addEventListener('load', function theseFunc() {
    fetch('https://mcapi.us/server/status?ip=proxy.mixelblocks.de&port=25577')
        .then((res) => res.json())
        .then((data) => {
            document.querySelector('.players').innerHTML = data.players.now + '/' + data.players.max;
            loads = false;
        });

    document.querySelector('.updateServer').addEventListener('click', function copyIP() {
        if (!loads) {
            loads = true;
            document.querySelector('.players').innerHTML = 'lädt...';

            fetch('https://mcapi.us/server/status?ip=proxy.mixelblocks.de&port=25577')
                .then((res) => res.json())
                .then((data) => {
                    setTimeout(() => {
                        document.querySelector('.players').innerHTML = data.players.now + '/' + data.players.max;
                        loads = false;
                    }, 650);
                });
        }
    });
    document.querySelector('.copyIP').addEventListener('click', function copyIP() {
        var clipboard = new ClipboardJS('.copyIP');
        alertify.success('SERVER IP KOPIERT!');
    });
});
