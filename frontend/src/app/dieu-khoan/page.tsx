import type { Metadata } from 'next'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Điều khoản sử dụng',
  description: 'Các điều khoản và điều kiện sử dụng dịch vụ tại Thầy Trần Chiến. Vui lòng đọc kỹ để hiểu quyền lợi và trách nhiệm của bạn.',
}

export default function TermsPage() {
  return (
    <main className="min-h-screen">
      <Navbar />

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-lg p-8 lg:p-12">
          <h1 className="text-center text-3xl font-heading font-bold text-secondary-900 mb-2">
            Điều khoản sử dụng
          </h1>

          <div className="prose prose-secondary max-w-none">
            <h2 className="text-xl font-heading font-semibold text-secondary-900 mt-8 mb-4">
              1. Giới thiệu
            </h2>
            <p className="text-secondary-600 mb-4 text-justify">
              Chào mừng bạn đến với Thầy Trần Chiến. Bằng việc truy cập và sử dụng website của chúng tôi, bạn đồng ý tuân thủ các điều khoản và điều kiện được quy định tại đây. Chúng tôi khuyến khích bạn đọc kỹ các điều khoản này trước khi bắt đầu sử dụng dịch vụ để đảm bảo quyền lợi của chính mình.
            </p>

            <h2 className="text-xl font-heading font-semibold text-secondary-900 mt-8 mb-4">
              2. Điều kiện sử dụng
            </h2>
            <p className="text-secondary-600 mb-4 text-justify">
              Để sử dụng dịch vụ của Thầy Trần Chiến, bạn cần đảm bảo rằng mình đăng ký với thông tin chính xác và đầy đủ. Người dùng phải có độ tuổi phù hợp hoặc có sự đồng ý của phụ huynh/người giám hộ khi tham gia các khóa học. Bạn cam kết bảo mật thông tin đăng nhập cá nhân và không sử dụng dịch vụ cho bất kỳ mục đích nào vi phạm pháp luật hoặc quy định hiện hành.
            </p>

            <h2 className="text-xl font-heading font-semibold text-secondary-900 mt-8 mb-4">
              3. Tài khoản người dùng
            </h2>
            <p className="text-secondary-600 mb-4 text-justify">
              Khi tạo tài khoản tại Thầy Trần Chiến, bạn có trách nhiệm duy trì tính bảo mật cho mật khẩu và thông tin đăng nhập của mình. Bất kỳ hoạt động nào diễn ra dưới tài khoản của bạn sẽ thuộc trách nhiệm của bạn. Nếu phát hiện bất kỳ hành vi truy cập trái phép nào, vui lòng thông báo ngay cho chúng tôi để được hỗ trợ kịp thời.
            </p>

            <h2 className="text-xl font-heading font-semibold text-secondary-900 mt-8 mb-4">
              4. Quyền sở hữu trí tuệ
            </h2>
            <p className="text-secondary-600 mb-4 text-justify">
              Toàn bộ nội dung trên Thầy Trần Chiến, bao gồm nhưng không giới hạn ở bài giảng, video, hình ảnh, bài tập và tài liệu, đều thuộc quyền sở hữu trí tuệ của Thầy Trần Chiến hoặc các đối tác được cấp phép. Bạn không được phép sao chép, phân phối, bán lại hoặc sử dụng nội dung cho mục đích thương mại mà không có sự đồng ý bằng văn bản từ chúng tôi. Mọi hành vi vi phạm bản quyền sẽ bị xử lý theo quy định.
            </p>

            <h2 className="text-xl font-heading font-semibold text-secondary-900 mt-8 mb-4">
              5. Thanh toán và hoàn tiền
            </h2>
            <p className="text-secondary-600 mb-4 text-justify">
              Đối với các khóa học có phí, việc thanh toán cần được thực hiện qua các kênh chính thức của Thầy Trần Chiến. Chúng tôi áp dụng chính sách hoàn tiền linh hoạt trong vòng 7 ngày kể từ ngày đăng ký, với điều kiện học viên chưa hoàn thành quá 30% nội dung khóa học. Điều này nhằm đảm bảo quyền lợi cho người học khi trải nghiệm dịch vụ.
            </p>

            <h2 className="text-xl font-heading font-semibold text-secondary-900 mt-8 mb-4">
              6. Hành vi bị cấm
            </h2>
            <p className="text-secondary-600 mb-4 text-justify">
              Môi trường học tập tại Thầy Trần Chiến đề cao sự văn minh và tôn trọng. Nghiêm cấm mọi hành vi quấy rối, đe dọa hoặc làm phiền người dùng khác. Bạn cũng không được phép đăng tải nội dung đồi trụy, vi phạm pháp luật hoặc cố ý xâm nhập trái phép vào hệ thống của chúng tôi. Việc chia sẻ tài khoản cho nhiều người sử dụng chung là không được phép.
            </p>

            <h2 className="text-xl font-heading font-semibold text-secondary-900 mt-8 mb-4">
              7. Giới hạn trách nhiệm
            </h2>
            <p className="text-secondary-600 mb-4 text-justify">
              Thầy Trần Chiến nỗ lực cung cấp dịch vụ tốt nhất nhưng không chịu trách nhiệm cho các gián đoạn do lỗi kỹ thuật bất khả kháng hoặc các sự cố ngoài tầm kiểm soát. Chúng tôi cũng không cam kết về kết quả học tập cụ thể, vì điều này phụ thuộc phần lớn vào nỗ lực cá nhân của mỗi học viên.
            </p>

            <h2 className="text-xl font-heading font-semibold text-secondary-900 mt-8 mb-4">
              8. Thay đổi điều khoản
            </h2>
            <p className="text-secondary-600 mb-4 text-justify">
              Chúng tôi có quyền cập nhật hoặc thay đổi các điều khoản sử dụng này bất cứ lúc nào để phù hợp với tình hình thực tế. Mọi thay đổi quan trọng sẽ được thông báo rõ ràng qua email hoặc trên trang chủ website. Việc tiếp tục sử dụng dịch vụ sau khi có thay đổi đồng nghĩa với việc bạn chấp nhận các điều khoản mới.
            </p>

            <h2 className="text-xl font-heading font-semibold text-secondary-900 mt-8 mb-4">
              9. Liên hệ
            </h2>
            <p className="text-secondary-600 mb-4 text-justify">
              Chúng tôi luôn sẵn sàng lắng nghe và giải đáp mọi thắc mắc của bạn liên quan đến Điều khoản sử dụng.
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
