import { Component, inject, OnInit, signal } from '@angular/core';
import { Timestamp } from '@angular/fire/firestore';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import dayjs from 'dayjs';
import 'dayjs/locale/th'; // เพิ่ม locale ภาษาไทย
import isLeapYear from 'dayjs/plugin/isLeapYear';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { MembersService } from '../services/members.service';
import { ToastService } from '../services/toast.service';
import { SharedModule } from '../shared/shared.module';

@Component({
  selector: 'app-add-edit-member',
  imports: [SharedModule],
  template: `
    <div [formGroup]="memberForm" (ngSubmit)="submitForm()">
      <div class="flex justify-center">
        <div class="w-[200px]">
          <p-autoComplete
            id="rank"
            formControlName="rank"
            [dropdown]="true"
            [suggestions]="filteredRanks"
            (completeMethod)="filterRanks($event)"
            appendTo="body"
            optionLabel="rank"
            styleClass="w-full"
            placeholder="เลือกยศ"
          >
          </p-autoComplete>
        </div>
      </div>

      <div class="grid sm:grid-cols-1 md:grid-cols-2 gap-2">
        <div class="my-3">
          <p-floatlabel variant="on">
            <input
              type="text"
              pInputText
              formControlName="firstname" class="w-full"
            />
            <label for="firstname">ชื่อ</label>
          </p-floatlabel>
        </div>
        <div class="my-3">
          <p-floatlabel variant="on">
            <input
              type="text"
              pInputText
              formControlName="lastname"
              class="w-full"
            />
            <label for="lastname">นามสกุล</label>
          </p-floatlabel>
        </div>
      </div>
      <p class="text-gray-400 ml-1">วัน เดือน ปี เกิด</p>
      <div class="grid sm:grid-cols-1 gap-1  md:grid-cols-3 ">
        <div class="">

          <p-select [options]="days"
                    placeholder="เลือกวัน"
                    formControlName="day"
                    appendTo="body" styleClass="w-full">
          </p-select>
        </div>
        <div class="">
          <p-select [options]="months"
                    optionLabel="name"
                    optionValue="id"
                    placeholder="เลือกเดือน"
                    formControlName="month"
                    appendTo="body" styleClass="w-full">
          </p-select>
        </div>
        <div class="">
          <p-select [options]="years"
                    placeholder="เลือกปี พ.ศ."
                    formControlName="year"
                    appendTo="body" styleClass="w-full"></p-select>
        </div>
        <div class="col-span-2 md:col-span-3 my-3">
          <p-floatlabel variant="on">
            <label for="address">ที่อยู่</label>
            <input
              type="text"
              pInputText
              formControlName="address"
              class="w-full mt-1"
            />
          </p-floatlabel>
          <small class="text-slate-400 text-sm italic">บ้านเลขที่ ถนน ตำบล</small>
        </div>
      </div>
      <div class="grid sm:grid-cols-1 md:grid-cols-2 gap-2">
        <div class="">
          <p-floatlabel variant="on">
            <label for="district">อำเภอ</label>
            <input
              type="text"
              pInputText
              formControlName="district"
              class="w-full mt-1"
            />
          </p-floatlabel>
        </div>
        <div class="">
          <p-floatlabel variant="on">
            <label for="province">จังหวัด</label>
            <input
              type="text"
              pInputText
              formControlName="province"
              class="w-full mt-1"
            />
          </p-floatlabel>
        </div>
        <div class="my-3">
          <p-floatlabel variant="on">
            <label for="zip">รหัสไปรษณีย์</label>
            <input
              type="text"
              pInputText
              formControlName="zip"
              class="w-full mt-1"
            />
          </p-floatlabel>
        </div>
        <div class="my-3">
          <p-floatlabel variant="on">
            <label for="phone">โทรศัพท์</label>
            <input
              type="text"
              pInputText
              formControlName="phone"
              class="w-full mt-1"
            />
          </p-floatlabel>
        </div>
      </div>
      <div class="flex mt-2">
        <p-toggleswitch formControlName="alive"/>
        <span
          [ngClass]="{
              isAlive: statusMessage() == 'ยังมีชีวิต',
              status: statusMessage() == 'เสียชีวิตแล้ว',
            } " class="ml-2"
        >{{ statusMessage() }}</span>
      </div>
      <div class="my-3">
        <hr class="h-px bg-gray-400 border-0"/>
      </div>
      <div class="grid grid-cols-2 mt-3 gap-2 md:gap-4">
        <p-button
          label="Cancel"
          severity="secondary"
          styleClass="w-full"
          class="w-full mr-2"
          (onClick)="closeDialog()"
        />
        <p-button
          label="Save"
          (click)="submitForm()"
          [disabled]="memberForm.invalid"
          styleClass="w-full"
          class="w-full"
        />
      </div>
    </div>
  `,
  styles: `
    label {
      margin-bottom: 0.5rem;
    }
  `
})
export class AddEditMemberComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private message = inject(ToastService);
  private readonly membersService = inject(MembersService);
  private memDataConfig = inject(DynamicDialogConfig);
  private ref = inject(DynamicDialogRef);
  years: number[] = [];
  days: number[] = [];
  months: { id: number, name: string }[] = [
    {id: 1, name: 'มกราคม'}, {id: 2, name: 'กุมภาพันธ์'}, {id: 3, name: 'มีนาคม'},
    {id: 4, name: 'เมษายน'}, {id: 5, name: 'พฤษภาคม'}, {id: 6, name: 'มีนาคม'},
    {id: 7, name: 'กรกฎาคม'}, {id: 8, name: 'สิงหาคม'}, {id: 9, name: 'กันยายน'},
    {id: 10, name: 'ตุลาคม'}, {id: 11, name: 'พฤศจิกายน'}, {id: 12, name: 'ธันวาคม'}
  ];
  filteredRanks: any;
  ranks: any[] = [
    {rank: 'น.อ.ร.'},
    {rank: 'ร.ต.อ.'},
    {rank: 'พ.ต.ต.'},
    {rank: 'พ.ต.ท.'},
    {rank: 'พ.ต.อ.'},
  ];

  statusMessage = signal('ยังมีชีวิต');
  alive = signal(true);

  memberForm!: FormGroup;

  constructor() {
    dayjs.extend(isLeapYear);
    dayjs().locale('th');
  }

  filterRanks(event: any) {
    const query = event.query.toLowerCase();
    this.filteredRanks = this.ranks.filter((rank) =>
      rank.rank.toLowerCase().includes(query),
    );
  }

  ngOnInit() {
    const currentYearThai = new Date().getFullYear() + 543;
    this.years = Array.from({length: 100}, (_, i) => currentYearThai - i);
    this.days = Array.from({length: 31}, (_, i) => i + 1);

    this.memberForm = this.fb.group({
      day: [null, Validators.required],
      month: [null, Validators.required],
      year: [null, Validators.required],
      id: [null],
      rank: [''],
      firstname: ['', Validators.required],
      lastname: ['', Validators.required],
      birthdate: [''],
      address: [''],
      district: [''],
      province: [''],
      role: [''],
      zip: [''],
      phone: [''],
      alive: [false],
    });

    this.memberForm.get('alive')?.valueChanges.subscribe((alive) => {
      this.statusMessage.set(alive ? 'เสียชีวิตแล้ว' : 'ยังมีชีวิต');
    });

    if (this.memDataConfig && this.memDataConfig.data) {
      this.loadFormData(this.memDataConfig.data); // <--- เรียก method นี้
    }
  }

  loadFormData(member: any) {
    const birthDateFirestore = member.birthdate as Timestamp;
    const birthdateJSDate = birthDateFirestore.toDate(); // แปลง Timestamp เป็น Date ชัดเจน
    this.memberForm.patchValue({
      ...member,
      day: birthdateJSDate.getDate(),
      month: birthdateJSDate.getMonth() + 1, // JS เดือนนับ 0-11 (อย่าลืม +1)
      year: birthdateJSDate.getFullYear() + 543, // แปลงปี ค.ศ. เป็น พ.ศ.ไทย
      alive: member.alive == 'เสียชีวิตแล้ว',
    });
  }

  submitForm() {
    if (this.memberForm.invalid) {
      this.message.showError('Error', 'กรุณากรอกข้อมูลให้ครบก่อนบันทึก');
      return;
    }

    const dataForm = this.memberForm.value;
    const rankD = (typeof dataForm.rank === 'object' && dataForm.rank !== null) ? dataForm.rank.rank : dataForm.rank;

    const {day, month, year, ...formData} = this.memberForm.value;
    const birthdate = new Date(year - 543, month - 1, day);
    const status = this.memberForm.value.alive ? 'เสียชีวิตแล้ว' : 'ยังมีชีวิต';
    /** แปลงกลับไป timestamp ของ firestore */
    const firestoreTimestamp = Timestamp.fromDate(birthdate);
    const memberData = {
      ...formData,
      rank: rankD,
      birthdate: firestoreTimestamp,
      alive: status,
      updated: Timestamp.now() // อัปเดตเวลาที่แก้ไขข้อมูล
    };
    if (this.memDataConfig.data) {
      this.membersService.updateMember(memberData).subscribe({
        next: () => this.message.showSuccess('Successfully', 'แก้ไขข้อมูลและบันทึกสำเร็จ'),
        error: err => this.message.showError('Error', err.message),
      });
    } else {
      this.membersService.addMember(memberData).subscribe({
        next: () => this.message.showSuccess('Successfully', 'บันทึกข้อมูลใหม่สำเร็จ'),
        error: err => this.message.showError('Error', err.message),
      });
    }
    this.ref.close(true);
  }

  closeDialog() {
    this.ref.close(false);
  }
}
