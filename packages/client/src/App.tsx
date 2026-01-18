import { Routes, Route } from 'react-router-dom';
import Layout from './components/common/Layout';
import ProtectedRoute from './components/common/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Packages from './pages/Packages';
import PackageDetail from './pages/PackageDetail';
import ReservationLayout from './pages/Reservation/ReservationLayout';
import SelectPackage from './pages/Reservation/SelectPackage';
import SelectDate from './pages/Reservation/SelectDate';
import PatientInfo from './pages/Reservation/PatientInfo';
import ReservationConfirm from './pages/Reservation/ReservationConfirm';
import ReservationComplete from './pages/Reservation/ReservationComplete';
import Payment from './pages/Payment';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentFail from './pages/PaymentFail';
import MyPage from './pages/MyPage/index';
import MyReservations from './pages/MyPage/MyReservations';
import MyPayments from './pages/MyPage/MyPayments';
import Profile from './pages/MyPage/Profile';
import NotFound from './pages/NotFound';
import AdminLayout from './pages/Admin/AdminLayout';
import AdminDashboard from './pages/Admin/Dashboard';
import AdminReservations from './pages/Admin/Reservations';
import AdminPayments from './pages/Admin/Payments';
import AdminUsers from './pages/Admin/Users';
import AdminPackages from './pages/Admin/Packages';
import AdminSchedule from './pages/Admin/Schedule';
import AdminDatabase from './pages/Admin/Database';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        {/* Public routes */}
        <Route index element={<Home />} />
        <Route path="packages" element={<Packages />} />
        <Route path="packages/:id" element={<PackageDetail />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />

        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="reservation" element={<ReservationLayout />}>
            <Route index element={<SelectPackage />} />
            <Route path="select-package" element={<SelectPackage />} />
            <Route path="select-date" element={<SelectDate />} />
            <Route path="patient-info" element={<PatientInfo />} />
            <Route path="confirm" element={<ReservationConfirm />} />
          </Route>
          <Route path="reservation/complete/:id" element={<ReservationComplete />} />

          <Route path="payment/:reservationId" element={<Payment />} />
          <Route path="payment/success" element={<PaymentSuccess />} />
          <Route path="payment/fail" element={<PaymentFail />} />

          <Route path="mypage" element={<MyPage />}>
            <Route index element={<MyReservations />} />
            <Route path="reservations" element={<MyReservations />} />
            <Route path="payments" element={<MyPayments />} />
            <Route path="profile" element={<Profile />} />
          </Route>
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Route>

      {/* Admin routes */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="reservations" element={<AdminReservations />} />
        <Route path="payments" element={<AdminPayments />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="packages" element={<AdminPackages />} />
        <Route path="schedule" element={<AdminSchedule />} />
        <Route path="database" element={<AdminDatabase />} />
      </Route>
    </Routes>
  );
}

export default App;
