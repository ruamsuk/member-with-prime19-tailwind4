import { Injectable } from '@angular/core';
import dayjs from 'dayjs';

@Injectable({
  providedIn: 'root'
})
export class CountAgeService {

  getAge(DayOfBirth: any) {
    if (!DayOfBirth) {
      return 'ไม่มีข้อมูลวันเกิด';
    }

    const setDayBirth = dayjs(DayOfBirth.toDate()); // ใช้ Day.js แปลงวันที่
    const setNowDate = dayjs(); // วันที่ปัจจุบัน

    // คำนวณอายุในปี
    const yearReal = setNowDate.diff(setDayBirth, 'year');
    const updatedDayBirth = setDayBirth.add(yearReal, 'year'); // ปรับ setDayBirth ไปยังวันเกิดล่าสุด

    // คำนวณจำนวนเดือนหลังจากปรับ setDayBirth
    const monthReal = setNowDate.diff(updatedDayBirth, 'month');
    const updatedMonthBirth = updatedDayBirth.add(monthReal, 'month'); // ปรับ setDayBirth ไปยังเดือนเกิดล่าสุด

    // คำนวณจำนวนวันหลังจากปรับ setDayBirth
    const dayReal = setNowDate.diff(updatedMonthBirth, 'day');

    return `${yearReal} ปี ${monthReal} เดือน ${dayReal} วัน`;
  }
}
