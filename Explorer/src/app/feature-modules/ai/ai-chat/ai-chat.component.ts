import { Component, HostListener } from '@angular/core';
import { AiChatService } from '../ai-chat.service';

// Deklaracija za Web Speech API
declare var webkitSpeechRecognition: any;

@Component({
  selector: 'app-ai-chat',
  templateUrl: './ai-chat.component.html',
  styleUrls: ['./ai-chat.component.css']
})
export class AiChatComponent {

  userMessage = '';
  loading = false;
  messages: { from: 'user' | 'bot'; text: string }[] = [];
  chatOpen = false;

  floatTop: number = window.innerHeight - 100;
  floatLeft: number = window.innerWidth - 100;
  dragging = false;
  wasDragged = false;
  dragStart = { x: 0, y: 0 };
  dragOffset = { x: 0, y: 0 };

  // ← VOICE FUNKCIONALNOST
  recognition: any;
  isListening = false;
  speechSupported = false;
  lastInputWasVoice = false;

  constructor(private aiChatService: AiChatService) {
    this.initSpeechRecognition();
  }

  // ← INICIJALIZACIJA SPEECH-TO-TEXT
  initSpeechRecognition() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      this.speechSupported = true;
      this.recognition = new (window as any).webkitSpeechRecognition() || new (window as any).SpeechRecognition();
      this.recognition.lang = 'sr-RS'; // Srpski jezik
      this.recognition.continuous = false;
      this.recognition.interimResults = false;

      this.recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        this.userMessage = transcript;
        this.isListening = false;
        this.lastInputWasVoice = true;
        setTimeout(()=>this.send(),300);
      };

      this.recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        this.isListening = false;
      };

      this.recognition.onend = () => {
        this.isListening = false;
      };
    }
  }

  // ← POKRENI SNIMANJE GLASA
  startVoiceInput() {
    if (!this.speechSupported) {
      alert('Vaš browser ne podržava glasovni unos. Koristite Chrome ili Edge.');
      return;
    }
    this.isListening = true;
    this.recognition.start();
  }

  // ← ZAUSTAVI SNIMANJE
  stopVoiceInput() {
    if (this.recognition) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  // ← TEXT-TO-SPEECH (AI odgovor zvukom)
  speak(text: string) {
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Podešavanja za prirodniji zvuk
    utterance.lang = 'sr-RS';
    utterance.rate = 0.95;  // Sporije (0.1 - 10, default 1)
    utterance.pitch = 1.1;  // Viši ton (0 - 2, default 1)
    utterance.volume = 1;   // Glasnoća (0 - 1)
    
    // Probaj da nađeš najbolji glas
    const voices = window.speechSynthesis.getVoices();
    const serbianVoice = voices.find(v => v.lang.startsWith('sr')) 
                      || voices.find(v => v.lang.startsWith('hr')) // Croatian kao fallback
                      || voices.find(v => v.name.includes('Google'));
    
    if (serbianVoice) {
      utterance.voice = serbianVoice;
    }
    
    window.speechSynthesis.speak(utterance);
  }
}

  toggleChat() {
    if (this.wasDragged) {
      this.wasDragged = false;
      return;
    }
    this.chatOpen = !this.chatOpen;
  }

  startDrag(event: MouseEvent | TouchEvent) {
    if (window.innerWidth <= 768) return;
    this.dragging = true;
    this.wasDragged = false;

    let clientX = 0, clientY = 0;
    if (event instanceof MouseEvent) {
      clientX = event.clientX;
      clientY = event.clientY;
    } else if (event instanceof TouchEvent && event.touches.length) {
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
    }

    this.dragStart.x = clientX;
    this.dragStart.y = clientY;
    this.dragOffset.x = clientX - this.floatLeft;
    this.dragOffset.y = clientY - this.floatTop;
    event.preventDefault();
  }

  @HostListener('document:mousemove', ['$event'])
  @HostListener('document:touchmove', ['$event'])
  onDrag(event: MouseEvent | TouchEvent) {
    if (!this.dragging || window.innerWidth <= 768) return;

    let clientX = 0, clientY = 0;
    if (event instanceof MouseEvent) {
      clientX = event.clientX;
      clientY = event.clientY;
    } else if (event instanceof TouchEvent && event.touches.length) {
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
    }

    const dragDistance = Math.sqrt(
      Math.pow(clientX - this.dragStart.x, 2) + 
      Math.pow(clientY - this.dragStart.y, 2)
    );

    if (dragDistance > 5) {
      this.wasDragged = true;
    }

    this.floatLeft = clientX - this.dragOffset.x;
    this.floatTop = clientY - this.dragOffset.y;

    const maxLeft = window.innerWidth - 100;
    const maxTop = window.innerHeight - 100;
    this.floatLeft = Math.min(Math.max(0, this.floatLeft), maxLeft);
    this.floatTop = Math.min(Math.max(0, this.floatTop), maxTop);

    event.preventDefault();
  }

  @HostListener('document:mouseup')
  @HostListener('document:touchend')
  stopDrag() {
    this.dragging = false;
  }

  onInputChange(){
    this.lastInputWasVoice = false;
  }

  send(): void {
    if (!this.userMessage.trim() || this.loading) return;

    const message = this.userMessage;
    const wasVoiceInput = this.lastInputWasVoice;
    this.userMessage = '';
    this.lastInputWasVoice = false;

    this.messages.push({ from: 'user', text: message });
    this.loading = true;

    this.aiChatService.sendMessage(message).subscribe({
      next: async res => {
        this.messages.push({ from: 'bot', text: res.reply });
        
        // Umesto Web Speech API:
        if (wasVoiceInput) {
          await this.aiChatService.speakWithElevenLabs(res.reply);
        }
        this.loading = false;
      },
      error: err => {
        console.error('Error:', err);
        this.loading = false;
      }
  });
 }

  shouldShowSendButton():boolean{
    return this.userMessage.trim().length > 0 || this.isListening;
  }

}