import { Directive, ElementRef, HostListener, Input, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appToolTip]',
  standalone: true
})
export class ToolTipDirective {
  @Input('appToolTip') tooltipText: string = '';
  private tooltipElement: HTMLElement | null = null;

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  @HostListener('mouseenter') onMouseEnter() {
    this.showTooltip();
  }

  @HostListener('mouseleave') onMouseLeave() {
    this.hideTooltip();
  }

  private showTooltip() {
    this.createTooltip();
    if (this.tooltipElement) {
      const hostPos = this.el.nativeElement.getBoundingClientRect();
      const tooltipPos = this.tooltipElement.getBoundingClientRect();
      
      const top = hostPos.top - tooltipPos.height - 10;
      const left = hostPos.left + (hostPos.width - tooltipPos.width) / 2;

      this.renderer.setStyle(this.tooltipElement, 'top', `${top}px`);
      this.renderer.setStyle(this.tooltipElement, 'left', `${left}px`);
      this.renderer.setStyle(this.tooltipElement, 'opacity', '1');
    }
  }

  private hideTooltip() {
    if (this.tooltipElement) {
      this.renderer.setStyle(this.tooltipElement, 'opacity', '0');
    }
  }

  private createTooltip() {
    if (!this.tooltipElement) {
      this.tooltipElement = this.renderer.createElement('div');
      const text = this.renderer.createText(this.tooltipText);
      this.renderer.appendChild(this.tooltipElement, text);
      this.renderer.appendChild(document.body, this.tooltipElement);

      this.renderer.setStyle(this.tooltipElement, 'position', 'fixed');
      this.renderer.setStyle(this.tooltipElement, 'background', 'rgba(0,0,0,0.8)');
      this.renderer.setStyle(this.tooltipElement, 'color', 'white');
      this.renderer.setStyle(this.tooltipElement, 'padding', '5px 10px');
      this.renderer.setStyle(this.tooltipElement, 'border-radius', '4px');
      this.renderer.setStyle(this.tooltipElement, 'z-index', '10000');
      this.renderer.setStyle(this.tooltipElement, 'opacity', '0');
      this.renderer.setStyle(this.tooltipElement, 'transition', 'opacity 0.3s');
      this.renderer.setStyle(this.tooltipElement, 'font-size', '11px');
      this.renderer.setStyle(this.tooltipElement, 'pointer-events', 'none');
    }
  }
}