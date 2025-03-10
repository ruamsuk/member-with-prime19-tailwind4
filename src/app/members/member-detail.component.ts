import { Component, inject } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Member } from '../models/member.model';
import { ThaiDatePipe } from '../pipes/thai-date.pipe';
import { CountAgeService } from '../services/count-age.service';
import { SharedModule } from '../shared/shared.module';

@Component({
  selector: 'app-member-detail',
  standalone: true,
  imports: [SharedModule, ThaiDatePipe],
  template: `
    <table class="table">
      <tr>
        <th>ยศ ชื่อ สกุล:</th>
        <td>{{ member.rank }}{{ member.firstname }} {{ member.lastname }}</td>
      </tr>
      <tr>
        <th>วันเดือนปีเกิด:</th>
        <td>{{ member.birthdate | thaiDate }}</td>
      </tr>
      <tr>
        <th>อายุ:</th>
        <td>
          <span class="text-green-400">{{ age }}</span>
        </td>
      </tr>
      <tr>
        <th>ที่อยู่:</th>
        <td>{{ member.address }}</td>
      </tr>
      <tr>
        <th>อำเภอ:</th>
        <td>{{ member.district }}</td>
      </tr>
      <tr>
        <th>จังหวัด:</th>
        <td>{{ member.province }} {{ member.zip }}</td>
      </tr>
      <tr>
        <th>โทรศัพท์:</th>
        <td>{{ member.phone }}</td>
      </tr>
      <tr>
        <th>สถานะ:</th>
        <td>
          <span
            class="{{
              member.alive == 'เสียชีวิตแล้ว'
                ? 'text-orange-400'
                : 'text-green-400'
            }}"
          >{{ member.alive }}</span
          >
        </td>
      </tr>
      <tr>
        <th>บันทึกเมื่อ:</th>
        <td>
          {{
            member.created
              ? (member.created | thaiDate: 'mediumt')
              : 'ไม่มีข้อมูล'
          }}
        </td>
      </tr>
      <tr>
        <th>แก้ไขเมื่อ:</th>
        <td>
          {{
            member.updated
              ? (member.updated | thaiDate: 'mediumt')
              : 'ไม่มีข้อมูล'
          }}
        </td>
      </tr>
    </table>
    <div class="flex justify-end">
      <p-button
        label="Close"
        size="small"
        severity="secondary"
        (onClick)="dialogClose()"
      ></p-button>
    </div>
  `,
  styles: `
    table {
      border-collapse: collapse;
      font-family: 'Sarabun', sans-serif;
      font-size: 1.125rem;
      margin-bottom: 1rem;
      width: 100%;
    }

    .table th,
    .table td {
      padding: 0.5rem;
      vertical-align: top;
      border-top: 1px solid #c7cacb;
      overflow: hidden;
    }

    .table th,
    .table td:last-child {
      border-bottom: 1px solid grey;
    }

    table th {
      background-color: inherit;
      text-align: right;
      padding-right: 5px;
      height: 2rem;
      width: 36%;
    }
  `,
})
export class MemberDetailComponent {
  ref = inject(DynamicDialogRef);
  ageService = inject(CountAgeService);
  memberData = inject(DynamicDialogConfig);
  member!: Member;
  age: string | null = null;

  constructor() {
    if (this.memberData.data) {
      this.member = this.memberData.data;
      this.age = this.ageService.getAge(this.member.birthdate);
    }
  }

  dialogClose() {
    this.ref.close();
  }
}
