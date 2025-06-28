
// Global File Input Manager - Singleton service for direct file input access
class FileInputManager {
  private static instance: FileInputManager;
  private fileInputElement: HTMLInputElement | null = null;
  private onFileChangeCallback: ((file: File) => void) | null = null;

  private constructor() {
    this.createGlobalFileInput();
  }

  static getInstance(): FileInputManager {
    if (!FileInputManager.instance) {
      FileInputManager.instance = new FileInputManager();
    }
    return FileInputManager.instance;
  }

  private createGlobalFileInput() {
    console.log('🎯 Creating global file input element');
    
    // Create the file input element
    this.fileInputElement = document.createElement('input');
    this.fileInputElement.type = 'file';
    this.fileInputElement.accept = 'image/*';
    this.fileInputElement.style.display = 'none';
    this.fileInputElement.id = 'global-file-input';
    
    // Add change event listener
    this.fileInputElement.addEventListener('change', (e) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      
      if (file && this.onFileChangeCallback) {
        console.log('🎯 Global file input change detected:', file.name);
        this.onFileChangeCallback(file);
      }
      
      // Reset the input value to allow selecting the same file again
      target.value = '';
    });
    
    // Append to body
    document.body.appendChild(this.fileInputElement);
  }

  triggerFileInput(): boolean {
    console.log('🎯 FileInputManager: Triggering file input', {
      hasElement: !!this.fileInputElement,
      hasCallback: !!this.onFileChangeCallback
    });
    
    if (!this.fileInputElement) {
      console.log('❌ File input element not available');
      return false;
    }
    
    if (!this.onFileChangeCallback) {
      console.log('❌ File change callback not registered');
      return false;
    }
    
    try {
      this.fileInputElement.click();
      console.log('✅ File input clicked successfully');
      return true;
    } catch (error) {
      console.error('❌ Error clicking file input:', error);
      return false;
    }
  }

  setFileChangeCallback(callback: (file: File) => void) {
    console.log('🎯 FileInputManager: Registering file change callback');
    this.onFileChangeCallback = callback;
  }

  clearFileChangeCallback() {
    console.log('🎯 FileInputManager: Clearing file change callback');
    this.onFileChangeCallback = null;
  }

  destroy() {
    if (this.fileInputElement && document.body.contains(this.fileInputElement)) {
      document.body.removeChild(this.fileInputElement);
    }
    this.fileInputElement = null;
    this.onFileChangeCallback = null;
  }
}

export const fileInputManager = FileInputManager.getInstance();
