import { useState } from 'react';
import { Download, Database, AlertCircle, Users, Calendar, Trash2, Plus } from 'lucide-react';
import { toast } from 'react-toastify';
import Button from '../../components/common/Button';
import {
  downloadDatabaseBackup,
  generateSampleData,
  generateFakeUsers,
  clearTestData,
} from '../../api/admin';

export default function DatabaseAdmin() {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isGeneratingSample, setIsGeneratingSample] = useState(false);
  const [isGeneratingUsers, setIsGeneratingUsers] = useState(false);
  const [isClearingData, setIsClearingData] = useState(false);
  const [clearTarget, setClearTarget] = useState<'users' | 'reservations' | 'payments' | 'all'>('all');

  const handleBackup = async () => {
    setIsDownloading(true);
    try {
      await downloadDatabaseBackup();
      toast.success('데이터베이스 백업이 완료되었습니다.');
    } catch (error: any) {
      toast.error(error.response?.data?.message || '백업에 실패했습니다.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleGenerateSampleData = async () => {
    setIsGeneratingSample(true);
    try {
      const result = await generateSampleData();
      toast.success(result.message);
    } catch (error: any) {
      toast.error(error.response?.data?.message || '샘플 데이터 생성에 실패했습니다.');
    } finally {
      setIsGeneratingSample(false);
    }
  };

  const handleGenerateFakeUsers = async () => {
    if (!window.confirm('가짜 회원 1000명을 생성하시겠습니까?')) return;

    setIsGeneratingUsers(true);
    try {
      const result = await generateFakeUsers(1000);
      toast.success(result.message);
    } catch (error: any) {
      toast.error(error.response?.data?.message || '가짜 회원 생성에 실패했습니다.');
    } finally {
      setIsGeneratingUsers(false);
    }
  };

  const handleClearData = async () => {
    const targetLabels = {
      users: '가짜 회원',
      reservations: '모든 예약',
      payments: '모든 결제',
      all: '모든 테스트 데이터',
    };

    if (!window.confirm(`정말로 ${targetLabels[clearTarget]}을(를) 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`)) return;

    setIsClearingData(true);
    try {
      const result = await clearTestData(clearTarget);
      toast.success(result.message);
    } catch (error: any) {
      toast.error(error.response?.data?.message || '데이터 삭제에 실패했습니다.');
    } finally {
      setIsClearingData(false);
    }
  };

  return (
    <div>
      <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-8">DB 관리</h1>

      <div className="grid gap-6">
        {/* 백업 카드 */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Database className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">데이터베이스 백업</h2>
              <p className="text-sm text-gray-500">전체 데이터를 JSON 파일로 내보냅니다</p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <h3 className="font-medium text-gray-900 mb-2">백업에 포함되는 데이터:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>- 회원 정보 (users)</li>
              <li>- 예약 정보 (reservations)</li>
              <li>- 결제 정보 (payments)</li>
              <li>- 패키지 정보 (packages)</li>
              <li>- 병원 정보 (hospitals)</li>
              <li>- 차단 슬롯 (blockedSlots)</li>
            </ul>
          </div>

          <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg mb-4">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-yellow-800">
              백업 파일에는 민감한 정보가 포함될 수 있습니다. 안전한 곳에 보관해주세요.
            </p>
          </div>

          <Button
            onClick={handleBackup}
            isLoading={isDownloading}
            className="w-full sm:w-auto"
          >
            <Download className="w-4 h-4 mr-2" />
            백업 파일 다운로드
          </Button>
        </div>

        {/* 샘플 데이터 생성 카드 */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <Calendar className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">샘플 데이터 생성</h2>
              <p className="text-sm text-gray-500">테스트용 예약 데이터를 생성합니다</p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <p className="text-sm text-gray-600">
              기존 회원과 패키지를 기반으로 20개의 샘플 예약을 생성합니다.
              다양한 상태(대기, 확정, 완료, 취소)의 예약이 랜덤하게 생성됩니다.
            </p>
          </div>

          <Button
            onClick={handleGenerateSampleData}
            isLoading={isGeneratingSample}
            variant="outline"
            className="w-full sm:w-auto !border-green-500 !text-green-600 hover:!bg-green-50"
          >
            <Plus className="w-4 h-4 mr-2" />
            샘플 예약 데이터 생성
          </Button>
        </div>

        {/* 가짜 회원 생성 카드 */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">가짜 회원 생성</h2>
              <p className="text-sm text-gray-500">테스트용 회원 1000명을 생성합니다</p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <p className="text-sm text-gray-600">
              한국 이름을 가진 가짜 회원 1000명을 생성합니다.
              생성된 회원의 이메일은 fake*@test.com 형식이며, 비밀번호는 password123 입니다.
            </p>
          </div>

          <Button
            onClick={handleGenerateFakeUsers}
            isLoading={isGeneratingUsers}
            variant="outline"
            className="w-full sm:w-auto !border-purple-500 !text-purple-600 hover:!bg-purple-50"
          >
            <Users className="w-4 h-4 mr-2" />
            가짜 회원 1000명 생성
          </Button>
        </div>

        {/* 데이터 삭제 카드 */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-red-100 rounded-lg">
              <Trash2 className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">테스트 데이터 삭제</h2>
              <p className="text-sm text-gray-500">테스트용 데이터를 삭제합니다</p>
            </div>
          </div>

          <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg mb-4">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">
              주의: 가짜 회원(fake*@test.com)만 삭제됩니다. 예약과 결제는 모두 삭제됩니다.
              이 작업은 되돌릴 수 없습니다.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={clearTarget}
              onChange={(e) => setClearTarget(e.target.value as any)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="users">가짜 회원만 삭제</option>
              <option value="reservations">모든 예약 삭제</option>
              <option value="payments">모든 결제 삭제</option>
              <option value="all">전체 삭제 (가짜회원 + 예약 + 결제)</option>
            </select>
            <Button
              onClick={handleClearData}
              isLoading={isClearingData}
              variant="outline"
              className="!border-red-500 !text-red-600 hover:!bg-red-50"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              삭제 실행
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
