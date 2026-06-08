import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TenantService, PlanSaaS } from '../../../core/services/tenant.service';

@Component({
  selector: 'app-planes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './planes.html',
  styleUrls: ['./planes.css']
})
export class PlanesComponent implements OnInit {
  private tenantService = inject(TenantService);
  
  planes: PlanSaaS[] = [];
  loading = true;

  ngOnInit(): void {
    this.loadPlanes();
  }

  loadPlanes(): void {
    this.loading = true;
    this.tenantService.getPlanes().subscribe({
      next: (data) => {
        this.planes = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading planes', err);
        this.loading = false;
      }
    });
  }
}
