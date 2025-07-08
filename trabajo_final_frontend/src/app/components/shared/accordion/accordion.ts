import {
  AfterContentInit,
  Component,
  ContentChildren,
  Directive,
  Input,
  QueryList,
  TemplateRef
} from '@angular/core';
import {
  NgTemplateOutlet
} from '@angular/common';

@Directive({ selector: 'ng-template[accordionItem]' })
export class AccordionItemDirective {
  @Input() title!: string;
  @Input () expanded!: boolean;
  constructor(public _template: TemplateRef<any>) {}
}
export interface AccordionItem{
  id: string;
  title: string;
  content: string;
}

@Component({
  selector: 'app-accordion',
  standalone: true,
  imports: [
    NgTemplateOutlet
  ],
  templateUrl: './accordion.html',
  styleUrl: './accordion.css'
})
export class Accordion implements AfterContentInit {
  @Input() color: string = '#00bcd4';
  @ContentChildren(AccordionItemDirective) items!: QueryList<AccordionItemDirective>;
  ngAfterContentInit() {}
  openIndex: number | null = null;

  toggle(index: number) {
    this.openIndex = this.openIndex === index ? null : index;
  }
}
