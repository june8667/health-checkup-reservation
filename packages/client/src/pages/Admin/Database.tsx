import { useState } from 'react';
import { Download, Database, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import Button from '../../components/common/Button';
import { downloadDatabaseBackup } from '../../api/admin';

export default function DatabaseAdmin() {
  const [isDownloading, setIsDownloading] = useState(false);

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

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">DB 관리</h1>

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
      </div>
    </div>
  );
}
