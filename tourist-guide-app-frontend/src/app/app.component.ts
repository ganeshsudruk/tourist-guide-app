import { Component, inject, signal } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { HttpClient, HttpClientModule, provideHttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

// Define structured interface
interface Attraction {
  title: string;
  photo: string;
  info: string;
}

interface TouristGuideResponse {
  place: string;
  introduction: string;
  top_attractions: Attraction[];
  famous_foods: string[];
  cultural_highlights: string[];
  travel_tips: string[];
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  private http = inject(HttpClient);

  searchQuery = '';
  isLoading = signal(false);
  guideData = signal<TouristGuideResponse | null>(null);
  error = signal<string>('');

  searchPlace() {
    if (!this.searchQuery.trim() || this.isLoading()) return;
    this.isLoading.set(true);
    this.error.set('');
    this.guideData.set(null);

    const requestBody = { place: this.searchQuery.trim() };

    // Update this URL to match your FastAPI backend URL
    this.http.post<TouristGuideResponse>('https://tourist-guide-app-production.up.railway.app/tourist-guide', requestBody)
      .subscribe({
        next: (data) => {
          this.guideData.set(data);
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('Error:', err);
          this.error.set('Unable to fetch tourist guide information. Please make sure the backend server is running on http://localhost:8000');
          this.isLoading.set(false);
        }
      });
  }

  clearError() {
    this.error.set('');
  }
}

bootstrapApplication(AppComponent, {
  providers: [provideHttpClient()]
});
