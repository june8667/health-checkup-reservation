import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useReservationStore } from '../../store/reservationStore';
import { useAuthStore } from '../../store/authStore';
import { getMe } from '../../api/auth';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

const patientSchema = z.object({
  name: z.string().min(2, '이름은 2자 이상이어야 합니다.'),
  phone: z.string().regex(/^01[0-9]{8,9}$/, '올바른 휴대폰 번호 형식이 아닙니다.'),
  birthDate: z.string().regex(/^\d{8}$/, '생년월일 8자리를 입력해주세요. (예: 19900101)'),
  gender: z.enum(['male', 'female'], { required_error: '성별을 선택해주세요.' }),
});

type PatientForm = z.infer<typeof patientSchema>;

export default function PatientInfo() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { selectedPackage, selectedDate, selectedTime, patientInfo, setPatientInfo, memo, setMemo } =
    useReservationStore();

  // 로그인된 경우 DB에서 최신 회원정보 조회
  const { data: meData, isLoading: isMeLoading } = useQuery({
    queryKey: ['me'],
    queryFn: getMe,
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5, // 5분간 캐시
  });

  const dbUser = meData?.data;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PatientForm>({
    resolver: zodResolver(patientSchema),
    defaultValues: patientInfo || {
      name: '',
      phone: '',
      birthDate: '',
      gender: undefined,
    },
  });

  useEffect(() => {
    if (!selectedPackage || !selectedDate || !selectedTime) {
      navigate('/reservation/select-package');
    }
  }, [selectedPackage, selectedDate, selectedTime, navigate]);

  // YYYY-MM-DD 또는 ISO 날짜를 YYYYMMDD로 변환
  const formatBirthDate = (date: string | undefined): string => {
    if (!date) return '';
    // YYYY-MM-DD 또는 ISO 형식에서 숫자만 추출
    const cleaned = date.split('T')[0].replace(/-/g, '');
    return cleaned.length === 8 ? cleaned : '';
  };

  // DB에서 조회한 회원정보로 폼 채우기
  useEffect(() => {
    if (!patientInfo && dbUser) {
      reset({
        name: dbUser.name || '',
        phone: dbUser.phone || '',
        birthDate: formatBirthDate(dbUser.birthDate),
        gender: dbUser.gender || undefined,
      });
    } else if (!patientInfo && user && !isAuthenticated) {
      // 로그인 안 된 경우 기존 store의 user 정보 사용 (fallback)
      reset({
        name: user.name || '',
        phone: user.phone || '',
        birthDate: formatBirthDate(user.birthDate),
        gender: user.gender || undefined,
      });
    }
  }, [dbUser, user, patientInfo, isAuthenticated, reset]);

  const onSubmit = (data: PatientForm) => {
    setPatientInfo(data);
    navigate('/reservation/confirm');
  };

  const handleBack = () => {
    navigate('/reservation/select-date');
  };

  if (!selectedPackage || !selectedDate || !selectedTime) {
    return null;
  }

  // 로그인된 경우 회원정보 로딩 중
  if (isAuthenticated && isMeLoading) {
    return (
      <div className="max-w-xl mx-auto">
        <div className="card p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
          <p className="text-center text-gray-500 mt-4">회원정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <p className="text-gray-600 mb-6">수검자 정보를 입력해주세요.</p>

      {isAuthenticated && dbUser && (
        <div className="max-w-xl mx-auto mb-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
            회원정보가 자동으로 입력되었습니다. 수검자가 다른 경우 수정해주세요.
          </div>
        </div>
      )}

      <div className="max-w-xl mx-auto">
        <form onSubmit={handleSubmit(onSubmit)} className="card p-6 space-y-5">
          <Input
            label="수검자 이름"
            placeholder="홍길동"
            error={errors.name?.message}
            required
            {...register('name')}
          />

          <Input
            label="휴대폰 번호"
            placeholder="01012345678"
            error={errors.phone?.message}
            required
            {...register('phone')}
          />

          <Input
            label="생년월일"
            type="text"
            placeholder="19900101"
            maxLength={8}
            error={errors.birthDate?.message}
            required
            {...register('birthDate')}
          />

          <div>
            <label className="label">
              성별 <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="male"
                  className="mr-2"
                  {...register('gender')}
                />
                남성
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="female"
                  className="mr-2"
                  {...register('gender')}
                />
                여성
              </label>
            </div>
            {errors.gender && (
              <p className="mt-1 text-sm text-red-500">{errors.gender.message}</p>
            )}
          </div>

          <div>
            <label className="label">특이사항 (선택)</label>
            <textarea
              className="input min-h-[100px]"
              placeholder="알러지, 복용 중인 약 등 검진에 참고할 사항을 입력해주세요."
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
            />
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-between gap-3 pt-4">
            <Button type="button" variant="outline" onClick={handleBack} className="w-full sm:w-auto">
              이전
            </Button>
            <Button type="submit" size="lg" className="w-full sm:w-auto">
              다음 단계
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
