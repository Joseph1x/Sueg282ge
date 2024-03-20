document.getElementById('uploadForm').addEventListener('submit', function(event) {
    event.preventDefault();
    
    var formData = new FormData(this);
    
    fetch('/upload', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            document.getElementById('videoPlayer').setAttribute('src', data.videoUrl);
            document.getElementById('videoPlayer').load();
        } else {
            alert('Erro ao fazer upload do vídeo.');
        }
    })
    .catch(error => {
        console.error('Erro:', error);
        alert('Erro ao fazer upload do vídeo.');
    });
});
