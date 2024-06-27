    function resizeTextArea(textarea) {
        const { style, value } = textarea;

        // The 4 corresponds to the 2 2px borders (top and bottom):
        style.height = style.minHeight = 'auto';
        style.minHeight = `${ Math.min(textarea.scrollHeight + 4, parseInt(textarea.style.maxHeight)) }px`;
        style.height = `${ textarea.scrollHeight + 4 }px`;
    }

    const inputContainer = document.querySelector('.input-container');
    const input = document.getElementById('text');

    input.addEventListener('input', () => {
      input.setAttribute('value', input.value);
      resizeTextArea(input);
      if (input.value !== '') {
        inputContainer.classList.add('has-value');
      } else {
        inputContainer.classList.remove('has-value');
      }
    });

    FilePond.registerPlugin(
      FilePondPluginImageExifOrientation,
      FilePondPluginImagePreview,
      FilePondPluginPdfPreview,
      FilePondPluginMediaPreview,
      FilePondPluginGetFile
    );

    FilePond.setOptions({
        server: {
            process: (fieldName, file, metadata, load, error, progress, abort, transfer, options) => {
                // fieldName is the name of the input field
                // file is the actual file object to send
                const formData = new FormData();
                formData.append("type", "upload");
                formData.append("fieldName", fieldName);
                formData.append("file", file);
                formData.append("name", file.name);

                const request = new XMLHttpRequest();
                request.open('POST', 'server.php');

                // Should call the progress method to update the progress to 100% before calling load
                // Setting computable to false switches the loading indicator to infinite mode
                request.upload.onprogress = (e) => {
                    progress(false, e.loaded, e.total);
                };
                
                // Should call the load method when done and pass the returned server file id
                // this server file id is then used later on when reverting or restoring a file
                // so your server knows which file to return without exposing that info to the client
                request.onload = function () {
                    if (request.status >= 200 && request.status < 300) {
                        // the load method accepts either a string (id) or an object
                        load(request.responseText);
                    } else {
                        // Can call the error method if something is wrong, should exit after
                        error('oh no');
                    }
                };

                request.send(formData);

                // Should expose an abort method so the request can be cancelled
                return {
                    abort: () => {
                        // This function is entered if the user has tapped the cancel button
                        request.abort();

                        // Let FilePond know the request has been cancelled
                        abort();
                    },
                };
            },
            revert: (uniqueFileId, load, error) => {
                const formData = new FormData();
                formData.append("type", "revert");
                formData.append("id", uniqueFileId);
                const request = new XMLHttpRequest();
                request.open('POST', 'server.php');

                request.onload = function () {
                    if (request.status >= 200 && request.status < 300) {
                        // the load method accepts either a string (id) or an object
                        load();
                    } else {
                        // Can call the error method if something is wrong, should exit after
                        error('oh my goodness');
                    }
                };

                request.send(formData);
            },
            remove: (source, load, error) => {
                const formData = new FormData();
                formData.append("type", "remove");
                formData.append("path", source);
                const request = new XMLHttpRequest();
                request.open('POST', 'server.php');

                request.onload = function () {
                    if (request.status >= 200 && request.status < 300) {
                        // the load method accepts either a string (id) or an object
                        load();
                    } else {
                        // Can call the error method if something is wrong, should exit after
                        error('oh my goodness');
                    }
                };

                request.send(formData);
            },
            load: (source, load, error, progress, abort, headers) => {
                var myRequest = new Request(source);
                fetch(myRequest).then((res) => {
                    return res.blob();
                }).then(load);
            }
        },
    });

    const inputElement = document.querySelector('input[type="file"]');
    const pond = FilePond.create(inputElement, {
        allowDownloadByUrl: false,
        pdfComponentExtraParams: 'toolbar=0&view=fitW&page=1'  
    });

    function sendText() {
        const formData = new FormData();
        formData.append("type", "updatetext");
        formData.append("text", Base64.encode(document.getElementById('text').value));
        const request = new XMLHttpRequest();
        request.open('POST', 'server.php');
        request.send(formData);
    };

    function updateFiles(newFiles) {
        const currentFiles = pond.getFiles();

        newFiles.forEach((newFile) => {
            const existingFile = currentFiles.find((file) => file.getMetadata('name') === newFile.substring(8) || file['source']['name'] === newFile.substring(8));
            if (!existingFile) {
                pond.addFile(newFile, { type: 'local', metadata: { name: newFile.substring(8) } });
          }
        });

        currentFiles.forEach((file) => {
            if (file.status == 5) {
                const existsInNewFiles = newFiles.some((newFile) => file.getMetadata('name') === newFile.substring(8) || file['source']['name'] === newFile.substring(8));
                if (!existsInNewFiles) {
                  pond.removeFile(file);
                }
            }
        });
    };

    var source = new EventSource("stream.php");
    source.onmessage = function(event) {
        const json = JSON.parse(Base64.decode(event.data));
        document.getElementById('text').value = Base64.decode(json['text']);
        input.dispatchEvent(new Event('input'));
        updateFiles(json['files']);
    };