import { useState, useRef } from 'react';
import { Download, Upload, Database, AlertCircle, Users, Calendar, Trash2, Plus, Settings, FileText } from 'lucide-react';
import { toast } from 'react-toastify';
import Button from '../../components/common/Button';
import {
  downloadDatabaseBackup,
  restoreDatabaseBackup,
  generateSampleData,
  generateFakeUsers,
  clearTestData,
  BackupType,
} from '../../api/admin';

export default function DatabaseAdmin() {
  const [downloadingType, setDownloadingType] = useState<BackupType | null>(null);
  const [restoringType, setRestoringType] = useState<BackupType | null>(null);
  const [isGeneratingSample, setIsGeneratingSample] = useState(false);
  const [isGeneratingUsers, setIsGeneratingUsers] = useState(false);
  const [isClearingData, setIsClearingData] = useState(false);
  const [clearTarget, setClearTarget] = useState<'users' | 'reservations' | 'payments' | 'all'>('all');

  const configFileInputRef = useRef<HTMLInputElement>(null);
  const operationsFileInputRef = useRef<HTMLInputElement>(null);
  const allFileInputRef = useRef<HTMLInputElement>(null);

  const handleBackup = async (type: BackupType) => {
    setDownloadingType(type);
    try {
      await downloadDatabaseBackup(type);
      const typeLabels = {
        config: '설정 데이터',
        operations: '운영 데이터',
        all: '전체 데이터',
      };
      toast.success(`${typeLabels[type]} 백업이 완료되었습니다.`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || '백업에 실패했습니다.');
    } finally {
      setDownloadingType(null);
    }
  };

  const handleRestore = async (type: BackupType, file: File) => {
    const typeLabels = {
      config: '설정 데이터',
      operations: '운영 데이터',
      all: '전체 데이터',
    };

    if (!window.confirm(`${typeLabels[type]}를 복원하시겠습니까?\n\n기존 데이터가 모두 삭제되고 백업 데이터로 대체됩니다.\n이 작업은 되돌릴 수 없습니다.`)) {
      return;
    }

    setRestoringType(type);
    try {
      const text = await file.text();
      const backupData = JSON.parse(text);

      // 백업 타입 검증
      if (type !== 'all' && backupData.backupType && backupData.backupType !== type) {
        toast.error(`백업 파일 타입이 일치하지 않습니다. (파일: ${backupData.backupType}, 선택: ${type})`);
        return;
      }

      const result = await restoreDatabaseBackup(backupData);
      toast.success(result.message);
    } catch (error: any) {
      if (error instanceof SyntaxError) {
        toast.error('유효하지 않은 JSON 파일입니다.');
      } else {
        toast.error(error.response?.data?.message || '복원에 실패했습니다.');
      }
    } finally {
      setRestoringType(null);
      // 파일 입력 초기화
      if (configFileInputRef.current) configFileInputRef.current.value = '';
      if (operationsFileInputRef.current) operationsFileInputRef.current.value = '';
      if (allFileInputRef.current) allFileInputRef.current.value = '';
    }
  };

  const handleFileSelect = (type: BackupType) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleRestore(type, file);
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
        {/* 설정 데이터 백업 카드 */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Settings className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">설정 데이터 백업</h2>
              <p className="text-sm text-gray-500">병원, 패키지, 검진항목 정보를 백업합니다</p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <h3 className="font-medium text-gray-900 mb-2">백업에 포함되는 데이터:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>- 병원 정보 (hospitals)</li>
              <li>- 패키지 정보 (packages)</li>
              <li>- 검진항목 정보 (examinationItems)</li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={() => handleBackup('config')}
              isLoading={downloadingType === 'config'}
              className="w-full sm:w-auto"
            >
              <Download className="w-4 h-4 mr-2" />
              백업
            </Button>
            <input
              ref={configFileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileSelect('config')}
              className="hidden"
            />
            <Button
              onClick={() => configFileInputRef.current?.click()}
              isLoading={restoringType === 'config'}
              variant="outline"
              className="w-full sm:w-auto !border-blue-500 !text-blue-600 hover:!bg-blue-50"
            >
              <Upload className="w-4 h-4 mr-2" />
              복원
            </Button>
          </div>
        </div>

        {/* 운영 데이터 백업 카드 */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">운영 데이터 백업</h2>
              <p className="text-sm text-gray-500">회원, 예약, 결제 정보를 백업합니다</p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <h3 className="font-medium text-gray-900 mb-2">백업에 포함되는 데이터:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>- 회원 정보 (users)</li>
              <li>- 예약 정보 (reservations)</li>
              <li>- 결제 정보 (payments)</li>
              <li>- 차단 슬롯 (blockedSlots)</li>
            </ul>
          </div>

          <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg mb-4">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-yellow-800">
              백업 파일에는 민감한 개인정보가 포함됩니다. 안전한 곳에 보관해주세요.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={() => handleBackup('operations')}
              isLoading={downloadingType === 'operations'}
              className="w-full sm:w-auto"
            >
              <Download className="w-4 h-4 mr-2" />
              백업
            </Button>
            <input
              ref={operationsFileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileSelect('operations')}
              className="hidden"
            />
            <Button
              onClick={() => operationsFileInputRef.current?.click()}
              isLoading={restoringType === 'operations'}
              variant="outline"
              className="w-full sm:w-auto !border-blue-500 !text-blue-600 hover:!bg-blue-50"
            >
              <Upload className="w-4 h-4 mr-2" />
              복원
            </Button>
          </div>
        </div>

        {/* 전체 백업 카드 */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Database className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">전체 데이터 백업</h2>
              <p className="text-sm text-gray-500">모든 데이터를 한 번에 백업합니다</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={() => handleBackup('all')}
              isLoading={downloadingType === 'all'}
              className="w-full sm:w-auto"
            >
              <Download className="w-4 h-4 mr-2" />
              백업
            </Button>
            <input
              ref={allFileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileSelect('all')}
              className="hidden"
            />
            <Button
              onClick={() => allFileInputRef.current?.click()}
              isLoading={restoringType === 'all'}
              variant="outline"
              className="w-full sm:w-auto !border-blue-500 !text-blue-600 hover:!bg-blue-50"
            >
              <Upload className="w-4 h-4 mr-2" />
              복원
            </Button>
          </div>
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
