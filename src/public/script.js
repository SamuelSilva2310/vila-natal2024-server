document.addEventListener('DOMContentLoaded', () => {
  const imageInput = document.getElementById('image');
  const preview = document.getElementById('preview');
  const uploadForm = document.getElementById('uploadForm');
  const alertContainer = document.getElementById('alertContainer');

  // Update preview on file selection
  imageInput.addEventListener('change', () => {
    const file = imageInput.files[0];
    preview.innerHTML = ''; // Clear previous content

    if (file) {
      const img = document.createElement('img');
      img.src = URL.createObjectURL(file); // Create a preview URL
      preview.appendChild(img);
    } else {
      preview.innerHTML = '<p class="text-muted">No image selected.</p>';
    }
  });

  // Handle form submission
  uploadForm.addEventListener('submit', async (e) => {
    e.preventDefault(); // Prevent default form submission

    // Clear previous alerts
    alertContainer.innerHTML = '';

    const formData = new FormData(uploadForm);

    try {
      const response = await fetch('/api/image/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        // Show success alert
        showAlert('Image uploaded successfully!', 'success');
        uploadForm.reset(); // Reset the form
        preview.innerHTML = '<p class="text-muted">Nenhuma imagem selecionada</p>';
      } else {
        // Show error alert
        showAlert('Failed to upload image. Please try again.', 'danger');
      }
    } catch (error) {
      showAlert('An error occurred. Please try again.', 'danger');
    }
  });

  // Function to display alerts
  function showAlert(message, type) {
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.role = 'alert';
    alert.textContent = message;
    alertContainer.appendChild(alert);

    // Auto-dismiss after 3 seconds
    setTimeout(() => alert.remove(), 3000);
  }
});
