import { Pipe, PipeTransform } from '@angular/core';
import firebase from 'firebase/compat/app';

@Pipe({
  name: 'thaiDate',
  standalone: true,
})
export class ThaiDatePipe implements PipeTransform {
  transform(value: Date | string | number | firebase.firestore.Timestamp | null | undefined, format: string = 'medium'): string | null {
    if (!value) return null;

    let inputDate: Date;
    if (typeof value === 'number' || typeof value === 'string') {
      inputDate = new Date(value);
    } else if (value instanceof Date) {
      inputDate = value;
    } else {
      inputDate = value.toDate();
    }

    if (isNaN(inputDate.getTime())) return null;

    const ThaiDay = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];
    const sThaiDay = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'];
    const thaiMonth = [
      'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
      'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
    ];
    const sThaiMonth = [
      'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
      'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
    ];

    const day = inputDate.getDate();
    const dayOfWeek = inputDate.getDay();
    const month = inputDate.getMonth();
    const year = inputDate.getFullYear() + 543;
    const hours = inputDate.getHours();
    const minutes = inputDate.getMinutes();
    const seconds = inputDate.getSeconds();

    const formatOptions: { [key: string]: string[] } = {
      /** วันอาทิตย์, 01, มกราคม, 2564 */
      full: [`วัน${ThaiDay[dayOfWeek]}`, `ที่ ${day}`, `เดือน${thaiMonth[month]}`, `พ.ศ. ${year}`],
      /** อาทิตย์, 01, มกราคม, 2564 */
      medium: [`${day}`, `${sThaiMonth[month]}`, `${year}`],
      /** อา., 01, ม.ค., 2564 */
      mediumd: [`${sThaiDay[dayOfWeek]}`, `${day}`, `${sThaiMonth[month]}`, `${year}`],
      /** อา., 01, ม.ค., 2564 - 12:00:00 */
      mediumdt: [`${sThaiDay[dayOfWeek]}`, `${day}`, `${sThaiMonth[month]}`, `${year}`, `- ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`],
      /** 01, ม.ค., 2564 - 12:00:00 */
      mediumt: [`${day}`, `${sThaiMonth[month]}`, `${year}`, `- ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`],
      /** 01 ม.ค. 2564 */
      short: [`${day} ${sThaiMonth[month]} ${year}`],
    };

    return formatOptions[format]?.join(' ') || formatOptions['medium'].join(' ');
  }
}
