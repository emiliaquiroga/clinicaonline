import { trigger, transition, style, animate, query, group } from '@angular/animations';

const fadeAnimation = [
  style({ opacity: 0 }),
  animate('600ms', style({ opacity: 1 })),
];

const slideAnimation = [
  style({ position: 'relative' }),
  query(':enter, :leave', [
    style({
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%'
    })
  ], { optional: true }),
  query(':enter', [
    style({ left: '-100%' })
  ], { optional: true }),
  query(':leave', [
    animate('300ms ease', style({ left: '100%' }))
  ], { optional: true }),
  query(':enter', [
    animate('300ms ease', style({ left: '0%' }))
  ], { optional: true })
];

const slideInAnimation = [
  query(':enter, :leave', [
    style({
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%'
    })
  ], { optional: true }),
  query(':enter', [
    style({ top: '-100%' })
  ], { optional: true }),
  group([
    query(':leave', [
      animate('300ms ease-out', style({ top: '100%' }))
    ], { optional: true }),
    query(':enter', [
      animate('300ms ease-out', style({ top: '0%' }))
    ], { optional: true })
  ]),
];
const slideInReverseAnimation = [
  query(':enter, :leave', [
    style({
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%'
    })
  ], { optional: true }),
  query(':enter', [
    style({ top: '100%' }) 
  ], { optional: true }),
  group([
    query(':leave', [
      animate('300ms ease-out', style({ top: '-100%' })) 
    ], { optional: true }),
    query(':enter', [
      animate('300ms ease-out', style({ top: '0%' })) 
    ], { optional: true })
  ]),
];
const zoomAnimation = [
  query(':enter, :leave', [
    style({
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%'
    })
  ], { optional: true }),
  group([
    query(':leave', [
      animate('300ms ease', style({ transform: 'scale(0.8)', opacity: 0 }))
    ], { optional: true }),
    query(':enter', [
      style({ transform: 'scale(1.2)', opacity: 0 }),
      animate('300ms ease', style({ transform: 'scale(1)', opacity: 1 }))
    ], { optional: true })
  ]),
];
const rotateAnimation = [
  query(':enter, :leave', [
    style({
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%'
    })
  ], { optional: true }),
  group([
    query(':leave', [
      animate('300ms ease', style({ transform: 'rotateY(90deg)', opacity: 0 }))
    ], { optional: true }),
    query(':enter', [
      style({ transform: 'rotateY(-90deg)', opacity: 0 }),
      animate('300ms ease', style({ transform: 'rotateY(0deg)', opacity: 1 }))
    ], { optional: true })
  ]),
];



export const routeAnimations = trigger('routeAnimations', [
  transition('* => fade', fadeAnimation),
  transition('* => slide', slideAnimation),
  transition('* => slideIn', slideInAnimation),
  transition('* => slideInReverse', slideInReverseAnimation),
  transition('* => zoom', zoomAnimation), 
  transition('* => rotate', rotateAnimation),
  transition('fade => *', fadeAnimation),
  transition('slide => *', slideAnimation),
  transition('slideIn => *', slideInAnimation),
  transition('slideInReverse => *', slideInReverseAnimation),
  transition('zoom => *', zoomAnimation), 
  transition('rotate => *', rotateAnimation),
  transition('* <=> *', fadeAnimation), // animación por defecto
]);