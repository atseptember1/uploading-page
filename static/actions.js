window.onload = function () {
    const socket = io();
    let socketid = undefined
    socket.connect("https://localhost:5000");
    let progressBar = document.getElementById("progressBar");
    let showProgress = false;

    socket.on("connect", function () {
        console.log("Connected!");
        socketid = socket.id;
        console.log("ID: " + socketid);
    })
    socket.on("update progress", function (percent) {
        console.log("Got percent: " + percent);
        progressBar.style.width = percent + "%";
        progressBar.innerHTML = percent + "%";
    })

    let mainForm = document.getElementById("uploadForm");
    const fileInput = document.getElementById('fileInput');

    mainForm.onsubmit = function (event) {
        event.preventDefault();

        const file = fileInput.files[0];

        console.log(file)

        if (file) {

            const hasValidLength = file.name.length >= 80 ? false : true
            const isAllowedFile = allowedFile(file.name)

            if (isAllowedFile) {
                if (hasValidLength) {
                    document.getElementById('uploadButton').style.display = "none";
                    // document.getElementById('progress-area').style.display = "flex";
                    document.getElementById('uploadingText').className = "text-info";
                    document.getElementById('uploadingText').innerHTML = "Uploading: " + file.name + ". Please wait and DO NOT close this browser window.";
                    document.getElementById('spinner').style.display = "block";

                    fetch("/progress/" + socketid, {
                        method: "POST",
                        body: new FormData(mainForm)
                    }).then(response => {
                        setTimeout(function () {
                            progressBar.style.width = "0%";
                            document.getElementById('uploadButton').style.display = "inline";
                            document.getElementById('spinner').style.display = "none";
                            // document.getElementById('progress-area').style.display = "none";
                            document.getElementById('uploadingText').className = "text-success";
                            document.getElementById('uploadingText').innerHTML = `${file.name} has been successfully uploaded!`;
                            mainForm.reset()
                        }, 2000);
                    });
                } else {
                    displayWarning("The video name exceeds 80 characters. Please rename video and upload again!")
                }

            } else {
                displayWarning("The uploading file must be a video file!")
            }

        } else {
            displayWarning("Please select a video for uploading!")
        }
    }
}

const displayWarning = (message) => {
    document.getElementById('uploadingText').className = "text-danger";
    document.getElementById('uploadingText').innerHTML = message
}

const allowedFile = (filename) => {
    const ALLOWED_EXTENSIONS = new Set(['mp4', 'mkv', 'mov', 'avi', 'flv', 'webm']);
    var result = false
    if (filename.includes(".")) {
        const extension = filename.split('.').pop().toLowerCase();
        result = ALLOWED_EXTENSIONS.has(extension);
    }
    return result
}



