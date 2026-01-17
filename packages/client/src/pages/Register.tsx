import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-toastify';
import { register as registerApi, sendPhoneCode, verifyPhone } from '../api/auth';
import Button from '../components/common/Button';
import Input from '../components/common/Input';

const registerSchema = z.object({
  email: z.string().email('올바른 이메일 형식이 아닙니다.'),
  password: z.string().min(8, '비밀번호는 8자 이상이어야 합니다.'),
  passwordConfirm: z.string(),
  name: z.string().min(2, '이름은 2자 이상이어야 합니다.'),
  phone: z.string().regex(/^01[0-9]{8,9}$/, '올바른 휴대폰 번호 형식이 아닙니다.'),
  birthDate: z.string().min(1, '생년월일을 입력해주세요.'),
  gender: z.enum(['male', 'female'], { required_error: '성별을 선택해주세요.' }),
  marketingConsent: z.boolean().optional(),
}).refine((data) => data.password === data.passwordConfirm, {
  message: '비밀번호가 일치하지 않습니다.',
  path: ['passwordConfirm'],
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function Register() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const phone = watch('phone');

  const handleSendCode = async () => {
    if (!phone || !/^01[0-9]{8,9}$/.test(phone)) {
      toast.error('올바른 휴대폰 번호를 입력해주세요.');
      return;
    }

    setIsSendingCode(true);
    try {
      await sendPhoneCode(phone);
      toast.success('인증번호가 발송되었습니다.');
    } catch (error: any) {
      toast.error(error.response?.data?.message || '인증번호 발송에 실패했습니다.');
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast.error('6자리 인증번호를 입력해주세요.');
      return;
    }

    setIsVerifying(true);
    try {
      await verifyPhone(phone, verificationCode);
      setIsPhoneVerified(true);
      toast.success('휴대폰 인증이 완료되었습니다.');
    } catch (error: any) {
      toast.error(error.response?.data?.message || '인증에 실패했습니다.');
    } finally {
      setIsVerifying(false);
    }
  };

  const onSubmit = async (data: RegisterForm) => {
    if (!isPhoneVerified) {
      toast.error('휴대폰 인증을 완료해주세요.');
      return;
    }

    setIsLoading(true);
    try {
      const { passwordConfirm, ...registerData } = data;
      await registerApi(registerData);
      toast.success('회원가입이 완료되었습니다. 로그인해주세요.');
      navigate('/login');
    } catch (error: any) {
      toast.error(error.response?.data?.message || '회원가입에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-200px)] py-12 px-4">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">회원가입</h1>
          <p className="mt-2 text-gray-600">
            이미 계정이 있으신가요?{' '}
            <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
              로그인
            </Link>
          </p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              label="이메일"
              type="email"
              placeholder="example@email.com"
              error={errors.email?.message}
              required
              {...register('email')}
            />

            <Input
              label="비밀번호"
              type="password"
              placeholder="8자 이상 입력하세요"
              error={errors.password?.message}
              required
              {...register('password')}
            />

            <Input
              label="비밀번호 확인"
              type="password"
              placeholder="비밀번호를 다시 입력하세요"
              error={errors.passwordConfirm?.message}
              required
              {...register('passwordConfirm')}
            />

            <Input
              label="이름"
              placeholder="홍길동"
              error={errors.name?.message}
              required
              {...register('name')}
            />

            <div>
              <label className="label">휴대폰 번호 <span className="text-red-500">*</span></label>
              <div className="flex gap-2">
                <Input
                  placeholder="01012345678"
                  error={errors.phone?.message}
                  disabled={isPhoneVerified}
                  {...register('phone')}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSendCode}
                  isLoading={isSendingCode}
                  disabled={isPhoneVerified}
                  className="whitespace-nowrap"
                >
                  {isPhoneVerified ? '인증완료' : '인증번호'}
                </Button>
              </div>
              {!isPhoneVerified && phone && (
                <div className="flex gap-2 mt-2">
                  <Input
                    placeholder="인증번호 6자리"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    maxLength={6}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleVerifyCode}
                    isLoading={isVerifying}
                    className="whitespace-nowrap"
                  >
                    확인
                  </Button>
                </div>
              )}
            </div>

            <Input
              label="생년월일"
              type="date"
              error={errors.birthDate?.message}
              required
              {...register('birthDate')}
            />

            <div>
              <label className="label">성별 <span className="text-red-500">*</span></label>
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
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="mr-2"
                  {...register('marketingConsent')}
                />
                <span className="text-sm text-gray-600">마케팅 정보 수신에 동의합니다. (선택)</span>
              </label>
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              isLoading={isLoading}
            >
              회원가입
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
