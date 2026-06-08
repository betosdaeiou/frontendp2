import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TenantService, Tenant } from '../../../core/services/tenant.service';

@Component({
  selector: 'app-tenants-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tenants-list.html',
  styleUrls: ['./tenants-list.css']
})
export class TenantsList implements OnInit {
  private tenantService = inject(TenantService);
  
  tenants: Tenant[] = [];
  loading = true;

  ngOnInit(): void {
    this.loadTenants();
  }

  loadTenants(): void {
    this.loading = true;
    this.tenantService.getTenants().subscribe({
      next: (data) => {
        this.tenants = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading tenants', err);
        this.loading = false;
      }
    });
  }
}
