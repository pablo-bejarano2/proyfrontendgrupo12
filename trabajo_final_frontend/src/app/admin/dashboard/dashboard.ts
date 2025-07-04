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
  usuariosLabels: string[] = ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'];
  usuariosData: { labels: string[], datasets: { data: number[], label: string }[] } = { labels: this.usuariosLabels, datasets: [{ data: [], label: 'Usuarios nuevos' }] };

  pedidosData: { labels: string[], datasets: { data: number[], label: string }[] } = { labels: this.usuariosLabels, datasets: [{ data: [], label: 'Pedidos semanales' }] };

  dineroLabels: string[] = ['Pedido 1', 'Pedido 2', 'Pedido 3', 'Pedido 4'];
  dineroData: { labels: string[], datasets: { data: number[], label: string }[] } = { labels: this.dineroLabels, datasets: [{ data: [], label: 'Dinero por pedido' }] };

  cuponesLabels: string[] = [];
  cuponesData: { labels: string[], datasets: { data: number[], label: string }[] } = { labels: this.cuponesLabels, datasets: [{ data: [], label: 'Cupones usados' }] };

  constructor(private dashboardService: DashboardService) {}

  ngOnInit() {
    this.dashboardService.getUsuariosPorDia().subscribe(data => {
      this.usuariosData.datasets[0].data = data;
    });
    this.dashboardService.getPedidosPorDia().subscribe(data => {
      this.pedidosData.datasets[0].data = data;
    });
    this.dashboardService.getDineroPorPedido().subscribe(data => {
      this.dineroData.datasets[0].data = data;
    });
    this.dashboardService.getCuponesUsados().subscribe(res => {
      this.cuponesData.labels = res.labels;
      this.cuponesData.datasets[0].data = res.data;
    });
  }
}