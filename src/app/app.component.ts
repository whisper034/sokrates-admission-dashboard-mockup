import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import * as L from 'leaflet';

type KpiStatus = 'success' | 'warning' | 'danger' | 'info' | 'primary';
type RiskStatus = 'Full' | 'Near Full' | 'Healthy' | 'Low Demand';
type PaymentStatus = 'Overdue' | 'Due Soon' | 'Verify' | 'Partial';
type QueuePriority = 'High' | 'Medium' | 'Low';
type Language = 'en' | 'id';

interface KpiCard {
  labelKey: string;
  label: string;
  value: string;
  change: string;
  status: KpiStatus;
  icon: string;
}

interface FunnelStep {
  key: string;
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
  lat: number;
  lng: number;
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
export class AppComponent implements OnInit, AfterViewInit, OnDestroy {
  academicYears = ['all', '2026/2027', '2025/2026'];
  selectedYear = 'all';
  funnelMode: 'all' | 'school' = 'all';
  selectedLanguage: Language = 'en';
  languageOptions = [
    { value: 'en' as Language, label: 'English', badge: 'en' },
    { value: 'id' as Language, label: 'Indonesia', badge: 'id' },
  ];

  navItems = [
    { label: 'Dashboard', labelKey: 'dashboard', icon: 'grid-outline', active: true, hasChildren: true },
    { label: 'Agreement', labelKey: 'agreement', icon: 'file-text-outline' },
    { label: 'Registration Form', labelKey: 'registrationForm', icon: 'file-add-outline' },
    { label: 'PPDB Registration', labelKey: 'ppdbRegistration', icon: 'people-outline' },
    { label: 'Batch', labelKey: 'batch', icon: 'settings-2-outline' },
    { label: 'Test', labelKey: 'test', icon: 'briefcase-outline', hasChildren: true },
    { label: 'Candidate', labelKey: 'candidate', icon: 'people-outline' },
    { label: 'Candidate Transfer', labelKey: 'candidateTransfer', icon: 'swap-outline', hasChildren: true },
    { label: 'Admission Fee Transaction', labelKey: 'admissionFeeTransaction', icon: 'percent-outline' },
    { label: 'Discount', labelKey: 'discount', icon: 'percent-outline', hasChildren: true },
    { label: 'Report', labelKey: 'report', icon: 'file-text-outline', hasChildren: true },
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
  private demandMap?: any;
  private demandLayer?: any;

  private readonly baseRecords: DashboardRecord[] = [
    this.record('2026/2027', 'Simprug', 'Kindergarten', 'K2', 'Batch 1 - Early Bird', 120, 103, 88, 78, 66, 54, 43, 3, 140, 90, 68, 18, 6, 165000000, 42000000, 480000000, 315000000, 48, 37, 78, 69, 59, 52, 18, 91, ['TK Notre Dame Puri', 'Little Stars Preschool', 'Saint Mary Primary']),
    this.record('2026/2027', 'Serpong', 'Elementary', 'Grade 1', 'Batch 2 - Regular', 214, 184, 158, 137, 112, 92, 76, 9, 230, 150, 124, 36, 14, 342000000, 98000000, 910000000, 568000000, 91, 67, 137, 109, 88, 76, 28, 84, ['Little Stars Preschool', 'Global Nusantara', 'Harapan Bangsa']),
    this.record('2026/2027', 'Bekasi', 'Elementary', 'Grade 4', 'Batch 2 - Regular', 156, 132, 116, 101, 84, 68, 51, 7, 180, 120, 88, 24, 8, 228000000, 59000000, 650000000, 422000000, 64, 42, 101, 83, 70, 62, 15, 88, ['Harapan Bangsa', 'Saint Mary Primary', 'Global Nusantara']),
    this.record('2026/2027', 'Simprug', 'Junior High', 'Grade 7', 'Batch 3 - Final', 96, 78, 61, 49, 38, 31, 24, 4, 160, 100, 52, 22, 7, 182000000, 50000000, 430000000, 248000000, 42, 30, 49, 41, 33, 29, 31, 76, ['Global Nusantara', 'Harapan Bangsa', 'BINUS School Simprug']),
    this.record('2026/2027', 'Serpong', 'Senior High', 'Grade 10', 'Batch 1 - Early Bird', 142, 122, 104, 91, 77, 64, 53, 5, 180, 120, 91, 19, 7, 205000000, 44000000, 610000000, 405000000, 58, 41, 91, 76, 64, 58, 16, 90, ['BINUS School Simprug', 'Global Nusantara', 'Harapan Bangsa']),
    this.record('2026/2027', 'Bekasi', 'Playgroup', 'Playgroup', 'Batch 1 - Early Bird', 72, 60, 48, 39, 31, 24, 20, 2, 110, 70, 39, 15, 5, 96000000, 21000000, 260000000, 164000000, 24, 18, 39, 31, 24, 20, 9, 82, ['Little Stars Preschool', 'TK Notre Dame Puri', 'Saint Mary Primary']),
    this.record('2026/2027', 'Puri', 'Elementary', 'Grade 2', 'Batch 2 - Regular', 138, 119, 98, 82, 67, 56, 45, 4, 175, 115, 72, 21, 6, 176000000, 37000000, 560000000, 384000000, 49, 36, 82, 68, 57, 50, 14, 86, ['TK Notre Dame Puri', 'Global Nusantara', 'Little Stars Preschool']),
    this.record('2026/2027', 'Cibubur', 'Junior High', 'Grade 8', 'Batch 3 - Final', 84, 68, 52, 43, 34, 27, 21, 3, 145, 95, 43, 17, 5, 132000000, 39000000, 350000000, 218000000, 34, 27, 43, 34, 28, 23, 20, 78, ['Harapan Bangsa', 'Saint Mary Primary', 'Global Nusantara']),
    this.record('2025/2026', 'Simprug', 'Elementary', 'Grade 1', 'Batch 1 - Early Bird', 188, 164, 145, 124, 105, 91, 82, 6, 210, 140, 118, 20, 5, 198000000, 32000000, 780000000, 582000000, 54, 33, 124, 112, 96, 89, 12, 93, ['TK Notre Dame Puri', 'Little Stars Preschool', 'BINUS School Simprug']),
    this.record('2025/2026', 'Serpong', 'Junior High', 'Grade 7', 'Batch 2 - Regular', 133, 112, 94, 79, 65, 50, 43, 8, 170, 110, 80, 27, 11, 245000000, 69000000, 540000000, 295000000, 61, 44, 79, 65, 53, 47, 22, 79, ['Harapan Bangsa', 'Global Nusantara', 'Saint Mary Primary']),
    this.record('2025/2026', 'Bekasi', 'Senior High', 'Grade 10', 'Batch 3 - Final', 98, 80, 64, 55, 44, 34, 27, 5, 150, 95, 51, 21, 8, 176000000, 58000000, 410000000, 234000000, 43, 29, 55, 44, 37, 31, 19, 81, ['Global Nusantara', 'Harapan Bangsa', 'BINUS School Simprug']),
    this.record('2025/2026', 'Alam Sutera', 'Kindergarten', 'K1', 'Batch 2 - Regular', 108, 91, 74, 61, 48, 39, 31, 4, 150, 100, 58, 16, 4, 124000000, 28000000, 420000000, 296000000, 36, 26, 61, 51, 42, 36, 13, 87, ['Little Stars Preschool', 'TK Notre Dame Puri', 'Harapan Bangsa']),
    this.record('2025/2026', 'Kelapa Gading', 'Elementary', 'Grade 3', 'Batch 1 - Early Bird', 126, 107, 88, 74, 59, 48, 38, 4, 165, 110, 67, 18, 5, 146000000, 31000000, 500000000, 354000000, 42, 31, 74, 62, 50, 43, 15, 85, ['Saint Mary Primary', 'Global Nusantara', 'Little Stars Preschool']),
  ];

  private readonly translations: Record<Language, Record<string, string>> = {
    en: {
      dashboard: 'Dashboard',
      overview: 'Overview',
      workQueue: 'Work Queue',
      quotaHealth: 'Quota Health',
      payments: 'Payments',
      agreement: 'Agreement',
      registrationForm: 'Registration Form',
      ppdbRegistration: 'PPDB Registration',
      batch: 'Batch',
      test: 'Test',
      candidate: 'Candidate',
      candidateTransfer: 'Candidate Transfer',
      admissionFeeTransaction: 'Admission Fee Transaction',
      discount: 'Discount',
      report: 'Report',
      offline: 'Offline',
      admissionDashboard: 'Admission Dashboard',
      dailyAdmissionOverview: 'Daily admission overview',
      admissionFunnelOverview: 'Admission Funnel Overview',
      exportSummary: 'Export Summary',
      showing: 'Showing',
      academicYear: 'Academic year',
      activeCandidates: 'Active Candidates',
      needActionToday: 'Need Action Today',
      admissionConversion: 'Admission Conversion',
      outstandingPayment: 'Outstanding Payment',
      vsLastPeriod: 'vs last period',
      highPriority: 'high priority',
      ptsThisMonth: 'pts this month',
      overdue: 'overdue',
      registered: 'Registered',
      formComplete: 'Form Complete',
      registrationPaid: 'Reg. Payment Paid',
      testScheduled: 'Test Scheduled',
      passedOrWaitingList: 'Passed / WL',
      finalPayment: 'Final Payment',
      completed: 'Completed',
      scheduled: 'Scheduled',
      present: 'Present',
      scoresComplete: 'Scores Complete',
      resultsPublished: 'Results Published',
      allAcademicYears: 'All academic years',
      pipelineHealth: 'Pipeline health',
      conversionLegend: 'Blue shows conversion from registered candidates',
      allSchools: 'All Schools',
      perSchool: 'Per School',
      candidates: 'candidates',
      tasks: 'tasks',
      toDoList: 'To-Do List',
      openAdminTasks: 'Open admin tasks',
      task: 'Task',
      student: 'Student',
      age: 'Age',
      priority: 'priority',
      high: 'High',
      medium: 'Medium',
      low: 'Low',
      finalPaymentProof: 'Final payment proof waiting verification',
      missingParentPhone: 'Registration form missing parent phone',
      discountApproval: 'Discount approval pending',
      testResultNotPublished: 'Test result not published',
      emailVerification: 'Email verification resend needed',
      registrationFee: 'Registration Fee',
      parentContact: 'Complete parent contact',
      filesUploaded: 'Required files uploaded',
      candidateEmail: 'Verified candidate email',
      duplicateCheck: 'No duplicate indicators',
      targetBatch: 'Target Batch',
      quotaTitle: 'Quota and Capacity Health',
      seatUsage: 'Seat usage',
      full: 'Full',
      nearFull: 'Near Full',
      healthy: 'Healthy',
      lowDemand: 'Low Demand',
      registeredShort: 'Registered',
      acceptedShort: 'Accepted',
      paymentTitle: 'Payment and Collection',
      collectionStatus: 'Collection status',
      expected: 'Expected',
      received: 'Received',
      outstanding: 'Outstanding',
      paid: 'Paid',
      partial: 'Partial',
      unpaid: 'Unpaid',
      paidLegend: 'Paid or received payment',
      partialLegend: 'Partially paid',
      unpaidLegend: 'Unpaid balance',
      readinessTitle: 'Test Readiness',
      selectionProgress: 'Selection progress',
      onTrack: 'On track',
      watch: 'Watch',
      atRisk: 'At risk',
      of: 'of',
      sourceTitle: 'Candidate Source and Demand',
      demandByRegion: 'Demand by region',
      sourceVolume: 'Source volume',
      sourceLegend: 'Blue shows candidate volume by source school',
      waitingTitle: 'Waiting List and Re-register',
      batchMovement: 'Batch movement',
      level: 'Level',
      risk: 'Risk',
      dataQualityTitle: 'Registration Form Data Quality',
      recordCompleteness: 'Record completeness',
      qualityGreen: 'Complete >= 88%',
      qualityYellow: 'Review 78-87%',
      qualityRed: 'Fix < 78%',
    },
    id: {
      dashboard: 'Dashboard',
      overview: 'Ikhtisar',
      workQueue: 'Daftar Kerja',
      quotaHealth: 'Kesehatan Kuota',
      payments: 'Pembayaran',
      agreement: 'Persetujuan',
      registrationForm: 'Formulir Registrasi',
      ppdbRegistration: 'Registrasi PPDB',
      batch: 'Batch',
      test: 'Tes',
      candidate: 'Kandidat',
      candidateTransfer: 'Transfer Kandidat',
      admissionFeeTransaction: 'Transaksi Biaya Masuk',
      discount: 'Diskon',
      report: 'Laporan',
      offline: 'Offline',
      admissionDashboard: 'Dashboard Penerimaan',
      dailyAdmissionOverview: 'Ikhtisar penerimaan harian',
      admissionFunnelOverview: 'Ikhtisar Alur Penerimaan',
      exportSummary: 'Ekspor Ringkasan',
      showing: 'Menampilkan',
      academicYear: 'Tahun akademik',
      activeCandidates: 'Kandidat Aktif',
      needActionToday: 'Perlu Ditindaklanjuti',
      admissionConversion: 'Konversi Penerimaan',
      outstandingPayment: 'Pembayaran Belum Lunas',
      vsLastPeriod: 'dibanding periode lalu',
      highPriority: 'prioritas tinggi',
      ptsThisMonth: 'poin bulan ini',
      overdue: 'terlambat',
      registered: 'Terdaftar',
      formComplete: 'Form Lengkap',
      registrationPaid: 'Pembayaran Registrasi',
      testScheduled: 'Jadwal Tes',
      passedOrWaitingList: 'Lulus / Waiting List',
      finalPayment: 'Pembayaran Akhir',
      completed: 'Selesai',
      scheduled: 'Terjadwal',
      present: 'Hadir',
      scoresComplete: 'Nilai Lengkap',
      resultsPublished: 'Hasil Dipublikasikan',
      allAcademicYears: 'Semua tahun akademik',
      pipelineHealth: 'Kesehatan alur',
      conversionLegend: 'Biru menunjukkan konversi dari kandidat terdaftar',
      allSchools: 'Semua Sekolah',
      perSchool: 'Per Sekolah',
      candidates: 'kandidat',
      tasks: 'tugas',
      toDoList: 'Daftar Tugas',
      openAdminTasks: 'Tugas admin terbuka',
      task: 'Tugas',
      student: 'Siswa',
      age: 'Umur',
      priority: 'prioritas',
      high: 'Tinggi',
      medium: 'Sedang',
      low: 'Rendah',
      finalPaymentProof: 'Bukti pembayaran akhir menunggu verifikasi',
      missingParentPhone: 'Nomor telepon orang tua belum lengkap',
      discountApproval: 'Persetujuan diskon tertunda',
      testResultNotPublished: 'Hasil tes belum dipublikasikan',
      emailVerification: 'Perlu kirim ulang verifikasi email',
      registrationFee: 'Biaya Registrasi',
      parentContact: 'Kontak orang tua lengkap',
      filesUploaded: 'Berkas wajib terunggah',
      candidateEmail: 'Email kandidat terverifikasi',
      duplicateCheck: 'Tidak ada indikasi duplikat',
      targetBatch: 'Batch Tujuan',
      quotaTitle: 'Kesehatan Kuota dan Kapasitas',
      seatUsage: 'Pemakaian kursi',
      full: 'Penuh',
      nearFull: 'Hampir Penuh',
      healthy: 'Sehat',
      lowDemand: 'Permintaan Rendah',
      registeredShort: 'Terdaftar',
      acceptedShort: 'Diterima',
      paymentTitle: 'Pembayaran dan Penagihan',
      collectionStatus: 'Status penagihan',
      expected: 'Target',
      received: 'Diterima',
      outstanding: 'Belum Lunas',
      paid: 'Lunas',
      partial: 'Sebagian',
      unpaid: 'Belum Lunas',
      paidLegend: 'Pembayaran lunas atau diterima',
      partialLegend: 'Pembayaran sebagian',
      unpaidLegend: 'Sisa belum dibayar',
      readinessTitle: 'Kesiapan Tes',
      selectionProgress: 'Progres seleksi',
      onTrack: 'Aman',
      watch: 'Perlu dipantau',
      atRisk: 'Berisiko',
      of: 'dari',
      sourceTitle: 'Sumber Kandidat dan Permintaan',
      demandByRegion: 'Permintaan per wilayah',
      sourceVolume: 'Volume sumber',
      sourceLegend: 'Biru menunjukkan volume kandidat per sekolah asal',
      waitingTitle: 'Waiting List dan Daftar Ulang',
      batchMovement: 'Pergerakan batch',
      level: 'Jenjang',
      risk: 'Risiko',
      dataQualityTitle: 'Kualitas Data Formulir Registrasi',
      recordCompleteness: 'Kelengkapan data',
      qualityGreen: 'Lengkap >= 88%',
      qualityYellow: 'Tinjau 78-87%',
      qualityRed: 'Perbaiki < 78%',
    },
  };

  ngOnInit(): void {
    this.updateDashboard();
  }

  ngAfterViewInit(): void {
    this.initializeDemandMap();
  }

  ngOnDestroy(): void {
    this.demandMap?.remove();
  }

  updateDashboard(): void {
    const records = this.filteredRecords();
    const totals = this.sumRecords(records);
    const previousTotal = Math.round(totals.registered * this.previousPeriodFactor());

    const kpis: KpiCard[] = [
      {
        labelKey: 'activeCandidates',
        label: 'Active Candidates',
        value: this.formatNumber(totals.registered - totals.canceled),
        change: this.formatDelta(totals.registered, previousTotal, this.t('vsLastPeriod')),
        status: 'primary',
        icon: 'people-outline',
      },
      {
        labelKey: 'needActionToday',
        label: 'Need Action Today',
        value: this.formatNumber(totals.needAction),
        change: `${this.formatNumber(totals.highPriority)} ${this.t('highPriority')}`,
        status: totals.highPriority > 20 ? 'danger' : 'warning',
        icon: 'alert-triangle-outline',
      },
      {
        labelKey: 'admissionConversion',
        label: 'Admission Conversion',
        value: `${this.percent(totals.completed, totals.registered)}%`,
        change: `${this.formatSigned(this.conversionLift())} ${this.t('ptsThisMonth')}`,
        status: 'success',
        icon: 'trending-up-outline',
      },
      {
        labelKey: 'outstandingPayment',
        label: 'Outstanding Payment',
        value: this.formatCurrency(totals.outstanding),
        change: `${this.formatCurrency(totals.overdue)} ${this.t('overdue')}`,
        status: totals.overdue > 75000000 ? 'warning' : 'success',
        icon: 'credit-card-outline',
      },
    ];

    this.kpis = kpis.map(kpi => ({ ...kpi, label: this.t(kpi.labelKey) }));

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
    this.refreshDemandMap();
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

  t(key: string): string {
    return this.translations[this.selectedLanguage][key] || key;
  }

  academicYearLabel(year: string): string {
    return year === 'all' ? this.t('allAcademicYears') : year;
  }

  maxSourceValue(): number {
    return Math.max(...this.sourceSchools.map(item => item.value), 1);
  }

  setFunnelMode(mode: 'all' | 'school'): void {
    this.funnelMode = mode;
  }

  switchLanguage(language: Language): void {
    this.selectedLanguage = language;
    this.updateDashboard();
  }

  currentLanguageLabel(): string {
    return this.languageOptions.find(option => option.value === this.selectedLanguage)?.badge || 'en';
  }

  riskClass(risk: RiskStatus): string {
    return risk.toLowerCase().replace(/\s+/g, '-');
  }

  paymentClass(status: PaymentStatus): string {
    return status.toLowerCase().replace(/\s+/g, '-');
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

  riskLabel(risk: RiskStatus): string {
    const keys: Record<RiskStatus, string> = {
      Full: 'full',
      'Near Full': 'nearFull',
      Healthy: 'healthy',
      'Low Demand': 'lowDemand',
    };

    return this.t(keys[risk]);
  }

  priorityLabel(priority: QueuePriority): string {
    const keys: Record<QueuePriority, string> = {
      High: 'high',
      Medium: 'medium',
      Low: 'low',
    };

    return this.t(keys[priority]);
  }

  private filteredRecords(): DashboardRecord[] {
    if (this.selectedYear === 'all') {
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
      ['registered', totals.registered, 0.8],
      ['formComplete', totals.formComplete, 1.4],
      ['registrationPaid', totals.registrationPaid, 2.1],
      ['testScheduled', totals.testScheduled, 3.7],
      ['passedOrWaitingList', totals.passedOrWaitingList, 4.9],
      ['finalPayment', totals.finalPayment, 5.6],
      ['completed', totals.completed, 6.2],
    ] as Array<[string, number, number]>;

    return steps.map(([key, value, baseAging]) => ({
      key,
      label: this.t(key),
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
    const issueMap = ['finalPaymentProof', 'missingParentPhone', 'discountApproval', 'testResultNotPublished', 'emailVerification'];
    return records.reduce((queueItems: QueueItem[], record: DashboardRecord, index: number) => {
      const count = Math.max(1, Math.min(2, Math.ceil(record.needAction / 25)));
      const recordItems = Array.from({ length: count }).map((_, queueIndex) => ({
        candidate: this.candidateName(index + queueIndex),
        level: record.level,
        campus: record.campus,
        issue: this.t(issueMap[(index + queueIndex) % issueMap.length]),
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
      type: index % 2 === 0 ? this.t('finalPayment') : this.t('registrationFee'),
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
      { label: 'Greater Jakarta', country: 'Indonesia', value: Math.round(total * 0.72), lat: -6.2088, lng: 106.8456, status: 'high' },
      { label: 'Bandung', country: 'Indonesia', value: Math.round(total * 0.09), lat: -6.9175, lng: 107.6191, status: 'medium' },
      { label: 'Surabaya', country: 'Indonesia', value: Math.round(total * 0.07), lat: -7.2575, lng: 112.7521, status: 'medium' },
      { label: 'Singapore', country: 'Singapore', value: Math.round(total * 0.05), lat: 1.3521, lng: 103.8198, status: 'low' },
      { label: 'Kuala Lumpur', country: 'Malaysia', value: Math.round(total * 0.04), lat: 3.139, lng: 101.6869, status: 'low' },
      { label: 'Overseas', country: 'Global', value: Math.round(total * 0.03), lat: 13.7563, lng: 100.5018, status: 'low' },
    ];

    return regions.filter(region => region.value > 0);
  }

  private initializeDemandMap(): void {
    const mapElement = document.getElementById('demand-map');
    if (!mapElement || this.demandMap) {
      return;
    }

    this.demandMap = L.map(mapElement, {
      attributionControl: false,
      zoomControl: false,
      scrollWheelZoom: false,
      dragging: true,
      doubleClickZoom: false,
    }).setView([-3.9, 110.2], 4);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 12,
      minZoom: 3,
    }).addTo(this.demandMap);

    L.control.attribution({ prefix: '' }).addTo(this.demandMap);
    this.demandLayer = L.layerGroup().addTo(this.demandMap);
    this.refreshDemandMap();

    setTimeout(() => this.demandMap?.invalidateSize(), 100);
  }

  private refreshDemandMap(): void {
    if (!this.demandMap || !this.demandLayer) {
      return;
    }

    const demandLayer = this.demandLayer;
    demandLayer.clearLayers();
    const maxValue = Math.max(...this.demandRegions.map(region => region.value), 1);

    this.demandRegions.forEach(region => {
      const marker = L.circleMarker([region.lat, region.lng], {
        radius: 8 + (region.value / maxValue) * 14,
        color: '#ffffff',
        weight: 2,
        fillColor: this.mapColor(region.status),
        fillOpacity: 0.82,
      }).bindTooltip(
        `<strong>${region.label}</strong><br>${region.country}<br>${this.formatNumber(region.value)} ${this.t('candidates')}`,
        { direction: 'top', opacity: 0.95 },
      );

      marker.addTo(demandLayer);
    });
  }

  private mapColor(status: DemandRegion['status']): string {
    if (status === 'high') {
      return '#ff3d71';
    }

    if (status === 'medium') {
      return '#ffaa00';
    }

    return '#00a974';
  }

  private createReadiness(totals: DashboardRecord): ReadinessItem[] {
    return [
      { label: this.t('scheduled'), value: totals.scheduled, total: totals.registrationPaid },
      { label: this.t('present'), value: totals.present, total: totals.scheduled },
      { label: this.t('scoresComplete'), value: totals.scoresComplete, total: totals.present },
      { label: this.t('resultsPublished'), value: totals.resultsPublished, total: totals.scoresComplete },
    ];
  }

  private createWaitingList(records: DashboardRecord[]): WaitingListItem[] {
    return records
      .filter(record => record.waitingList > 0)
      .map(record => {
        const risk: RiskStatus = record.waitingList > 25 ? 'Near Full' : record.waitingList < 12 ? 'Healthy' : 'Low Demand';

        return {
          level: record.level,
          batch: record.batch.replace('Batch', this.t('targetBatch')),
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
      { label: this.t('parentContact'), value: Math.min(99, average + 3) },
      { label: this.t('filesUploaded'), value: Math.max(0, average - 4) },
      { label: this.t('candidateEmail'), value: Math.max(0, average - 10) },
      { label: this.t('duplicateCheck'), value: Math.min(99, average + 7) },
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
    if (this.selectedYear === 'all') {
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
