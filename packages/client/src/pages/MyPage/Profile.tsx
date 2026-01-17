import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-toastify';
import { useAuthStore } from '../../store/authStore';
import { updateMe } from '../../api/auth';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { GENDER_LABELS } from '../../constants/labels';

const profileSchema = z.object({
  name: z.string().min(2, '이름은 2자 이상이어야 합니다.'),
  phone: z.string().regex(/^01[0-9]{8,9}$/, '올바른 휴대폰 번호 형식이 아닙니다.'),
  address: z.object({
    zipCode: z.string().optional(),
    address1: z.string().optional(),
    address2: z.string().optional(),
  }).optional(),
  marketingConsent: z.boolean().optional(),
});

type ProfileForm = z.infer<typeof profileSchema>;

export default function Profile() {
  const { user, setAuth } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      phone: user?.phone || '',
      address: user?.address || {},
      marketingConsent: user?.marketingConsent || false,
    },
  });

  const onSubmit = async (data: ProfileForm) => {
    setIsLoading(true);
    try {
      const response = await updateMe(data);
      if (response.success && response.data) {
        const accessToken = useAuthStore.getState().accessToken;
        setAuth(response.data, accessToken!);
        toast.success('정보가 수정되었습니다.');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || '정보 수정에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-6">내 정보</h2>

      <div className="card p-6">
        {/* Read-only info */}
        <div className="mb-6 pb-6 border-b border-gray-200">
          <h3 className="font-medium text-gray-900 mb-4">기본 정보</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">이메일</span>
              <p className="font-medium">{user.email}</p>
            </div>
            <div>
              <span className="text-gray-500">생년월일</span>
              <p className="font-medium">{user.birthDate?.split('T')[0]}</p>
            </div>
            <div>
              <span className="text-gray-500">성별</span>
              <p className="font-medium">{GENDER_LABELS[user.gender]}</p>
            </div>
            <div>
              <span className="text-gray-500">가입일</span>
              <p className="font-medium">{user.createdAt?.split('T')[0]}</p>
            </div>
          </div>
        </div>

        {/* Editable info */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <h3 className="font-medium text-gray-900">수정 가능한 정보</h3>

          <Input
            label="이름"
            error={errors.name?.message}
            {...register('name')}
          />

          <Input
            label="휴대폰 번호"
            placeholder="01012345678"
            error={errors.phone?.message}
            {...register('phone')}
          />

          <div className="space-y-3">
            <label className="label">주소</label>
            <div className="flex gap-2">
              <Input
                placeholder="우편번호"
                className="w-32"
                {...register('address.zipCode')}
              />
              <Button type="button" variant="outline" size="sm">
                검색
              </Button>
            </div>
            <Input
              placeholder="기본주소"
              {...register('address.address1')}
            />
            <Input
              placeholder="상세주소"
              {...register('address.address2')}
            />
          </div>

          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                className="mr-2"
                {...register('marketingConsent')}
              />
              <span className="text-sm text-gray-600">마케팅 정보 수신 동의</span>
            </label>
          </div>

          <div className="pt-4">
            <Button type="submit" isLoading={isLoading}>
              정보 수정
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
