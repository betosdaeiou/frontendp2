import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-dashboard-kpi',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-kpi.html',
  styleUrls: ['./dashboard-kpi.css']
})
export class DashboardKpiComponent implements OnInit {
  private http = inject(HttpClient);
  
  kpis: any = null;
  loading = true;

  ngOnInit(): void {
    this.loadKpis();
  }

  loadKpis(): void {
    this.loading = true;
    this.http.get<any>(`${environment.apiUrl}/analytics/kpis`).subscribe({
      next: (data) => {
        this.kpis = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading KPIs', err);
        this.loading = false;
      }
    });
  }
}
