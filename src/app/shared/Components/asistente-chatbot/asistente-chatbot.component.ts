import {
  Component,
  OnInit,
  HostListener,
  Inject,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-asistente-chatbot',
  standalone: false,
  templateUrl: './asistente-chatbot.component.html',
  styleUrl: './asistente-chatbot.component.css',
})
export class AsistenteChatbotComponent implements OnInit {
  isOpen = false;
  userInput = '';
  messages: {
    text: string;
    sender: 'user' | 'assistant';
    loading?: boolean;
  }[] = [];
  showSuggestedQuestions = false;
  isLoading = false;

  private apiUrl = 'http://localhost:3000/chat/message';

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private http: HttpClient
  ) {}

  ngOnInit(): void {}

  toggleChat(): void {
    this.isOpen = !this.isOpen;
  }

  sendMessage(): void {
    const input = this.userInput.trim();
    if (!input || this.isLoading) return;


    this.addUserMessage(input);
    this.userInput = '';


    this.isLoading = true;
    this.addLoadingMessage();


    this.http
      .post<{ response: string }>(this.apiUrl, { message: input })
      .subscribe({
        next: (response) => {
          this.removeLoadingMessage();
          this.addAssistantMessage(response.response);
          this.isLoading = false;
        },
        error: (error) => {
          this.removeLoadingMessage();
          console.error('Error:', error);
          this.addAssistantMessage(
            'Disculpa, ocurrió un error. Por favor intenta de nuevo.'
          );
          this.isLoading = false;
        },
      });
  }

  private addUserMessage(text: string): void {
    this.messages.push({ text, sender: 'user' });
    this.scrollToBottom();
  }

  private addAssistantMessage(text: string): void {
    this.messages.push({ text, sender: 'assistant' });
    this.scrollToBottom();
  }

  private addLoadingMessage(): void {
    this.messages.push({ text: '', sender: 'assistant', loading: true });
    this.scrollToBottom();
  }

  private removeLoadingMessage(): void {
    const index = this.messages.findIndex((m) => m.loading);
    if (index !== -1) this.messages.splice(index, 1);
  }

  private scrollToBottom(): void {
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        const container = document.getElementById('chat-messages');
        if (container) {
          container.scrollTop = container.scrollHeight;
        }
      }, 0);
    }
  }

  @HostListener('document:keydown.enter', ['$event'])
  handleEnterKey(event: KeyboardEvent): void {
    if (this.isOpen && !this.isLoading) {
      event.preventDefault();
      this.sendMessage();
    }
  }
}
