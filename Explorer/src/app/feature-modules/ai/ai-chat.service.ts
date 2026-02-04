import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../env/environment'; // ✅ env umesto environments

@Injectable({
  providedIn: 'root'
})
export class AiChatService {

  private readonly apiUrl = `${environment.apiHost}ai/chat`;
  private readonly ttsUrl = `${environment.apiHost}ai/tts`;

  constructor(private http: HttpClient) {}

  sendMessage(message: string): Observable<{ reply: string }> {
    return this.http.post<{ reply: string }>(this.apiUrl, { message });
  }

  async speakWithElevenLabs(text: string): Promise<void> {
    try {
      const response = await fetch(this.ttsUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });

      if (!response.ok) {
        console.error('TTS failed');
        return;
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      await audio.play();
    } catch (error) {
      console.error('ElevenLabs error:', error);
    }
  }
}