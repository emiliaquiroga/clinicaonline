import { Component, Input } from '@angular/core';
import Chart from 'chart.js/auto';
import { FirestoreService } from '../../../services/firestore.service';
import { take } from 'rxjs';
import { GetNombreDelEspecialistaPipe } from '../../../pipes/get-nombre-del-especialista.pipe';

@Component({
  selector: 'app-turnos-solicitados-medico',
  standalone: true,
  imports: [GetNombreDelEspecialistaPipe],
  templateUrl: './turnos-solicitados-medico.component.html',
  styleUrl: './turnos-solicitados-medico.component.css'
})
export class TurnosSolicitadosMedicoComponent {
  @Input() turnosPorMedico: any;

  usuarios: any[] = [];

  pieChart: any;
  turnosData: any = [];

  ngOnInit(): void {
    this.turnosData = this.turnosPorMedico.map((turno:any) => {
      return turno.cantidad;
    });
    this.createPieChart(this.turnosPorMedico);
  }

  createPieChart(turnos:any) {
    this.pieChart = new Chart('canvas', {
      type: 'pie',
      data: {
        labels: [],
        datasets: [{
            label: '',
            data: this.turnosData,
            backgroundColor: [
              '#21A6E5', '#063752', '#BAD696', '#3C6C83','#282728', '#202B2C',
              '#00A1FD','#fcb7af','#fdf9c4','#ffe4e1','#b2e2f2','#ff6961'
            ],
            borderWidth: 1.5,
          },
        ],
      },
      options: {
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
                const especialista = turnos[context.dataIndex].especialista;

                context.label = `${especialista}`;
                return{
                  pointStyle: turnos[context.dataIndex].cantidad
                }
              },
            },
            legend: {
              display: false,
            },
            datalabels: {
              color: '#ffffff',
              anchor: 'end',
              align: 'center',
              font: {
                size: 30,
                weight: 'bold',
              },
              offset: 5,
              borderColor: '#ffffff',
              borderWidth: 1,
              borderRadius: 10,
              padding: 5,
              textShadowBlur: 10,
              textShadowColor: '#000000',
            },
          },
        },
      },
    });
  }
}
