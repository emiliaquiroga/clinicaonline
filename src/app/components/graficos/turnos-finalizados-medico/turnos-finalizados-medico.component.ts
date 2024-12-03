import { Component, Input } from '@angular/core';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-turnos-finalizados-medico',
  standalone: true,
  imports: [],
  templateUrl: './turnos-finalizados-medico.component.html',
  styleUrl: './turnos-finalizados-medico.component.css'
})
export class TurnosFinalizadosMedicoComponent {
  @Input() turnosFinalizados: any;

  barChar: any;
  turnosData: any = [];

  ngOnInit(): void {
    this.turnosData = this.turnosFinalizados.map((turno:any) => {
      return turno.cantidad;
    });
    this.createBarChart(this.turnosFinalizados);
  }

  createBarChart(turnos:any) {
    this.barChar = new Chart('canvas', {
      type: 'bar',
      data: {
        labels: this.turnosFinalizados.map((p:any) => ''),
        datasets: [{
            label: '',
            data: this.turnosData,
            backgroundColor: [
              '#21A6E5', '#063752', '#3C6C83','#282728', '#202B2C',
              '#00A1FD','#fcb7af','#fdf9c4','#ffe4e1','#b2e2f2','#ff6961'
            ],
            borderColor: [
              '#21A6E5', '#063752', '#3C6C83','#282728', '#202B2C',
              '#00A1FD','#fcb7af','#fdf9c4','#ffe4e1','#b2e2f2','#ff6961'
            ],
            borderWidth: 1,
          },
        ],
      },
      options: {
        maintainAspectRatio: false,
        indexAxis: 'y',
        scales: {
          y: {
            display: false,
          },
          x: {
            grid: {
              color: '#555555',
            },
            ticks: {
              color: 'rgb(0,0,0)',
              font: {
                weight: 'bold',
              }
            },
          },
        },
        layout: {
          padding: 20,
        },
        plugins: {
          tooltip: {
            usePointStyle: true,
            borderColor: '#C5DB8F',
            borderWidth: 3,
            boxHeight: 130,
            boxWidth: 130,
            cornerRadius: 8,
            displayColors: true,
            bodyAlign: 'center',
            callbacks: {
              //@ts-ignore
              labelPointStyle(context) 
              {
                const value = context.formattedValue;
                const cant = turnos[context.dataIndex].cantidad;
                context.label = turnos[context.dataIndex].especialista;

                return{
                  pointStyle: turnos[context.dataIndex].especialista
                }
              },
            },
            legend: {
              display: false,
            },
          },
        },
      },
    });
  }
}