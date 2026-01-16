import Link from 'next/link'
import { Shield } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen">
      <Navbar />

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-lg p-8 lg:p-12">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center">
              <Shield className="w-7 h-7 text-primary-600" />
            </div>
            <div>
              <h1 className="text-3xl font-heading font-bold text-secondary-900">
                Chính sách bảo mật
              </h1>
              <p className="text-secondary-500">
                Cập nhật lần cuối: 16/01/2026
              </p>
            </div>
          </div>

          <div className="bg-primary-50 border border-primary-100 rounded-xl p-4 mb-8">
            <p className="text-primary-800 text-sm">
              <strong>Cam kết của chúng tôi:</strong> MathVN cam kết bảo vệ quyền riêng tư của bạn. Chính sách này giải thích cách chúng tôi thu thập, sử dụng và bảo vệ thông tin cá nhân của bạn.
            </p>
          </div>

          <div className="prose prose-secondary max-w-none">
            <h2 className="text-xl font-heading font-semibold text-secondary-900 mt-8 mb-4">
              1. Thông tin chúng tôi thu thập
            </h2>
            <p className="text-secondary-600 mb-4">
              Chúng tôi có thể thu thập các loại thông tin sau:
            </p>
            
            <h3 className="text-lg font-semibold text-secondary-800 mt-6 mb-3">
              1.1. Thông tin bạn cung cấp trực tiếp
            </h3>
            <ul className="list-disc list-inside text-secondary-600 space-y-2 mb-4">
              <li>Họ tên, tên tài khoản</li>
              <li>Địa chỉ email (nếu cung cấp)</li>
              <li>Số điện thoại</li>
              <li>Thông tin thanh toán (nếu mua khóa học)</li>
              <li>Thông tin học sinh: lớp, năm sinh, lực học</li>
            </ul>

            <h3 className="text-lg font-semibold text-secondary-800 mt-6 mb-3">
              1.2. Thông tin tự động thu thập
            </h3>
            <ul className="list-disc list-inside text-secondary-600 space-y-2 mb-4">
              <li>Địa chỉ IP và thông tin thiết bị</li>
              <li>Loại trình duyệt và hệ điều hành</li>
              <li>Thời gian truy cập và các trang đã xem</li>
              <li>Tiến độ học tập và kết quả bài kiểm tra</li>
            </ul>

            <h2 className="text-xl font-heading font-semibold text-secondary-900 mt-8 mb-4">
              2. Mục đích sử dụng thông tin
            </h2>
            <p className="text-secondary-600 mb-4">
              Chúng tôi sử dụng thông tin của bạn để:
            </p>
            <ul className="list-disc list-inside text-secondary-600 space-y-2 mb-4">
              <li>Cung cấp và cải thiện dịch vụ học tập</li>
              <li>Cá nhân hóa trải nghiệm học tập của bạn</li>
              <li>Liên lạc về khóa học, cập nhật và hỗ trợ</li>
              <li>Xử lý thanh toán và giao dịch</li>
              <li>Gửi thông tin khuyến mãi (nếu bạn đồng ý)</li>
              <li>Phân tích và cải thiện nền tảng</li>
              <li>Bảo vệ an ninh và ngăn chặn gian lận</li>
            </ul>

            <h2 className="text-xl font-heading font-semibold text-secondary-900 mt-8 mb-4">
              3. Chia sẻ thông tin
            </h2>
            <p className="text-secondary-600 mb-4">
              Chúng tôi <strong>không bán</strong> thông tin cá nhân của bạn. Chúng tôi chỉ chia sẻ thông tin trong các trường hợp sau:
            </p>
            <ul className="list-disc list-inside text-secondary-600 space-y-2 mb-4">
              <li><strong>Với giáo viên:</strong> Để hỗ trợ quá trình học tập của bạn</li>
              <li><strong>Với phụ huynh:</strong> Nếu học sinh dưới 18 tuổi</li>
              <li><strong>Đối tác thanh toán:</strong> Để xử lý giao dịch an toàn</li>
              <li><strong>Theo yêu cầu pháp luật:</strong> Khi được yêu cầu bởi cơ quan có thẩm quyền</li>
            </ul>

            <h2 className="text-xl font-heading font-semibold text-secondary-900 mt-8 mb-4">
              4. Bảo mật thông tin
            </h2>
            <p className="text-secondary-600 mb-4">
              Chúng tôi áp dụng các biện pháp bảo mật để bảo vệ thông tin của bạn:
            </p>
            <ul className="list-disc list-inside text-secondary-600 space-y-2 mb-4">
              <li>Mã hóa SSL/TLS cho tất cả kết nối</li>
              <li>Mã hóa mật khẩu bằng thuật toán an toàn</li>
              <li>Giới hạn quyền truy cập dữ liệu</li>
              <li>Sao lưu dữ liệu thường xuyên</li>
              <li>Giám sát và phát hiện xâm nhập</li>
            </ul>

            <h2 className="text-xl font-heading font-semibold text-secondary-900 mt-8 mb-4">
              5. Quyền của bạn
            </h2>
            <p className="text-secondary-600 mb-4">
              Bạn có các quyền sau đối với dữ liệu cá nhân:
            </p>
            <ul className="list-disc list-inside text-secondary-600 space-y-2 mb-4">
              <li><strong>Quyền truy cập:</strong> Xem thông tin chúng tôi lưu trữ về bạn</li>
              <li><strong>Quyền chỉnh sửa:</strong> Cập nhật thông tin không chính xác</li>
              <li><strong>Quyền xóa:</strong> Yêu cầu xóa tài khoản và dữ liệu</li>
              <li><strong>Quyền từ chối:</strong> Từ chối nhận email marketing</li>
              <li><strong>Quyền xuất dữ liệu:</strong> Nhận bản sao dữ liệu của bạn</li>
            </ul>

            <h2 className="text-xl font-heading font-semibold text-secondary-900 mt-8 mb-4">
              6. Cookie và công nghệ theo dõi
            </h2>
            <p className="text-secondary-600 mb-4">
              Chúng tôi sử dụng cookie để:
            </p>
            <ul className="list-disc list-inside text-secondary-600 space-y-2 mb-4">
              <li>Duy trì phiên đăng nhập của bạn</li>
              <li>Ghi nhớ tùy chọn cá nhân</li>
              <li>Phân tích lưu lượng truy cập</li>
              <li>Cải thiện trải nghiệm người dùng</li>
            </ul>
            <p className="text-secondary-600 mb-4">
              Bạn có thể quản lý cookie trong cài đặt trình duyệt. Tuy nhiên, việc tắt cookie có thể ảnh hưởng đến một số chức năng.
            </p>

            <h2 className="text-xl font-heading font-semibold text-secondary-900 mt-8 mb-4">
              7. Bảo vệ trẻ em
            </h2>
            <p className="text-secondary-600 mb-4">
              MathVN cam kết bảo vệ quyền riêng tư của trẻ em:
            </p>
            <ul className="list-disc list-inside text-secondary-600 space-y-2 mb-4">
              <li>Học sinh dưới 13 tuổi cần có sự đồng ý của phụ huynh</li>
              <li>Không thu thập thông tin nhạy cảm từ trẻ em</li>
              <li>Phụ huynh có thể xem và quản lý tài khoản con em</li>
            </ul>

            <h2 className="text-xl font-heading font-semibold text-secondary-900 mt-8 mb-4">
              8. Lưu trữ dữ liệu
            </h2>
            <p className="text-secondary-600 mb-4">
              Chúng tôi lưu trữ thông tin của bạn trong thời gian:
            </p>
            <ul className="list-disc list-inside text-secondary-600 space-y-2 mb-4">
              <li>Tài khoản hoạt động: Cho đến khi bạn yêu cầu xóa</li>
              <li>Tài khoản không hoạt động: 2 năm sau lần đăng nhập cuối</li>
              <li>Dữ liệu giao dịch: 5 năm theo quy định pháp luật</li>
            </ul>

            <h2 className="text-xl font-heading font-semibold text-secondary-900 mt-8 mb-4">
              9. Thay đổi chính sách
            </h2>
            <p className="text-secondary-600 mb-4">
              Chúng tôi có thể cập nhật Chính sách bảo mật này theo thời gian. Những thay đổi quan trọng sẽ được thông báo qua:
            </p>
            <ul className="list-disc list-inside text-secondary-600 space-y-2 mb-4">
              <li>Email đến địa chỉ đăng ký của bạn</li>
              <li>Thông báo trên website</li>
              <li>Thông báo trong ứng dụng</li>
            </ul>

            <h2 className="text-xl font-heading font-semibold text-secondary-900 mt-8 mb-4">
              10. Liên hệ
            </h2>
            <p className="text-secondary-600 mb-4">
              Nếu bạn có câu hỏi về Chính sách bảo mật hoặc muốn thực hiện quyền của mình, vui lòng liên hệ:
            </p>
            <div className="bg-gray-50 rounded-xl p-6">
              <ul className="list-none text-secondary-600 space-y-3">
                <li className="flex items-center gap-3">
                  <span className="font-semibold w-24">Email:</span>
                  <span>privacy@mathvn.edu.vn</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="font-semibold w-24">Hotline:</span>
                  <span>1900 1234</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="font-semibold w-24">Địa chỉ:</span>
                  <span>123 Đường ABC, Quận 1, TP. Hồ Chí Minh</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
