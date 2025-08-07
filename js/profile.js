// Profile picture upload functionality

class ProfileUploader {
    constructor() {
        this.maxFileSize = 5 * 1024 * 1024; // 5MB
        this.allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
        this.currentFile = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        const uploadArea = document.getElementById('uploadArea');
        const fileInput = document.getElementById('fileInput');
        const removeBtn = document.getElementById('removeImage');
        const uploadBtn = document.getElementById('uploadBtn');
        const cancelBtn = document.getElementById('cancelBtn');

        if (uploadArea) {
            // Click to upload
            uploadArea.addEventListener('click', () => {
                fileInput.click();
            });

            // Drag and drop events
            uploadArea.addEventListener('dragover', this.handleDragOver.bind(this));
            uploadArea.addEventListener('dragleave', this.handleDragLeave.bind(this));
            uploadArea.addEventListener('drop', this.handleDrop.bind(this));
        }

        if (fileInput) {
            fileInput.addEventListener('change', this.handleFileSelect.bind(this));
        }

        if (removeBtn) {
            removeBtn.addEventListener('click', this.removeImage.bind(this));
        }

        if (uploadBtn) {
            uploadBtn.addEventListener('click', this.uploadImage.bind(this));
        }

        if (cancelBtn) {
            cancelBtn.addEventListener('click', this.cancelUpload.bind(this));
        }

        // Prevent default drag behaviors on the document
        document.addEventListener('dragover', (e) => e.preventDefault());
        document.addEventListener('drop', (e) => e.preventDefault());
    }

    handleDragOver(e) {
        e.preventDefault();
        e.stopPropagation();
        const uploadArea = document.getElementById('uploadArea');
        uploadArea.classList.add('dragover');
    }

    handleDragLeave(e) {
        e.preventDefault();
        e.stopPropagation();
        const uploadArea = document.getElementById('uploadArea');
        uploadArea.classList.remove('dragover');
    }

    handleDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const uploadArea = document.getElementById('uploadArea');
        uploadArea.classList.remove('dragover');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            this.processFile(files[0]);
        }
    }

    handleFileSelect(e) {
        const file = e.target.files[0];
        if (file) {
            this.processFile(file);
        }
    }

    processFile(file) {
        // Validate file
        const validation = this.validateFile(file);
        if (!validation.isValid) {
            this.showStatus(validation.message, 'error');
            return;
        }

        this.currentFile = file;
        this.previewImage(file);
    }

    validateFile(file) {
        // Check file type
        if (!this.allowedTypes.includes(file.type)) {
            return {
                isValid: false,
                message: '지원되지 않는 파일 형식입니다. JPG, PNG, GIF 파일만 업로드 가능합니다.'
            };
        }

        // Check file size
        if (file.size > this.maxFileSize) {
            return {
                isValid: false,
                message: `파일 크기가 너무 큽니다. 최대 ${this.formatFileSize(this.maxFileSize)}까지 업로드 가능합니다.`
            };
        }

        return { isValid: true };
    }

    previewImage(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const previewImage = document.getElementById('previewImage');
            const uploadArea = document.getElementById('uploadArea');
            const previewContainer = document.getElementById('previewContainer');

            if (previewImage && uploadArea && previewContainer) {
                previewImage.src = e.target.result;
                uploadArea.style.display = 'none';
                previewContainer.style.display = 'block';
                
                // Add fade-in animation
                previewContainer.classList.add('fade-in');
            }
        };
        reader.readAsDataURL(file);
    }

    removeImage() {
        const uploadArea = document.getElementById('uploadArea');
        const previewContainer = document.getElementById('previewContainer');
        const fileInput = document.getElementById('fileInput');
        const previewImage = document.getElementById('previewImage');

        // Reset everything
        this.currentFile = null;
        if (fileInput) fileInput.value = '';
        if (previewImage) previewImage.src = '';
        
        if (uploadArea) uploadArea.style.display = 'block';
        if (previewContainer) previewContainer.style.display = 'none';
        
        this.clearStatus();
    }

    async uploadImage() {
        if (!this.currentFile) {
            this.showStatus('업로드할 파일이 없습니다.', 'error');
            return;
        }

        this.showStatus('파일을 업로드 중입니다...', 'loading');
        
        try {
            // Simulate upload process (in real app, this would be an API call)
            await this.simulateUpload();
            
            // Store in localStorage for demo purposes
            const reader = new FileReader();
            reader.onload = (e) => {
                localStorage.setItem('profileImage', e.target.result);
                localStorage.setItem('profileImageName', this.currentFile.name);
                localStorage.setItem('profileImageSize', this.currentFile.size);
                localStorage.setItem('profileImageType', this.currentFile.type);
                
                this.showStatus('프로필 사진이 성공적으로 업로드되었습니다!', 'success');
                
                // Update UI to show uploaded image
                setTimeout(() => {
                    this.showUploadedImage();
                }, 1000);
            };
            reader.readAsDataURL(this.currentFile);
            
        } catch (error) {
            this.showStatus('업로드 중 오류가 발생했습니다. 다시 시도해주세요.', 'error');
            console.error('Upload error:', error);
        }
    }

    simulateUpload() {
        // Simulate network delay
        return new Promise((resolve) => {
            setTimeout(resolve, 2000);
        });
    }

    showUploadedImage() {
        const profileUploadContent = document.querySelector('.profile-upload-content');
        const storedImage = localStorage.getItem('profileImage');
        const storedName = localStorage.getItem('profileImageName');
        const storedSize = localStorage.getItem('profileImageSize');
        
        if (storedImage && profileUploadContent) {
            // Create uploaded image display
            const uploadedSection = document.createElement('div');
            uploadedSection.className = 'uploaded-image-section';
            uploadedSection.innerHTML = `
                <div class="uploaded-image-container">
                    <h3>현재 프로필 사진</h3>
                    <div class="uploaded-image">
                        <img src="${storedImage}" alt="Profile Picture" />
                        <div class="image-info">
                            <p><strong>파일명:</strong> ${storedName}</p>
                            <p><strong>크기:</strong> ${this.formatFileSize(parseInt(storedSize))}</p>
                        </div>
                    </div>
                    <div class="image-actions">
                        <button class="btn btn-outline" id="changeImageBtn">
                            <i class="fas fa-edit"></i>
                            사진 변경
                        </button>
                        <button class="btn btn-danger" id="deleteImageBtn">
                            <i class="fas fa-trash"></i>
                            사진 삭제
                        </button>
                    </div>
                </div>
            `;
            
            // Replace upload section with uploaded image
            const uploadContainer = document.querySelector('.upload-container');
            if (uploadContainer) {
                uploadContainer.style.display = 'none';
                profileUploadContent.appendChild(uploadedSection);
                
                // Add event listeners for new buttons
                const changeBtn = document.getElementById('changeImageBtn');
                const deleteBtn = document.getElementById('deleteImageBtn');
                
                if (changeBtn) {
                    changeBtn.addEventListener('click', () => {
                        uploadContainer.style.display = 'block';
                        uploadedSection.remove();
                        this.removeImage();
                    });
                }
                
                if (deleteBtn) {
                    deleteBtn.addEventListener('click', () => {
                        this.deleteProfileImage();
                        uploadContainer.style.display = 'block';
                        uploadedSection.remove();
                        this.removeImage();
                    });
                }
            }
        }
    }

    deleteProfileImage() {
        localStorage.removeItem('profileImage');
        localStorage.removeItem('profileImageName');
        localStorage.removeItem('profileImageSize');
        localStorage.removeItem('profileImageType');
        this.showStatus('프로필 사진이 삭제되었습니다.', 'success');
    }

    cancelUpload() {
        // Hide profile section
        if (window.investApp) {
            window.investApp.hideProfileSection();
        }
        this.removeImage();
    }

    showStatus(message, type) {
        const statusDiv = document.getElementById('uploadStatus');
        if (statusDiv) {
            statusDiv.textContent = message;
            statusDiv.className = `upload-status ${type}`;
            
            if (type === 'loading') {
                const spinner = document.createElement('div');
                spinner.className = 'spinner';
                statusDiv.appendChild(spinner);
            }
        }
    }

    clearStatus() {
        const statusDiv = document.getElementById('uploadStatus');
        if (statusDiv) {
            statusDiv.textContent = '';
            statusDiv.className = 'upload-status';
        }
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Check for existing profile image on page load
    checkExistingImage() {
        const storedImage = localStorage.getItem('profileImage');
        if (storedImage) {
            this.showUploadedImage();
        }
    }
}

// CSS for uploaded image display
const uploadStyles = document.createElement('style');
uploadStyles.textContent = `
    .uploaded-image-section {
        margin-top: 2rem;
        padding: 2rem;
        background: #f8f9ff;
        border-radius: 16px;
        border: 2px solid #667eea;
    }
    
    .uploaded-image-container h3 {
        margin-bottom: 1.5rem;
        color: #333;
        text-align: center;
    }
    
    .uploaded-image {
        display: flex;
        align-items: center;
        gap: 2rem;
        margin-bottom: 2rem;
        padding: 1rem;
        background: white;
        border-radius: 12px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    }
    
    .uploaded-image img {
        width: 120px;
        height: 120px;
        object-fit: cover;
        border-radius: 50%;
        border: 3px solid #667eea;
    }
    
    .image-info p {
        margin: 0.5rem 0;
        color: #666;
    }
    
    .image-actions {
        display: flex;
        gap: 1rem;
        justify-content: center;
    }
    
    @media (max-width: 768px) {
        .uploaded-image {
            flex-direction: column;
            text-align: center;
            gap: 1rem;
        }
        
        .image-actions {
            flex-direction: column;
            align-items: center;
        }
    }
`;
document.head.appendChild(uploadStyles);

// Initialize profile uploader when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.profileUploader = new ProfileUploader();
    
    // Check for existing image after a short delay
    setTimeout(() => {
        window.profileUploader.checkExistingImage();
    }, 500);
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProfileUploader;
}