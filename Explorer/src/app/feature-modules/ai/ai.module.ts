import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AiChatComponent } from './ai-chat/ai-chat.component';

@NgModule({
  declarations: [AiChatComponent],
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule
  ],
  exports: [AiChatComponent]  // ovo omogućava korišćenje <app-ai-chat> izvan modula
})
export class AiModule {}
