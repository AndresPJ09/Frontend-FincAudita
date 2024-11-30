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
  styleUrl: './home.component.css'
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
    const config: ChartConfiguration<'bar'> = {
      type: 'bar',
      data: {
        labels: ['Total de Fincas'],
        datasets: [{
          label: 'Cantidad de Fincas',
          data: [fincas.length],
          backgroundColor: 'rgba(76, 175, 80, 0.9)',
          borderColor: 'rgba(76, 175, 80, 1)',
          borderWidth: 2,
          borderRadius: 10,
          barThickness: 60,
          hoverBackgroundColor: 'rgba(76, 175, 80, 1)',
          hoverBorderColor: 'rgba(255, 255, 255, 1)',
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 1000,
          easing: 'easeOutBounce'
        },
        plugins: {
          legend: {
            display: true,
            labels: {
              font: {
                size: 14,
                weight: 'bold'
              },
              color: '#333'
            }
          },
          tooltip: {
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            titleColor: '#333',
            bodyColor: '#666',
            padding: 12,
            borderColor: 'rgba(76, 175, 80, 0.5)',
            borderWidth: 1,
            displayColors: false,
            callbacks: {
              label: (context) => ` ${context.parsed.y} Fincas registradas`
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(0, 0, 0, 0.1)',
            },
            ticks: {
              font: {
                size: 12,
                weight: 500
              },
              color: '#666'
            }
          },
          x: {
            grid: {
              display: false
            },
            ticks: {
              font: {
                size: 14,
                weight: 'bold'
              },
              color: '#333'
            }
          }
        }
      }
    };

    const chart = new Chart('fincasChart', config);
    this.charts.push(chart);
  }

  private createCultivosChart(cultivos: any[]) {
    const config: ChartConfiguration = {
      type: 'pie' as ChartType,
      data: {
        labels: cultivos.map(c => c.name || 'Sin nombre'),
        datasets: [{
          data: cultivos.map(() => 1),
          backgroundColor: [
            'rgba(255, 99, 132, 0.8)',
            'rgba(54, 162, 235, 0.8)',
            'rgba(255, 206, 86, 0.8)',
            'rgba(75, 192, 192, 0.8)',
            'rgba(153, 102, 255, 0.8)'
          ],
          borderColor: 'white',
          borderWidth: 3,
          hoverOffset: 15,
          hoverBorderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          tooltip: {
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            titleColor: '#333',
            bodyColor: '#666',
            padding: 12,
            borderColor: 'rgba(0, 0, 0, 0.1)',
            borderWidth: 1
          },
          title: {
            display: true,
            text: 'Distribución de Cultivos',
            font: {
              size: 18,
              weight: 'bold',
              family: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif"
            },
            padding: { top: 20, bottom: 20 },
            color: '#333'
          },
          legend: {
            position: 'bottom',
            labels: {
              padding: 20,
              usePointStyle: true,
              pointStyle: 'circle',
              font: {
                size: 12,
                weight: 500
              }
            }
          }
        },
        layout: {
          padding: 20
        }
      }
    };

    const chart = new Chart('cultivosChart', config);
    this.charts.push(chart);
  }

  private createLotesChart(lotes: any[]) {
    const config: ChartConfiguration<'doughnut'> = {
      type: 'doughnut',
      data: {
        labels: ['Lotes Registrados'],
        datasets: [{
          label: 'Cantidad de Lotes',
          data: [lotes.length],
          backgroundColor: [
            'rgba(54, 162, 235, 0.8)'
          ],
          borderColor: 'white',
          borderWidth: 2,
          hoverOffset: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Total de Lotes',
            font: {
              size: 16,
              weight: 'bold'
            },
            padding: 20
          },
          legend: {
            position: 'bottom',
            labels: {
              padding: 20,
              usePointStyle: true,
              pointStyle: 'circle'
            }
          }
        },
        radius: '90%',
        cutout: '70%',
        layout: {
          padding: 20
        }
      }
    };

    const chart = new Chart('lotesChart', config);
    this.charts.push(chart);
  }

  ngOnDestroy() {
    this.charts.forEach(chart => chart.destroy());
  }
}
