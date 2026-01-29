import type { Metadata } from 'next'
import Link from 'next/link'
import { Shield } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Chính sách bảo mật',
  description: 'Cam kết bảo mật thông tin cá nhân của Thầy Trần Chiến. Tìm hiểu cách chúng tôi thu thập, sử dụng và bảo vệ dữ liệu của bạn.',
}

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
            </div>
          </div>

          <div className="bg-primary-50 border border-primary-100 rounded-xl p-4 mb-8">
            <p className="text-primary-800 text-sm">
              <strong>Cam kết của chúng tôi:</strong> Thầy Trần Chiến cam kết bảo vệ quyền riêng tư của bạn. Chính sách này giải thích cách chúng tôi thu thập, sử dụng và bảo vệ thông tin cá nhân của bạn.
            </p>
          </div>

          <div className="prose prose-secondary max-w-none">
            <h2 className="text-xl font-heading font-semibold text-secondary-900 mt-8 mb-4">
              1. Thông tin chúng tôi thu thập
            </h2>
            <p className="text-secondary-600 mb-4 text-justify">
              Để cung cấp dịch vụ tốt nhất, chúng tôi thu thập một số thông tin cần thiết từ người dùng. Những thông tin này bao gồm dữ liệu bạn cung cấp trực tiếp như họ tên, số điện thoại, email và thông tin học sinh (đối với tài khoản phụ huynh). Ngoài ra, hệ thống cũng tự động ghi nhận các thông tin kỹ thuật như địa chỉ IP, loại thiết bị, trình duyệt sử dụng và dữ liệu về quá trình học tập của bạn trên nền tảng để tối ưu hóa trải nghiệm.
            </p>

            <h2 className="text-xl font-heading font-semibold text-secondary-900 mt-8 mb-4">
              2. Mục đích sử dụng thông tin
            </h2>
            <p className="text-secondary-600 mb-4 text-justify">
              Chúng tôi sử dụng thông tin thu thập được chủ yếu để vận hành và cải thiện chất lượng dịch vụ giáo dục. Cụ thể, dữ liệu giúp chúng tôi cá nhân hóa lộ trình học tập, liên lạc hỗ trợ kịp thời, xử lý các giao dịch thanh toán và gửi thông báo về các cập nhật quan trọng. Bên cạnh đó, các dữ liệu tổng hợp cũng được dùng để phân tích xu hướng người dùng nhằm nâng cấp tính năng hệ thống và bảo vệ an ninh mạng.
            </p>

            <h2 className="text-xl font-heading font-semibold text-secondary-900 mt-8 mb-4">
              3. Chia sẻ thông tin
            </h2>
            <p className="text-secondary-600 mb-4 text-justify">
              Thầy Trần Chiến cam kết không bán hoặc cho thuê thông tin cá nhân của bạn cho bất kỳ bên thứ ba nào. Chúng tôi chỉ chia sẻ dữ liệu trong những trường hợp thực sự cần thiết, chẳng hạn như cung cấp thông tin cho giáo viên để hỗ trợ học tập, chia sẻ với phụ huynh để theo dõi tiến độ của con em, hoặc hợp tác với các đối tác thanh toán uy tín để xử lý giao dịch. Trong một số tình huống đặc biệt, chúng tôi có thể phải cung cấp thông tin theo yêu cầu của cơ quan pháp luật có thẩm quyền.
            </p>

            <h2 className="text-xl font-heading font-semibold text-secondary-900 mt-8 mb-4">
              4. Bảo mật thông tin
            </h2>
            <p className="text-secondary-600 mb-4 text-justify">
              An toàn dữ liệu là ưu tiên hàng đầu tại Thầy Trần Chiến. Chúng tôi áp dụng các tiêu chuẩn bảo mật công nghệ cao như mã hóa SSL/TLS cho toàn bộ kết nối, lưu trữ mật khẩu dưới dạng mã hóa một chiều và thực hiện sao lưu dữ liệu định kỳ. Hệ thống của chúng tôi cũng được giám sát liên tục để ngăn chặn các nỗ lực truy cập trái phép và các mối đe dọa an ninh tiềm ẩn.
            </p>

            <h2 className="text-xl font-heading font-semibold text-secondary-900 mt-8 mb-4">
              5. Quyền của bạn
            </h2>
            <p className="text-secondary-600 mb-4 text-justify">
              Là người dùng, bạn có toàn quyền kiểm soát dữ liệu cá nhân của mình. Bạn có thể yêu cầu truy cập, chỉnh sửa hoặc xóa thông tin tài khoản bất cứ lúc nào. Ngoài ra, bạn cũng có quyền từ chối nhận các thông tin quảng cáo hoặc yêu cầu chúng tôi cung cấp bản sao dữ liệu cá nhân mà hệ thống đang lưu trữ.
            </p>

            <h2 className="text-xl font-heading font-semibold text-secondary-900 mt-8 mb-4">
              6. Cookie và công nghệ theo dõi
            </h2>
            <p className="text-secondary-600 mb-4 text-justify">
              Website của chúng tôi sử dụng cookie để lưu trữ phiên đăng nhập và ghi nhớ các tùy chọn cá nhân của bạn, giúp trải nghiệm duyệt web trở nên mượt mà hơn. Cookie cũng hỗ trợ chúng tôi trong việc phân tích lưu lượng truy cập để hiểu rõ hơn về nhu cầu người dùng. Bạn hoàn toàn có thể tùy chỉnh cài đặt cookie trên trình duyệt của mình, tuy nhiên điều này có thể ảnh hưởng đến một số tính năng của trang web.
            </p>

            <h2 className="text-xl font-heading font-semibold text-secondary-900 mt-8 mb-4">
              7. Bảo vệ trẻ em
            </h2>
            <p className="text-secondary-600 mb-4 text-justify">
              Chúng tôi đặc biệt chú trọng đến việc bảo vệ quyền riêng tư của trẻ em trên không gian mạng. Đối với học sinh dưới 13 tuổi, việc đăng ký tài khoản bắt buộc phải có sự đồng ý và giám sát của phụ huynh hoặc người giám hộ. Chúng tôi không thu thập các thông tin nhạy cảm từ trẻ em và cung cấp công cụ để phụ huynh có thể dễ dàng quản lý tài khoản của con mình.
            </p>

            <h2 className="text-xl font-heading font-semibold text-secondary-900 mt-8 mb-4">
              8. Lưu trữ dữ liệu
            </h2>
            <p className="text-secondary-600 mb-4 text-justify">
              Thông tin cá nhân của bạn sẽ được lưu trữ trong suốt thời gian tài khoản hoạt động. Đối với các tài khoản không hoạt động, dữ liệu sẽ được lưu giữ trong vòng 2 năm kể từ lần đăng nhập cuối cùng trước khi bị xóa bỏ hoặc ẩn danh hóa. Riêng các dữ liệu liên quan đến giao dịch tài chính sẽ được lưu trữ trong 5 năm tuân theo quy định của pháp luật kế toán.
            </p>

            <h2 className="text-xl font-heading font-semibold text-secondary-900 mt-8 mb-4">
              9. Thay đổi chính sách
            </h2>
            <p className="text-secondary-600 mb-4 text-justify">
              Chính sách bảo mật này có thể được cập nhật theo thời gian để phản ánh các thay đổi trong quy trình hoạt động hoặc quy định pháp luật. Mọi thay đổi quan trọng sẽ được chúng tôi thông báo rõ ràng qua email hoặc ngay trên giao diện website để bạn kịp thời nắm bắt.
            </p>

            <h2 className="text-xl font-heading font-semibold text-secondary-900 mt-8 mb-4">
              10. Liên hệ
            </h2>
            <p className="text-secondary-600 mb-4 text-justify">
              Nếu bạn có bất kỳ câu hỏi nào về Chính sách bảo mật, vui lòng liên hệ với chúng tôi qua các kênh dưới đây để được giải đáp chi tiết.
            </p>
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="flex flex-col gap-3 text-secondary-700">
                <p><span className="font-semibold w-24 inline-block">Email:</span></p>
                <p><span className="font-semibold w-24 inline-block">Hotline:</span></p>
                <p><span className="font-semibold w-24 inline-block">Địa chỉ:</span></p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
