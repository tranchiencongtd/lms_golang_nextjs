import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function TermsPage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      
      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-lg p-8 lg:p-12">
          <h1 className="text-3xl font-heading font-bold text-secondary-900 mb-2">
            Điều khoản sử dụng
          </h1>
          <p className="text-secondary-500 mb-8">
            Cập nhật lần cuối: 16/01/2026
          </p>

          <div className="prose prose-secondary max-w-none">
            <h2 className="text-xl font-heading font-semibold text-secondary-900 mt-8 mb-4">
              1. Giới thiệu
            </h2>
            <p className="text-secondary-600 mb-4">
              Chào mừng bạn đến với MathVN. Bằng việc truy cập và sử dụng website của chúng tôi, bạn đồng ý tuân thủ các điều khoản và điều kiện sau đây. Vui lòng đọc kỹ trước khi sử dụng dịch vụ.
            </p>

            <h2 className="text-xl font-heading font-semibold text-secondary-900 mt-8 mb-4">
              2. Điều kiện sử dụng
            </h2>
            <p className="text-secondary-600 mb-4">
              Để sử dụng dịch vụ của MathVN, bạn cần:
            </p>
            <ul className="list-disc list-inside text-secondary-600 space-y-2 mb-4">
              <li>Có độ tuổi phù hợp hoặc có sự đồng ý của phụ huynh/người giám hộ</li>
              <li>Cung cấp thông tin chính xác khi đăng ký tài khoản</li>
              <li>Bảo mật thông tin đăng nhập của mình</li>
              <li>Không sử dụng dịch vụ cho mục đích bất hợp pháp</li>
            </ul>

            <h2 className="text-xl font-heading font-semibold text-secondary-900 mt-8 mb-4">
              3. Tài khoản người dùng
            </h2>
            <p className="text-secondary-600 mb-4">
              Khi tạo tài khoản tại MathVN, bạn có trách nhiệm:
            </p>
            <ul className="list-disc list-inside text-secondary-600 space-y-2 mb-4">
              <li>Giữ bí mật mật khẩu và thông tin đăng nhập</li>
              <li>Thông báo ngay cho chúng tôi nếu phát hiện truy cập trái phép</li>
              <li>Chịu trách nhiệm cho mọi hoạt động diễn ra dưới tài khoản của bạn</li>
            </ul>

            <h2 className="text-xl font-heading font-semibold text-secondary-900 mt-8 mb-4">
              4. Quyền sở hữu trí tuệ
            </h2>
            <p className="text-secondary-600 mb-4">
              Tất cả nội dung trên MathVN bao gồm nhưng không giới hạn: bài giảng, video, hình ảnh, bài tập, và tài liệu đều thuộc quyền sở hữu của MathVN hoặc các đối tác được cấp phép. Bạn không được:
            </p>
            <ul className="list-disc list-inside text-secondary-600 space-y-2 mb-4">
              <li>Sao chép, phân phối, hoặc bán nội dung mà không có sự đồng ý</li>
              <li>Sử dụng nội dung cho mục đích thương mại</li>
              <li>Xóa hoặc thay đổi các thông báo về bản quyền</li>
            </ul>

            <h2 className="text-xl font-heading font-semibold text-secondary-900 mt-8 mb-4">
              5. Thanh toán và hoàn tiền
            </h2>
            <p className="text-secondary-600 mb-4">
              Đối với các khóa học có phí:
            </p>
            <ul className="list-disc list-inside text-secondary-600 space-y-2 mb-4">
              <li>Thanh toán được thực hiện qua các phương thức được hỗ trợ</li>
              <li>Chính sách hoàn tiền áp dụng trong vòng 7 ngày kể từ ngày mua</li>
              <li>Không hoàn tiền nếu đã hoàn thành trên 30% khóa học</li>
            </ul>

            <h2 className="text-xl font-heading font-semibold text-secondary-900 mt-8 mb-4">
              6. Hành vi bị cấm
            </h2>
            <p className="text-secondary-600 mb-4">
              Khi sử dụng MathVN, bạn không được:
            </p>
            <ul className="list-disc list-inside text-secondary-600 space-y-2 mb-4">
              <li>Quấy rối, đe dọa hoặc làm phiền người dùng khác</li>
              <li>Đăng tải nội dung vi phạm pháp luật hoặc không phù hợp</li>
              <li>Cố gắng truy cập trái phép vào hệ thống</li>
              <li>Chia sẻ tài khoản với người khác</li>
            </ul>

            <h2 className="text-xl font-heading font-semibold text-secondary-900 mt-8 mb-4">
              7. Giới hạn trách nhiệm
            </h2>
            <p className="text-secondary-600 mb-4">
              MathVN không chịu trách nhiệm cho:
            </p>
            <ul className="list-disc list-inside text-secondary-600 space-y-2 mb-4">
              <li>Gián đoạn dịch vụ do lỗi kỹ thuật</li>
              <li>Mất mát dữ liệu do sự cố ngoài tầm kiểm soát</li>
              <li>Kết quả học tập không như mong đợi</li>
            </ul>

            <h2 className="text-xl font-heading font-semibold text-secondary-900 mt-8 mb-4">
              8. Thay đổi điều khoản
            </h2>
            <p className="text-secondary-600 mb-4">
              MathVN có quyền thay đổi điều khoản sử dụng bất cứ lúc nào. Chúng tôi sẽ thông báo về các thay đổi quan trọng qua email hoặc thông báo trên website.
            </p>

            <h2 className="text-xl font-heading font-semibold text-secondary-900 mt-8 mb-4">
              9. Liên hệ
            </h2>
            <p className="text-secondary-600 mb-4">
              Nếu bạn có bất kỳ câu hỏi nào về Điều khoản sử dụng, vui lòng liên hệ:
            </p>
            <ul className="list-none text-secondary-600 space-y-2">
              <li><strong>Email:</strong> support@mathvn.edu.vn</li>
              <li><strong>Hotline:</strong> 1900 1234</li>
              <li><strong>Địa chỉ:</strong> 123 Đường ABC, Quận 1, TP. Hồ Chí Minh</li>
            </ul>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
