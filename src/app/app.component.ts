import { Component, OnInit } from '@angular/core';

type KpiStatus = 'success' | 'warning' | 'danger' | 'info' | 'primary';
type RiskStatus = 'Full' | 'Near Full' | 'Healthy' | 'Low Demand';
type PaymentStatus = 'Overdue' | 'Due Soon' | 'Verify' | 'Partial';
type QueuePriority = 'High' | 'Medium' | 'Low';

interface KpiCard {
  label: string;
  value: string;
  change: string;
  status: KpiStatus;
  icon: string;
}

interface FunnelStep {
  label: string;
  value: number;
  conversion: number;
  aging: string;
}

interface QueueItem {
  candidate: string;
  level: string;
  campus: string;
  issue: string;
  age: string;
  priority: QueuePriority;
}

interface QuotaItem {
  level: string;
  campus: string;
  registered: number;
  maxRegister: number;
  accepted: number;
  maxAccepted: number;
  risk: RiskStatus;
}

interface PaymentItem {
  candidate: string;
  type: string;
  amount: number;
  due: string;
  status: PaymentStatus;
}

interface SourceSchool {
  name: string;
  value: number;
}

interface ReadinessItem {
  label: string;
  value: number;
  total: number;
}

interface WaitingListItem {
  level: string;
  batch: string;
  campus: string;
  candidates: number;
  risk: RiskStatus;
}

interface DataQualityItem {
  label: string;
  value: number;
}

interface SchoolFunnel {
  campus: string;
  registered: number;
  completed: number;
  conversion: number;
  needAction: number;
  steps: FunnelStep[];
}

interface DemandRegion {
  label: string;
  country: string;
  value: number;
  x: number;
  y: number;
  status: 'high' | 'medium' | 'low';
}

interface DashboardRecord {
  year: string;
  campus: string;
  levelGroup: string;
  level: string;
  batch: string;
  registered: number;
  formComplete: number;
  registrationPaid: number;
  testScheduled: number;
  passedOrWaitingList: number;
  finalPayment: number;
  completed: number;
  canceled: number;
  maxRegister: number;
  maxAccepted: number;
  accepted: number;
  needAction: number;
  highPriority: number;
  outstanding: number;
  overdue: number;
  expectedPayment: number;
  receivedPayment: number;
  partialPayment: number;
  unpaidPayment: number;
  scheduled: number;
  present: number;
  scoresComplete: number;
  resultsPublished: number;
  waitingList: number;
  dataQuality: number;
  sourceSchools: SourceSchool[];
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  academicYears = ['All academic years', '2026/2027', '2025/2026'];
  selectedYear = 'All academic years';
  funnelMode: 'all' | 'school' = 'all';

  navItems = [
    { label: 'Dashboard', icon: 'grid-outline', active: true, hasChildren: true },
    { label: 'Agreement', icon: 'file-text-outline' },
    { label: 'Registration Form', icon: 'file-add-outline' },
    { label: 'PPDB Registration', icon: 'people-outline' },
    { label: 'Batch', icon: 'settings-2-outline' },
    { label: 'Test', icon: 'briefcase-outline', hasChildren: true },
    { label: 'Candidate', icon: 'people-outline' },
    { label: 'Candidate Transfer', icon: 'swap-outline', hasChildren: true },
    { label: 'Admission Fee Transaction', icon: 'percent-outline' },
    { label: 'Discount', icon: 'percent-outline', hasChildren: true },
    { label: 'Report', icon: 'file-text-outline', hasChildren: true },
  ];

  kpis: KpiCard[] = [];
  funnelSteps: FunnelStep[] = [];
  workQueue: QueueItem[] = [];
  quotaItems: QuotaItem[] = [];
  paymentQueue: PaymentItem[] = [];
  sourceSchools: SourceSchool[] = [];
  schoolFunnels: SchoolFunnel[] = [];
  demandRegions: DemandRegion[] = [];
  testReadiness: ReadinessItem[] = [];
  waitingList: WaitingListItem[] = [];
  dataQuality: DataQualityItem[] = [];
  paymentSummary = { expected: 0, received: 0, outstanding: 0 };
  paymentSplit = { paid: 0, partial: 0, unpaid: 0 };

  private readonly baseRecords: DashboardRecord[] = [
    this.record('2026/2027', 'Simprug', 'Kindergarten', 'K2', 'Batch 1 - Early Bird', 120, 103, 88, 78, 66, 54, 43, 3, 140, 90, 68, 18, 6, 165000000, 42000000, 480000000, 315000000, 48, 37, 78, 69, 59, 52, 18, 91, ['TK Notre Dame Puri', 'Little Stars Preschool', 'Saint Mary Primary']),
    this.record('2026/2027', 'Serpong', 'Elementary', 'Grade 1', 'Batch 2 - Regular', 214, 184, 158, 137, 112, 92, 76, 9, 230, 150, 124, 36, 14, 342000000, 98000000, 910000000, 568000000, 91, 67, 137, 109, 88, 76, 28, 84, ['Little Stars Preschool', 'Global Nusantara', 'Harapan Bangsa']),
    this.record('2026/2027', 'Bekasi', 'Elementary', 'Grade 4', 'Batch 2 - Regular', 156, 132, 116, 101, 84, 68, 51, 7, 180, 120, 88, 24, 8, 228000000, 59000000, 650000000, 422000000, 64, 42, 101, 83, 70, 62, 15, 88, ['Harapan Bangsa', 'Saint Mary Primary', 'Global Nusantara']),
    this.record('2026/2027', 'Simprug', 'Junior High', 'Grade 7', 'Batch 3 - Final', 96, 78, 61, 49, 38, 31, 24, 4, 160, 100, 52, 22, 7, 182000000, 50000000, 430000000, 248000000, 42, 30, 49, 41, 33, 29, 31, 76, ['Global Nusantara', 'Harapan Bangsa', 'BINUS School Simprug']),
    this.record('2026/2027', 'Serpong', 'Senior High', 'Grade 10', 'Batch 1 - Early Bird', 142, 122, 104, 91, 77, 64, 53, 5, 180, 120, 91, 19, 7, 205000000, 44000000, 610000000, 405000000, 58, 41, 91, 76, 64, 58, 16, 90, ['BINUS School Simprug', 'Global Nusantara', 'Harapan Bangsa']),
    this.record('2026/2027', 'Bekasi', 'Playgroup', 'Playgroup', 'Batch 1 - Early Bird', 72, 60, 48, 39, 31, 24, 20, 2, 110, 70, 39, 15, 5, 96000000, 21000000, 260000000, 164000000, 24, 18, 39, 31, 24, 20, 9, 82, ['Little Stars Preschool', 'TK Notre Dame Puri', 'Saint Mary Primary']),
    this.record('2025/2026', 'Simprug', 'Elementary', 'Grade 1', 'Batch 1 - Early Bird', 188, 164, 145, 124, 105, 91, 82, 6, 210, 140, 118, 20, 5, 198000000, 32000000, 780000000, 582000000, 54, 33, 124, 112, 96, 89, 12, 93, ['TK Notre Dame Puri', 'Little Stars Preschool', 'BINUS School Simprug']),
    this.record('2025/2026', 'Serpong', 'Junior High', 'Grade 7', 'Batch 2 - Regular', 133, 112, 94, 79, 65, 50, 43, 8, 170, 110, 80, 27, 11, 245000000, 69000000, 540000000, 295000000, 61, 44, 79, 65, 53, 47, 22, 79, ['Harapan Bangsa', 'Global Nusantara', 'Saint Mary Primary']),
    this.record('2025/2026', 'Bekasi', 'Senior High', 'Grade 10', 'Batch 3 - Final', 98, 80, 64, 55, 44, 34, 27, 5, 150, 95, 51, 21, 8, 176000000, 58000000, 410000000, 234000000, 43, 29, 55, 44, 37, 31, 19, 81, ['Global Nusantara', 'Harapan Bangsa', 'BINUS School Simprug']),
  ];

  ngOnInit(): void {
    this.updateDashboard();
  }

  updateDashboard(): void {
    const records = this.filteredRecords();
    const totals = this.sumRecords(records);
    const previousTotal = Math.round(totals.registered * this.previousPeriodFactor());

    this.kpis = [
      {
        label: 'Active Candidates',
        value: this.formatNumber(totals.registered - totals.canceled),
        change: this.formatDelta(totals.registered, previousTotal, 'vs last period'),
        status: 'primary',
        icon: 'people-outline',
      },
      {
        label: 'Need Action Today',
        value: this.formatNumber(totals.needAction),
        change: `${this.formatNumber(totals.highPriority)} high priority`,
        status: totals.highPriority > 20 ? 'danger' : 'warning',
        icon: 'alert-triangle-outline',
      },
      {
        label: 'Admission Conversion',
        value: `${this.percent(totals.completed, totals.registered)}%`,
        change: `${this.formatSigned(this.conversionLift())} pts this month`,
        status: 'success',
        icon: 'trending-up-outline',
      },
      {
        label: 'Outstanding Payment',
        value: this.formatCurrency(totals.outstanding),
        change: `${this.formatCurrency(totals.overdue)} overdue`,
        status: totals.overdue > 75000000 ? 'warning' : 'success',
        icon: 'credit-card-outline',
      },
    ];

    this.funnelSteps = this.createFunnel(totals);
    this.schoolFunnels = this.createSchoolFunnels(records);
    this.quotaItems = this.createQuota(records);
    this.workQueue = this.createWorkQueue(records);
    this.paymentQueue = this.createPaymentQueue(records);
    this.sourceSchools = this.createSourceSchools(records);
    this.demandRegions = this.createDemandRegions(totals);
    this.testReadiness = this.createReadiness(totals);
    this.waitingList = this.createWaitingList(records);
    this.dataQuality = this.createDataQuality(records);
    this.paymentSummary = {
      expected: totals.expectedPayment,
      received: totals.receivedPayment,
      outstanding: totals.outstanding,
    };
    this.paymentSplit = this.createPaymentSplit(totals);
  }

  percent(value: number, total: number): number {
    if (!total) {
      return 0;
    }

    return Math.round((value / total) * 100);
  }

  formatNumber(value: number): string {
    return new Intl.NumberFormat('en-US').format(value);
  }

  formatCurrency(value: number): string {
    if (value >= 1000000000) {
      return `Rp ${(value / 1000000000).toFixed(2)}B`;
    }

    return `Rp ${Math.round(value / 1000000)}M`;
  }

  formatPaymentAmount(value: number): string {
    return `Rp ${new Intl.NumberFormat('id-ID').format(value)}`;
  }

  maxSourceValue(): number {
    return Math.max(...this.sourceSchools.map(item => item.value), 1);
  }

  setFunnelMode(mode: 'all' | 'school'): void {
    this.funnelMode = mode;
  }

  riskClass(risk: RiskStatus): string {
    return risk.toLowerCase().replace(' ', '-');
  }

  paymentClass(status: PaymentStatus): string {
    return status.toLowerCase().replace(' ', '-');
  }

  readinessClass(item: ReadinessItem): string {
    const value = this.percent(item.value, item.total);
    if (value < 70) {
      return 'danger';
    }

    if (value < 85) {
      return 'warning';
    }

    return 'healthy';
  }

  qualityClass(value: number): string {
    if (value < 78) {
      return 'danger';
    }

    if (value < 88) {
      return 'warning';
    }

    return 'healthy';
  }

  queueClass(priority: QueuePriority): string {
    return priority.toLowerCase();
  }

  private filteredRecords(): DashboardRecord[] {
    if (this.selectedYear === 'All academic years') {
      return this.baseRecords;
    }

    return this.baseRecords.filter(record => record.year === this.selectedYear);
  }

  private sumRecords(records: DashboardRecord[]): DashboardRecord {
    return records.reduce((total, record) => ({
      ...total,
      registered: total.registered + record.registered,
      formComplete: total.formComplete + record.formComplete,
      registrationPaid: total.registrationPaid + record.registrationPaid,
      testScheduled: total.testScheduled + record.testScheduled,
      passedOrWaitingList: total.passedOrWaitingList + record.passedOrWaitingList,
      finalPayment: total.finalPayment + record.finalPayment,
      completed: total.completed + record.completed,
      canceled: total.canceled + record.canceled,
      maxRegister: total.maxRegister + record.maxRegister,
      maxAccepted: total.maxAccepted + record.maxAccepted,
      accepted: total.accepted + record.accepted,
      needAction: total.needAction + record.needAction,
      highPriority: total.highPriority + record.highPriority,
      outstanding: total.outstanding + record.outstanding,
      overdue: total.overdue + record.overdue,
      expectedPayment: total.expectedPayment + record.expectedPayment,
      receivedPayment: total.receivedPayment + record.receivedPayment,
      partialPayment: total.partialPayment + record.partialPayment,
      unpaidPayment: total.unpaidPayment + record.unpaidPayment,
      scheduled: total.scheduled + record.scheduled,
      present: total.present + record.present,
      scoresComplete: total.scoresComplete + record.scoresComplete,
      resultsPublished: total.resultsPublished + record.resultsPublished,
      waitingList: total.waitingList + record.waitingList,
      dataQuality: total.dataQuality + record.dataQuality,
    }), this.emptyRecord());
  }

  private createFunnel(totals: DashboardRecord): FunnelStep[] {
    const steps = [
      ['Registered', totals.registered, 0.8],
      ['Form Complete', totals.formComplete, 1.4],
      ['Reg. Payment Paid', totals.registrationPaid, 2.1],
      ['Test Scheduled', totals.testScheduled, 3.7],
      ['Passed / WL', totals.passedOrWaitingList, 4.9],
      ['Final Payment', totals.finalPayment, 5.6],
      ['Completed', totals.completed, 6.2],
    ] as Array<[string, number, number]>;

    return steps.map(([label, value, baseAging]) => ({
      label,
      value,
      conversion: this.percent(value, totals.registered),
      aging: `${(baseAging * this.agingFactor()).toFixed(1)}d`,
    }));
  }

  private createSchoolFunnels(records: DashboardRecord[]): SchoolFunnel[] {
    const groups = records.reduce((schoolMap, record) => {
      const list = schoolMap.get(record.campus) || [];
      list.push(record);
      schoolMap.set(record.campus, list);
      return schoolMap;
    }, new Map<string, DashboardRecord[]>());

    return Array.from(groups.entries())
      .map(([campus, schoolRecords]) => {
        const totals = this.sumRecords(schoolRecords);
        return {
          campus,
          registered: totals.registered,
          completed: totals.completed,
          conversion: this.percent(totals.completed, totals.registered),
          needAction: totals.needAction,
          steps: this.createFunnel(totals),
        };
      })
      .sort((left, right) => right.registered - left.registered);
  }

  private createQuota(records: DashboardRecord[]): QuotaItem[] {
    return records.map(record => {
      const usage = this.percent(record.accepted, record.maxAccepted);
      let risk: RiskStatus = 'Healthy';

      if (usage >= 100) {
        risk = 'Full';
      } else if (usage >= 85) {
        risk = 'Near Full';
      } else if (this.percent(record.registered, record.maxRegister) < 65) {
        risk = 'Low Demand';
      }

      return {
        level: record.level,
        campus: record.campus,
        registered: record.registered,
        maxRegister: record.maxRegister,
        accepted: record.accepted,
        maxAccepted: record.maxAccepted,
        risk,
      };
    }).slice(0, 5);
  }

  private createWorkQueue(records: DashboardRecord[]): QueueItem[] {
    const issueMap = ['Final payment proof waiting verification', 'Registration form missing parent phone', 'Discount approval pending', 'Test result not published', 'Email verification resend needed'];
    return records.reduce((queueItems: QueueItem[], record: DashboardRecord, index: number) => {
      const count = Math.max(1, Math.min(2, Math.ceil(record.needAction / 25)));
      const recordItems = Array.from({ length: count }).map((_, queueIndex) => ({
        candidate: this.candidateName(index + queueIndex),
        level: record.level,
        campus: record.campus,
        issue: issueMap[(index + queueIndex) % issueMap.length],
        age: `${Math.max(1, Math.round(record.needAction / 8) + queueIndex)}d ${queueIndex ? '4h' : '8h'}`,
        priority: record.highPriority > 10 ? 'High' : record.needAction > 18 ? 'Medium' : 'Low',
      } as QueueItem));

      return queueItems.concat(recordItems);
    }, []).slice(0, 5);
  }

  private createPaymentQueue(records: DashboardRecord[]): PaymentItem[] {
    const statuses: PaymentStatus[] = ['Verify', 'Overdue', 'Due Soon', 'Partial'];
    return records.map((record, index) => ({
      candidate: this.candidateName(index + 5),
      type: index % 2 === 0 ? 'Final Payment' : 'Registration Fee',
      amount: Math.max(750000, Math.round(record.outstanding / Math.max(record.needAction, 1))),
      due: `${25 + (index % 6)} Aug`,
      status: statuses[index % statuses.length],
    })).slice(0, 4);
  }

  private createSourceSchools(records: DashboardRecord[]): SourceSchool[] {
    const sourceMap = new Map<string, number>();

    records.forEach(record => {
      record.sourceSchools.forEach((school, index) => {
        sourceMap.set(school.name, (sourceMap.get(school.name) || 0) + Math.round(record.registered / (index + 3)));
      });
    });

    return Array.from(sourceMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((left, right) => right.value - left.value)
      .slice(0, 5);
  }

  private createDemandRegions(totals: DashboardRecord): DemandRegion[] {
    const total = Math.max(totals.registered, 1);
    const regions: DemandRegion[] = [
      { label: 'Greater Jakarta', country: 'Indonesia', value: Math.round(total * 0.72), x: 69, y: 60, status: 'high' },
      { label: 'Bandung', country: 'Indonesia', value: Math.round(total * 0.09), x: 67, y: 62, status: 'medium' },
      { label: 'Surabaya', country: 'Indonesia', value: Math.round(total * 0.07), x: 71, y: 63, status: 'medium' },
      { label: 'Singapore', country: 'Singapore', value: Math.round(total * 0.05), x: 68, y: 57, status: 'low' },
      { label: 'Kuala Lumpur', country: 'Malaysia', value: Math.round(total * 0.04), x: 67, y: 56, status: 'low' },
      { label: 'Overseas', country: 'Global', value: Math.round(total * 0.03), x: 42, y: 45, status: 'low' },
    ];

    return regions.filter(region => region.value > 0);
  }

  private createReadiness(totals: DashboardRecord): ReadinessItem[] {
    return [
      { label: 'Scheduled', value: totals.scheduled, total: totals.registrationPaid },
      { label: 'Present', value: totals.present, total: totals.scheduled },
      { label: 'Scores Complete', value: totals.scoresComplete, total: totals.present },
      { label: 'Results Published', value: totals.resultsPublished, total: totals.scoresComplete },
    ];
  }

  private createWaitingList(records: DashboardRecord[]): WaitingListItem[] {
    return records
      .filter(record => record.waitingList > 0)
      .map(record => {
        const risk: RiskStatus = record.waitingList > 25 ? 'Near Full' : record.waitingList < 12 ? 'Healthy' : 'Low Demand';

        return {
          level: record.level,
          batch: record.batch.replace('Batch ', 'Target Batch '),
          campus: record.campus,
          candidates: record.waitingList,
          risk,
        };
      })
      .slice(0, 4);
  }

  private createDataQuality(records: DashboardRecord[]): DataQualityItem[] {
    const average = records.length ? Math.round(records.reduce((sum, record) => sum + record.dataQuality, 0) / records.length) : 0;

    return [
      { label: 'Complete parent contact', value: Math.min(99, average + 3) },
      { label: 'Required files uploaded', value: Math.max(0, average - 4) },
      { label: 'Verified candidate email', value: Math.max(0, average - 10) },
      { label: 'No duplicate indicators', value: Math.min(99, average + 7) },
    ];
  }

  private createPaymentSplit(totals: DashboardRecord): { paid: number; partial: number; unpaid: number } {
    const expected = totals.expectedPayment || 1;
    const paid = this.percent(totals.receivedPayment, expected);
    const partial = this.percent(totals.partialPayment, expected);

    return {
      paid: Math.min(paid, 100),
      partial: Math.min(partial, Math.max(0, 100 - paid)),
      unpaid: Math.max(0, 100 - paid - partial),
    };
  }

  private record(
    year: string,
    campus: string,
    levelGroup: string,
    level: string,
    batch: string,
    registered: number,
    formComplete: number,
    registrationPaid: number,
    testScheduled: number,
    passedOrWaitingList: number,
    finalPayment: number,
    completed: number,
    canceled: number,
    maxRegister: number,
    maxAccepted: number,
    accepted: number,
    needAction: number,
    highPriority: number,
    outstanding: number,
    overdue: number,
    expectedPayment: number,
    receivedPayment: number,
    partialPayment: number,
    unpaidPayment: number,
    scheduled: number,
    present: number,
    scoresComplete: number,
    resultsPublished: number,
    waitingList: number,
    dataQuality: number,
    sources: string[],
  ): DashboardRecord {
    return {
      year,
      campus,
      levelGroup,
      level,
      batch,
      registered,
      formComplete,
      registrationPaid,
      testScheduled,
      passedOrWaitingList,
      finalPayment,
      completed,
      canceled,
      maxRegister,
      maxAccepted,
      accepted,
      needAction,
      highPriority,
      outstanding,
      overdue,
      expectedPayment,
      receivedPayment,
      partialPayment,
      unpaidPayment,
      scheduled,
      present,
      scoresComplete,
      resultsPublished,
      waitingList,
      dataQuality,
      sourceSchools: sources.map((name, index) => ({ name, value: Math.round(registered / (index + 3)) })),
    };
  }

  private emptyRecord(): DashboardRecord {
    return this.record('', '', '', '', '', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, []);
  }

  private candidateName(index: number): string {
    const names = ['Alya Putri', 'Jason Tan', 'Nabila Sari', 'Rafi Wijaya', 'Michael Hartono', 'Keisha Amanda', 'Darren Lim', 'Zahra Putri', 'Bryan Pratama'];
    return names[index % names.length];
  }

  private previousPeriodFactor(): number {
    return this.selectedYear === '2025/2026' ? 1.08 : 0.9;
  }

  private conversionLift(): number {
    if (this.selectedYear === 'All academic years') {
      return 2.8;
    }

    return this.selectedYear === '2026/2027' ? 4.2 : -1.6;
  }

  private agingFactor(): number {
    return this.selectedYear === '2025/2026' ? 0.92 : 1;
  }

  private formatDelta(current: number, previous: number, suffix: string): string {
    if (!previous) {
      return `0% ${suffix}`;
    }

    const delta = Math.round(((current - previous) / previous) * 100);
    return `${this.formatSigned(delta)}% ${suffix}`;
  }

  private formatSigned(value: number): string {
    return value > 0 ? `+${value}` : `${value}`;
  }
}
