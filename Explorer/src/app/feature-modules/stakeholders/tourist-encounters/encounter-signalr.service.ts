import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import * as signalR from '@microsoft/signalr';
import { TokenStorage } from 'src/app/infrastructure/auth/jwt/token.service';
import { environment } from 'src/env/environment';

export interface EncounterCompletedEvent {
  encounterId: number;
  encounterName: string;
  xpEarned: number;
  completionType: 'Manual' | 'AutoHiddenLocation' | 'AutoSocial';
}

@Injectable({
  providedIn: 'root'
})
export class EncounterSignalRService {
  
  // Observable for encounter completion events
  private encounterCompletedSubject = new Subject<EncounterCompletedEvent>();
  public encounterCompleted$ = this.encounterCompletedSubject.asObservable();
  
  private hubConnection!: signalR.HubConnection;

  constructor(private tokenStorage: TokenStorage) {}

  startConnection(): void {
    // Prevent duplicate connections
    if (this.hubConnection && this.hubConnection.state === signalR.HubConnectionState.Connected) {
      console.log('⚠️ SignalR already connected for encounters');
      return;
    }

    const apiBase = environment.apiHost.replace(/\/api\/?$/i, '').replace(/\/$/, '');
    const hubUrl = `${apiBase}/hubs/encounters`; // Backend hub URL
    console.log('🎯 Encounter SignalR hub URL:', hubUrl);

    const token = this.tokenStorage.getAccessToken();
    if (!token) {
      console.warn('⚠️ No access token available — not starting Encounter SignalR connection');
      return;
    }

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl, {
        accessTokenFactory: () => token || ''
      })
      .withAutomaticReconnect()
      .build();

    this.hubConnection.start()
      .then(() => console.log('✅ Encounter SignalR connected'))
      .catch(err => console.error('❌ Encounter SignalR error:', err));

    // Listen for encounter completion events from backend
    this.hubConnection.on('EncounterCompleted', (event: EncounterCompletedEvent) => {
      console.log('🎉 Encounter completed event received:', event);
      this.encounterCompletedSubject.next(event);
    });
  }

  stopConnection(): void {
    if (this.hubConnection) {
      this.hubConnection.stop()
        .then(() => console.log('🔌 Encounter SignalR disconnected'))
        .catch(err => console.error('❌ Error stopping Encounter SignalR:', err));
    }
  }
}
