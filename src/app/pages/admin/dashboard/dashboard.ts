import { isPlatformBrowser } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { MeterGroupModule } from 'primeng/metergroup';
import { OrderService } from '../../../services/orders/order.service';
import { SupportService } from '../../../services/support/support.service';

interface DashboardProduct {
  rank: number;
  name: string;
  sold: number;
  image: string;
  accent: string;
  short: string;
  meterValue: number;
  barColor: string;
}

@Component({
  selector: 'app-dashboard',
  imports: [ChartModule, MeterGroupModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  reportsChartData: any;
  salesChartData: any;
  chartOptions: any;

  topProducts: DashboardProduct[] = [];

  private readonly orderService = inject(OrderService);
  private readonly supportService = inject(SupportService);
  private readonly platformId = inject(PLATFORM_ID);

  constructor(private cd: ChangeDetectorRef) { }

  ngOnInit() {
    this.loadDashboardData();
  }

  private loadDashboardData() {
    const salesRequest = this.orderService.getDailySalesCurrentMonth();
    const topProductsRequest = this.orderService.getTopSellingProducts();
    const reportsRequest = this.supportService.getDailyReportsCurrentMonth();

    this.initCharts();

    const fallbackTopProducts = this.getFallbackTopProducts();
    const fallbackSales = this.getFallbackDailySales();
    const fallbackReports = this.getFallbackDailyReports();

    Promise.all([
      salesRequest.toPromise().catch(() => fallbackSales),
      topProductsRequest.toPromise().catch(() => fallbackTopProducts),
      reportsRequest.toPromise().catch(() => fallbackReports),
    ]).then(([sales, topSelling, reports]) => {
      this.topProducts = this.normalizeTopProducts(topSelling as any);
      this.updateSalesChart(sales as any);
      this.updateReportsChart(reports as any);
      this.cd.markForCheck();
    }).catch(() => {
      this.topProducts = this.getFallbackTopProducts();
      this.updateSalesChart(this.getFallbackDailySales());
      this.updateReportsChart(this.getFallbackDailyReports());
      this.cd.markForCheck();
    });
  }

  private normalizeTopProducts(data: Array<{ productId?: number; name?: string; image?: string; soldQuantity?: number }>): DashboardProduct[] {
    const fallback = this.getFallbackTopProducts();

    if (!Array.isArray(data) || data.length === 0) {
      return fallback;
    }

    const maxSales = Math.max(...data.map((item) => Number(item.soldQuantity || 0)), 1);

    return data.slice(0, 10).map((product, index) => {
      const sold = Number(product.soldQuantity || 0);
      const name = product.name || `Producto ${index + 1}`;
      const short = name.charAt(0).toUpperCase();

      return {
        rank: index + 1,
        name,
        sold,
        image: product.image || fallback[index % fallback.length].image,
        accent: fallback[index % fallback.length].accent,
        short,
        meterValue: Math.max(8, Math.round((sold / maxSales) * 100)),
        barColor: fallback[index % fallback.length].barColor,
      };
    });
  }

  private updateSalesChart(data: Array<{ day: string; salesCount: number }>) {
    if (!Array.isArray(data) || data.length === 0) {
      data = this.getFallbackDailySales();
    }

    const labels = data.map((item) => this.extractDayNumber(item.day));
    const values = data.map((item) => item.salesCount ?? 0);

    this.salesChartData = {
      labels,
      datasets: [
        {
          label: 'Ventas',
          data: values,
          borderColor: '#6f394d',
          backgroundColor: 'rgba(111, 57, 77, 0.12)',
          pointBackgroundColor: '#6f394d',
          pointBorderColor: '#fff',
          pointRadius: 4,
          pointHoverRadius: 5,
          borderWidth: 3,
          fill: false,
          cubicInterpolationMode: 'monotone',
          tension: 0.35,
        },
      ],
    };
  }

  private updateReportsChart(data: Array<{ day: string; reportsCount: number }>) {
    if (!Array.isArray(data) || data.length === 0) {
      data = this.getFallbackDailyReports();
    }

    const labels = data.map((item) => this.extractDayNumber(item.day));
    const values = data.map((item) => item.reportsCount ?? 0);

    this.reportsChartData = {
      labels,
      datasets: [
        {
          label: 'Reportes',
          data: values,
          borderColor: '#bf7292',
          backgroundColor: 'rgba(191, 114, 146, 0.12)',
          pointBackgroundColor: '#bf7292',
          pointBorderColor: '#fff',
          pointRadius: 4,
          pointHoverRadius: 5,
          borderWidth: 3,
          fill: false,
          cubicInterpolationMode: 'monotone',
          tension: 0.35,
        },
      ],
    };
  }

  private extractDayNumber(day: string): string {
    const parsed = new Date(day);
    if (isNaN(parsed.getTime())) {
      return day;
    }
    return String(parsed.getDate());
  }

  private initCharts() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--p-text-color') || '#4d2e38';
    const textColorSecondary = documentStyle.getPropertyValue('--p-text-muted-color') || '#8d6c78';
    const surfaceBorder = documentStyle.getPropertyValue('--p-content-border-color') || 'rgba(112, 80, 90, 0.12)';

    this.chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false,
      },
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          backgroundColor: '#fff',
          titleColor: '#4d2e38',
          bodyColor: '#4d2e38',
          borderColor: 'rgba(112, 80, 90, 0.14)',
          borderWidth: 1,
          padding: 10,
        },
      },
      scales: {
        x: {
          ticks: {
            color: textColorSecondary,
            font: {
              size: 11,
            },
          },
          grid: {
            display: true,
            color: surfaceBorder,
            drawBorder: false,
          },
          border: {
            display: false,
          },
        },
        y: {
          beginAtZero: true,
          suggestedMax: 140,
          ticks: {
            color: textColorSecondary,
            stepSize: 30,
            font: {
              size: 11,
            },
          },
          grid: {
            color: surfaceBorder,
            drawBorder: false,
          },
          border: {
            display: false,
          },
        },
      },
    };
  }

  private getFallbackTopProducts(): DashboardProduct[] {
    return [
      { rank: 1, name: 'Espesas terciopelo rosa', sold: 895, image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=200&q=80', accent: 'linear-gradient(135deg, #d8c4b7, #b88b98)', short: 'E', meterValue: 100, barColor: '#d09aa6' },
      { rank: 2, name: 'Disfraz conejita deluxe', sold: 381, image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80', accent: 'linear-gradient(135deg, #dfe7dc, #6a896d)', short: 'D', meterValue: 43, barColor: '#d4a7b2' },
      { rank: 3, name: 'Perfume íntimo Cherry', sold: 210, image: 'https://images.unsplash.com/photo-1528740561666-dc2479dc08ab?auto=format&fit=crop&w=200&q=80', accent: 'linear-gradient(135deg, #f0d9da, #d991aa)', short: 'P', meterValue: 23, barColor: '#d8a3b3' },
      { rank: 4, name: 'Set licencia premium', sold: 142, image: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=200&q=80', accent: 'linear-gradient(135deg, #f4d4d8, #d4a4b5)', short: 'S', meterValue: 16, barColor: '#d9b2c0' },
      { rank: 5, name: 'Corse vintage burdeos', sold: 48, image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=200&q=80', accent: 'linear-gradient(135deg, #d3c4d4, #8b5a70)', short: 'C', meterValue: 5, barColor: '#dca9bb' },
    ];
  }

  private getFallbackDailySales(): Array<{ day: string; salesCount: number }> {
    return [
      { day: '2026-08-01', salesCount: 0 },
      { day: '2026-08-02', salesCount: 0 },
      { day: '2026-08-03', salesCount: 0 },
      { day: '2026-08-04', salesCount: 0 },
      { day: '2026-08-05', salesCount: 0 },
      { day: '2026-08-06', salesCount: 0 },
      { day: '2026-08-07', salesCount: 0 },
      { day: '2026-08-08', salesCount: 5 },
      { day: '2026-08-09', salesCount: 0 },
      { day: '2026-08-10', salesCount: 0 },
      { day: '2026-08-11', salesCount: 1 },
      { day: '2026-08-12', salesCount: 0 },
    ];
  }

  private getFallbackDailyReports(): Array<{ day: string; reportsCount: number }> {
    return [
      { day: '2026-08-01', reportsCount: 0 },
      { day: '2026-08-02', reportsCount: 0 },
      { day: '2026-08-03', reportsCount: 0 },
      { day: '2026-08-04', reportsCount: 0 },
      { day: '2026-08-05', reportsCount: 0 },
      { day: '2026-08-06', reportsCount: 0 },
      { day: '2026-08-07', reportsCount: 0 },
      { day: '2026-08-08', reportsCount: 0 },
      { day: '2026-08-09', reportsCount: 0 },
      { day: '2026-08-10', reportsCount: 0 },
      { day: '2026-08-11', reportsCount: 0 },
      { day: '2026-08-12', reportsCount: 3 },
    ];
  }
}

