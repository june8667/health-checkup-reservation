import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useReservationStore } from '../../store/reservationStore';
import { useAuthStore } from '../../store/authStore';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

const patientSchema = z.object({
  name: z.string().min(2, '이름은 2자 이상이어야 합니다.'),
  phone: z.string().regex(/^01[0-9]{8,9}$/, '올바른 휴대폰 번호 형식이 아닙니다.'),
  birthDate: z.string().min(1, '생년월일을 입력해주세요.'),
  gender: z.enum(['male', 'female'], { required_error: '성별을 선택해주세요.' }),
});

type PatientForm = z.infer<typeof patientSchema>;

export default function PatientInfo() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const { selectedPackage, selectedDate, selectedTime, patientInfo, setPatientInfo, memo, setMemo } =
    useReservationStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PatientForm>({
    resolver: zodResolver(patientSchema),
    defaultValues: patientInfo || {
      name: user?.name || '',
      phone: user?.phone || '',
      birthDate: user?.birthDate?.split('T')[0] || '',
      gender: user?.gender || undefined,
    },
  });

  useEffect(() => {
    if (!selectedPackage || !selectedDate || !selectedTime) {
      navigate('/reservation/select-package');
    }
  }, [selectedPackage, selectedDate, selectedTime, navigate]);

  useEffect(() => {
    if (user && !patientInfo) {
      reset({
        name: user.name,
        phone: user.phone,
        birthDate: user.birthDate?.split('T')[0] || '',
        gender: user.gender,
      });
    }
  }, [user, patientInfo, reset]);

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

  return (
    <div>
      <p className="text-gray-600 mb-6">수검자 정보를 입력해주세요.</p>

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
            type="date"
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

          <div className="flex justify-between pt-4">
            <Button type="button" variant="outline" onClick={handleBack}>
              이전
            </Button>
            <Button type="submit" size="lg">
              다음 단계
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
