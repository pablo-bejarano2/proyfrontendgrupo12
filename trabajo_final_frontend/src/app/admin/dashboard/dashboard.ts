import { Component, OnInit } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { DashboardService } from '@/app/services/dashboardService';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [BaseChartDirective],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class Dashboard implements OnInit {
  // Etiquetas para los últimos 7 días (puedes personalizar para mostrar fechas reales si lo deseas)
  diasLabels: string[] = ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'];

  usuariosData = { labels: this.diasLabels, datasets: [{ data: [] as number[], label: 'Usuarios nuevos' }] };
  pedidosData = { labels: this.diasLabels, datasets: [{ data: [] as number[], label: 'Pedidos semanales' }] };

  dineroLabels: string[] = ['Pedido 1', 'Pedido 2', 'Pedido 3', 'Pedido 4'];
  dineroData = { labels: this.dineroLabels, datasets: [{ data: [] as number[], label: 'Monto ($)' }] };

  cuponesData = { labels: [] as string[], datasets: [{ data: [] as number[], label: 'Cupones usados' }] };

  constructor(private dashboardService: DashboardService) {}

  ngOnInit() {
    this.dashboardService.getUsuariosPorDia().subscribe(data => {
      this.usuariosData.datasets[0].data = data;
    });
    this.dashboardService.getPedidosPorDia().subscribe(data => {
      this.pedidosData.datasets[0].data = data;
    });
    this.dashboardService.getDineroPorPedido().subscribe(data => {
      // Ajusta labels dinámicamente si hay menos de 4 pedidos
      this.dineroData.labels = data.map((_, i) => `Pedido ${i + 1}`);
      this.dineroData.datasets[0].data = data;
    });
    this.dashboardService.getCuponesUsados().subscribe(res => {
      this.cuponesData.labels = res.labels;
      this.cuponesData.datasets[0].data = res.data;
    });
  }
}