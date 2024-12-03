import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dynamicProperty',
  standalone: true
})
export class DynamicPropertyPipe implements PipeTransform {
  transform(obj: any, key: string): any {
    return obj[key];
  }
}