export const RESERVATION_STATUS_LABELS: Record<string, string> = {
  pending: '결제 대기',
  confirmed: '예약 확정',
  cancelled: '예약 취소',
  completed: '검진 완료',
  no_show: '미방문',
};

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  ready: '결제 대기',
  paid: '결제 완료',
  cancelled: '결제 취소',
  partial_cancelled: '부분 취소',
  failed: '결제 실패',
};

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  card: '신용카드',
  kakaopay: '카카오페이',
  naverpay: '네이버페이',
  tosspay: '토스페이',
  bank_transfer: '계좌이체',
  virtual_account: '가상계좌',
};

export const PACKAGE_CATEGORY_LABELS: Record<string, string> = {
  basic: '기본 검진',
  standard: '정밀 검진',
  premium: '프리미엄 검진',
  specialized: '특화 검진',
};

export const GENDER_LABELS: Record<string, string> = {
  male: '남성',
  female: '여성',
  all: '공통',
};

export const DAY_OF_WEEK_LABELS = ['일', '월', '화', '수', '목', '금', '토'];
