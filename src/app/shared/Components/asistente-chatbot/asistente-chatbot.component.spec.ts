import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AsistenteChatbotComponent } from './asistente-chatbot.component';

describe('AsistenteQAComponent', () => {
  let component: AsistenteChatbotComponent;
  let fixture: ComponentFixture<AsistenteChatbotComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AsistenteChatbotComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AsistenteChatbotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
