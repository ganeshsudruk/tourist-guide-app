import { Component, inject, signal } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { HttpClient, provideHttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

interface TouristGuideResponse {
  place: string;
  introduction: string;
  top_attractions: string[];
  famous_foods: string[];
  cultural_highlights: string[];
  travel_tips: string[];
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="app-container">
      <!-- Header -->
      <header class="header">
        <div class="header-content">
          <h1 class="app-title">
            <span class="icon">🌍</span>
            Tourist Guide
          </h1>
          <p class="app-subtitle">Discover amazing places around the world</p>
        </div>
      </header>

      <!-- Main Content -->
      <main class="main-content">
        <div class="container">
          <!-- Search Section -->
          <section class="search-section">
            <div class="search-card">
              <h2 class="search-title">Where would you like to explore?</h2>
              <div class="search-form">
                <div class="input-group">
                  <input
                    type="text"
                    [(ngModel)]="searchQuery"
                    (keyup.enter)="searchPlace()"
                    placeholder="Enter a city, country, or landmark..."
                    class="search-input"
                    [disabled]="isLoading()"
                  />
                  <button
                    (click)="searchPlace()"
                    [disabled]="!searchQuery.trim() || isLoading()"
                    class="search-button"
                  >
                    <span *ngIf="!isLoading()" class="button-content">
                      <span class="search-icon">🔍</span>
                      Explore
                    </span>
                    <span *ngIf="isLoading()" class="button-content">
                      <span class="loading-spinner"></span>
                      Searching...
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </section>

          <!-- Results Section -->
          <section class="results-section" *ngIf="guideData() || error()">
            <!-- Error State -->
            <div *ngIf="error()" class="error-card">
              <div class="error-content">
                <span class="error-icon">⚠️</span>
                <h3>Something went wrong</h3>
                <p>{{ error() }}</p>
                <button (click)="clearError()" class="retry-button">Try Again</button>
              </div>
            </div>

            <!-- Success State -->
            <div *ngIf="guideData()" class="guide-results">
              <div class="place-header">
                <h2 class="place-title">{{ guideData()?.place }}</h2>
              </div>

              <div class="content-grid">
                <!-- Introduction -->
                <div class="content-card introduction-card">
                  <div class="card-header">
                    <span class="card-icon">📖</span>
                    <h3>Introduction</h3>
                  </div>
                  <div class="card-content">
                    <p>{{ guideData()?.introduction }}</p>
                  </div>
                </div>

                <!-- Top Attractions -->
                <div class="content-card attractions-card">
                  <div class="card-header">
                    <span class="card-icon">🏛️</span>
                    <h3>Top Attractions</h3>
                  </div>
                  <div class="card-content">
                    <ul class="attraction-list">
                      <li *ngFor="let attraction of guideData()?.top_attractions" class="attraction-item">
                        <span class="attraction-bullet">•</span>
                        {{ attraction }}
                      </li>
                    </ul>
                  </div>
                </div>

                <!-- Famous Foods -->
                <div class="content-card food-card">
                  <div class="card-header">
                    <span class="card-icon">🍽️</span>
                    <h3>Famous Foods</h3>
                  </div>
                  <div class="card-content">
                    <div class="food-grid">
                      <div *ngFor="let food of guideData()?.famous_foods" class="food-item">
                        <span class="food-icon">🥘</span>
                        {{ food }}
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Cultural Highlights -->
                <div class="content-card culture-card">
                  <div class="card-header">
                    <span class="card-icon">🎭</span>
                    <h3>Cultural Highlights</h3>
                  </div>
                  <div class="card-content">
                    <ul class="culture-list">
                      <li *ngFor="let highlight of guideData()?.cultural_highlights" class="culture-item">
                        <span class="culture-bullet">✨</span>
                        {{ highlight }}
                      </li>
                    </ul>
                  </div>
                </div>

                <!-- Travel Tips -->
                <div class="content-card tips-card">
                  <div class="card-header">
                    <span class="card-icon">💡</span>
                    <h3>Travel Tips</h3>
                  </div>
                  <div class="card-content">
                    <ul class="tips-list">
                      <li *ngFor="let tip of guideData()?.travel_tips" class="tip-item">
                        <span class="tip-icon">👉</span>
                        {{ tip }}
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      <!-- Footer -->
      <footer class="footer">
        <p>&copy; 2025 Tourist Guide. Explore the world with confidence.</p>
      </footer>
    </div>
  `,
  styles: [`
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    .app-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }

    .header {
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      border-bottom: 1px solid rgba(255, 255, 255, 0.2);
      padding: 2rem 0;
      text-align: center;
    }

    .header-content {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 1rem;
    }

    .app-title {
      color: white;
      font-size: 3.5rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 1rem;
    }

    .icon {
      font-size: 4rem;
      filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
    }

    .app-subtitle {
      color: rgba(255, 255, 255, 0.9);
      font-size: 1.2rem;
      font-weight: 300;
    }

    .main-content {
      flex: 1;
      padding: 3rem 0;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 1rem;
    }

    .search-section {
      margin-bottom: 3rem;
    }

    .search-card {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border-radius: 20px;
      padding: 2.5rem;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .search-title {
      text-align: center;
      font-size: 2rem;
      color: #2d3748;
      margin-bottom: 2rem;
      font-weight: 600;
    }

    .input-group {
      display: flex;
      gap: 1rem;
      align-items: stretch;
    }

    .search-input {
      flex: 1;
      padding: 1.2rem 1.5rem;
      border: 2px solid #e2e8f0;
      border-radius: 12px;
      font-size: 1.1rem;
      transition: all 0.3s ease;
      background: white;
    }

    .search-input:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    .search-input:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }

    .search-button {
      padding: 1.2rem 2rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 12px;
      font-size: 1.1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      min-width: 140px;
    }

    .search-button:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
    }

    .search-button:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }

    .button-content {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }

    .loading-spinner {
      width: 20px;
      height: 20px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top: 2px solid white;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .error-card {
      background: rgba(254, 226, 226, 0.95);
      border: 1px solid #f87171;
      border-radius: 16px;
      padding: 2rem;
      text-align: center;
      margin-bottom: 2rem;
    }

    .error-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
    }

    .error-icon {
      font-size: 3rem;
    }

    .error-content h3 {
      color: #dc2626;
      font-size: 1.5rem;
    }

    .error-content p {
      color: #991b1b;
      max-width: 400px;
    }

    .retry-button {
      background: #dc2626;
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      cursor: pointer;
      transition: background 0.3s ease;
    }

    .retry-button:hover {
      background: #b91c1c;
    }

    .place-header {
      text-align: center;
      margin-bottom: 3rem;
    }

    .place-title {
      font-size: 3rem;
      color: white;
      font-weight: 700;
      text-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
    }

    .content-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: 2rem;
      margin-bottom: 2rem;
    }

    .content-card {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      transition: transform 0.3s ease;
    }

    .content-card:hover {
      transform: translateY(-5px);
    }

    .card-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 1.5rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .card-icon {
      font-size: 1.5rem;
    }

    .card-header h3 {
      font-size: 1.25rem;
      font-weight: 600;
    }

    .card-content {
      padding: 1.5rem;
    }

    .introduction-card .card-content p {
      font-size: 1.1rem;
      line-height: 1.6;
      color: #4a5568;
    }

    .attraction-list, .culture-list, .tips-list {
      list-style: none;
    }

    .attraction-item, .culture-item, .tip-item {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      margin-bottom: 1rem;
      font-size: 1rem;
      line-height: 1.5;
      color: #4a5568;
    }

    .attraction-bullet {
      color: #667eea;
      font-weight: bold;
      font-size: 1.2rem;
    }

    .culture-bullet, .tip-icon {
      font-size: 1rem;
      flex-shrink: 0;
    }

    .food-grid {
      display: grid;
      gap: 1rem;
    }

    .food-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem;
      background: #f7fafc;
      border-radius: 8px;
      border-left: 4px solid #667eea;
      font-size: 1rem;
      color: #4a5568;
    }

    .food-icon {
      font-size: 1.2rem;
    }

    .footer {
      background: rgba(0, 0, 0, 0.1);
      backdrop-filter: blur(10px);
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      padding: 2rem 0;
      text-align: center;
      color: rgba(255, 255, 255, 0.8);
    }

    @media (max-width: 768px) {
      .app-title {
        font-size: 2.5rem;
        flex-direction: column;
        gap: 0.5rem;
      }

      .icon {
        font-size: 3rem;
      }

      .search-card {
        padding: 1.5rem;
      }

      .input-group {
        flex-direction: column;
      }

      .search-button {
        min-width: auto;
      }

      .content-grid {
        grid-template-columns: 1fr;
        gap: 1.5rem;
      }

      .place-title {
        font-size: 2rem;
      }
    }
  `]
})
export class App {
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
    this.http.post<TouristGuideResponse>('http://localhost:8000/tourist-guide', requestBody)
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

bootstrapApplication(App, {
  providers: [provideHttpClient()]
});