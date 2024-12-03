import { Component, OnInit, OnDestroy } from '@angular/core';
import { CalendarComponent } from "../calendar/calendar.component";
import { RouterLink } from '@angular/router';
import { Chart, ChartConfiguration, ChartType } from 'chart.js/auto';
import { DashboardService } from './home.service';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CalendarComponent, RouterLink, HttpClientModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {
  private charts: any[] = [];

  constructor(private dashboardService: DashboardService) {}
  
  ngOnInit() {
    this.loadChartData();
  }

  private loadChartData() {
    // Cargar datos de fincas
    this.dashboardService.getFincas().subscribe(fincas => {
      this.createFincasChart(fincas);
    });

    // Cargar datos de cultivos
    this.dashboardService.getCultivos().subscribe(cultivos => {
      this.createCultivosChart(cultivos);
    });

    // Cargar datos de lotes
    this.dashboardService.getLotes().subscribe(lotes => {
      this.createLotesChart(lotes);
    });
  }

  private createFincasChart(fincas: any[]) {
    const gradientBg = this.createGradient('fincasChart', 'rgba(76, 175, 80, 0.8)', 'rgba(76, 175, 80, 0.1)');
    
    const config: ChartConfiguration = {
      type: 'bar',
      data: {
        labels: ['Total de Fincas'],
        datasets: [{
          label: 'Cantidad de Fincas',
          data: [fincas.length],
          backgroundColor: gradientBg,
          borderColor: 'rgba(76, 175, 80, 1)',
          borderWidth: 2,
          borderRadius: 8,
          borderSkipped: false,
          barThickness: 40,
          hoverBackgroundColor: 'rgba(76, 175, 80, 0.9)',
          hoverBorderColor: 'rgba(76, 175, 80, 1)',
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: {
              font: {
                family: "'Poppins', sans-serif",
                size: 13,
                weight: 500
              },
              padding: 20,
              usePointStyle: true,
              pointStyle: 'circle'
            }
          },
          tooltip: {
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            titleColor: '#333',
            bodyColor: '#666',
            bodyFont: {
              family: "'Poppins', sans-serif",
              size: 13
            },
            titleFont: {
              family: "'Poppins', sans-serif",
              size: 14,
              weight: 600
            },
            padding: 12,
            cornerRadius: 8,
            displayColors: false,
            borderColor: 'rgba(0, 0, 0, 0.1)',
            borderWidth: 1,
            callbacks: {
              label: (context) => ` ${context.raw} Fincas registradas`
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(0, 0, 0, 0.06)',
              display: true
            },
            ticks: {
              font: {
                family: "'Poppins', sans-serif",
                size: 12
              },
              color: '#666',
              padding: 10
            }
          },
          x: {
            grid: {
              display: false
            },
            ticks: {
              font: {
                family: "'Poppins', sans-serif",
                size: 12,
                weight: 500
              },
              color: '#333'
            }
          }
        },
        animation: {
          duration: 2000,
          easing: 'easeInOutQuart'
        }
      }
    };

    const ctx = document.getElementById('fincasChart') as HTMLCanvasElement;
    if (ctx) {
      const chart = new Chart(ctx, config);
      this.charts.push(chart);
    }
  }

  private createCultivosChart(cultivos: any[]) {
    const config: ChartConfiguration<'doughnut'> = {
      type: 'doughnut',
      data: {
        labels: cultivos.map(c => c.name || 'Sin nombre'),
        datasets: [{
          data: cultivos.map(() => 1),
          backgroundColor: [
            'rgba(255, 99, 132, 0.8)',
            'rgba(54, 162, 235, 0.8)',
            'rgba(255, 206, 86, 0.8)',
            'rgba(75, 192, 192, 0.8)',
            'rgba(153, 102, 255, 0.8)',
            'rgba(255, 159, 64, 0.8)',
            'rgba(76, 175, 80, 0.8)',
            'rgba(233, 30, 99, 0.8)'
          ],
          borderColor: 'white',
          borderWidth: 3,
          offset: 10,
          spacing: 5,
          borderRadius: 20
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        radius: '90%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 20,
              usePointStyle: true,
              pointStyle: 'circle',
              font: {
                family: "'Poppins', sans-serif",
                size: 12
              }
            }
          },
          tooltip: {
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            titleColor: '#333',
            bodyColor: '#666',
            bodyFont: {
              family: "'Poppins', sans-serif",
              size: 13
            },
            titleFont: {
              family: "'Poppins', sans-serif",
              size: 14,
              weight: 600
            },
            padding: 12,
            cornerRadius: 8,
            displayColors: true,
            borderColor: 'rgba(0, 0, 0, 0.1)',
            borderWidth: 1
          }
        },
        animation: {
          duration: 2000,
          easing: 'easeInOutQuart'
        }
      }
    };

    const ctx = document.getElementById('cultivosChart') as HTMLCanvasElement;
    if (ctx) {
      const chart = new Chart(ctx, config);
      this.charts.push(chart);
    }
  }

  private createLotesChart(lotes: any[]) {
    const gradientBg = this.createGradient('lotesChart', 'rgba(54, 162, 235, 0.8)', 'rgba(54, 162, 235, 0.1)');

    const config: ChartConfiguration = {
      type: 'polarArea',
      data: {
        labels: ['Lotes Registrados'],
        datasets: [{
          label: 'Cantidad de Lotes',
          data: [lotes.length],
          backgroundColor: [gradientBg],
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          r: {
            ticks: {
              display: false
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            }
          }
        },
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              font: {
                family: "'Poppins', sans-serif",
                size: 12
              },
              padding: 20,
              usePointStyle: true,
              pointStyle: 'circle'
            }
          },
          tooltip: {
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            titleColor: '#333',
            bodyColor: '#666',
            bodyFont: {
              family: "'Poppins', sans-serif",
              size: 13
            },
            titleFont: {
              family: "'Poppins', sans-serif",
              size: 14,
              weight: 600
            },
            padding: 12,
            cornerRadius: 8,
            displayColors: true,
            borderColor: 'rgba(0, 0, 0, 0.1)',
            borderWidth: 1
          }
        },
        animation: {
          duration: 2000,
          easing: 'easeInOutQuart'
        }
      }
    };

    const ctx = document.getElementById('lotesChart') as HTMLCanvasElement;
    if (ctx) {
      const chart = new Chart(ctx, config);
      this.charts.push(chart);
    }
  }

  private createGradient(chartId: string, colorStart: string, colorEnd: string): CanvasGradient | string {
    const ctx = document.getElementById(chartId) as HTMLCanvasElement;
    if (!ctx) return colorStart;

    const context = ctx.getContext('2d');
    if (!context) return colorStart;

    const gradient = context.createLinearGradient(0, 0, 0, ctx.height);
    gradient.addColorStop(0, colorStart);
    gradient.addColorStop(1, colorEnd);
    return gradient;
  }

  ngOnDestroy() {
    this.charts.forEach(chart => chart.destroy());
  }
}
