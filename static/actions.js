window.onload = function () {
    const socket = io();
    let socketid = undefined
    socket.connect("https://localhost:5000");
    let progressBar = document.getElementById("progressBar");

    socket.on("connect", function () {
        console.log("Connected!");
        socketid = socket.id;
        console.log("ID: " + socketid);
    })
    socket.on("update progress", function (percent) {
        console.log("Got perecent: " + percent);
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
                    document.getElementById('progress-area').style.display = "flex";
                    document.getElementById('uploadingText').className = "text-info";
                    document.getElementById('uploadingText').innerHTML = "Đang tải lên: " + file.name + ". Vui lòng chờ trong giây lát và không tắt cửa sổ.";

                    fetch("/progress/" + socketid, {
                        method: "POST",
                        body: new FormData(mainForm)
                    }).then(response => {
                        setTimeout(function () {
                            progressBar.style.width = "0%";
                            document.getElementById('uploadButton').style.display = "inline";
                            document.getElementById('progress-area').style.display = "none";
                            document.getElementById('uploadingText').className = "text-success";
                            document.getElementById('uploadingText').innerHTML = `${file.name} đã tải lên thành công!`;
                            mainForm.reset()
                        }, 2000);
                    });
                } else {
                    displayWarning("Tên video không được dài quá 80 ký tự. Xin hãy đổi lại tên video!")
                }

            } else {
                displayWarning("File bạn chọn không phải video. Xin hãy chọn lại!")
            }

        } else {
            displayWarning("Bạn chưa chọn video để tải lên!")
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



